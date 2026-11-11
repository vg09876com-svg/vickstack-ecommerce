
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");

// Escape customer information before placing it inside HTML emails.
const escapeHtml = (value = "") => {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
};

// Restore reserved stock if order creation fails.
const restoreReservedStock = async (reservedItems) => {
  await Promise.all(
    reservedItems.map((item) =>
      Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity } }
      )
    )
  );
};

// CREATE ORDER
const createOrder = async (req, res) => {
  const reservedItems = [];

  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    // Validate order items.
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    // Validate shipping information.
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "state",
    ];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) =>
          !String(shippingAddress[field] || "").trim()
      )
    ) {
      return res.status(400).json({
        message: "Please provide complete shipping information.",
      });
    }

    // Combine duplicate products into one item.
    const quantities = new Map();

    for (const item of orderItems) {
      if (
        !mongoose.Types.ObjectId.isValid(item.product)
      ) {
        return res.status(400).json({
          message: "An order contains an invalid product ID.",
        });
      }

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          message: "Product quantities must be positive whole numbers.",
        });
      }

      const productId = String(item.product);

      quantities.set(
        productId,
        (quantities.get(productId) || 0) + quantity
      );
    }

    const savedOrderItems = [];
    let subtotal = 0;

    // Reserve stock for every product.
    for (const [productId, quantity] of quantities) {
      // Atomically deduct stock only if enough is available.
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
        },
        {
          
  returnDocument: "after",
}
        
      );

      if (!product) {
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
          await restoreReservedStock(reservedItems);

          return res.status(404).json({
            message: "One of the products in your order no longer exists.",
          });
        }

        await restoreReservedStock(reservedItems);

        return res.status(400).json({
          message: `Insufficient stock for ${existingProduct.name}. Available stock: ${existingProduct.stock}.`,
        });
      }

      // Remember the deduction so it can be reversed if necessary.
      reservedItems.push({
        productId: product._id,
        quantity,
      });

      savedOrderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });

      subtotal += product.price * quantity;
    }

    // Add delivery fee.
    const deliveryFee = 5000;
    const totalPrice = subtotal + deliveryFee;

    // Save the order.
    const order = await Order.create({
      user: req.user._id,
      orderItems: savedOrderItems,
      shippingAddress,
      totalPrice,
      paymentMethod: paymentMethod || "Cash on Delivery",
      stockDeducted: true,
      stockRestored: false,
    });

    // Send order confirmation email.
    const customerName = escapeHtml(shippingAddress.fullName);

    const emailItems = savedOrderItems
      .map(
        (item) => `
          <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.quantity}</td>
            <td>₦${item.price.toLocaleString("en-NG")}</td>
          </tr>
        `
      )
      .join("");

    const confirmationEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">VICKSTACK.</h2>

        <h3>Order Confirmation</h3>

        <p>Hello ${customerName},</p>

        <p>Thank you for shopping with VICKSTACK!</p>

        <p>Your order has been received successfully.</p>

        <h3>Order Details</h3>

        <p>Order ID: ${order._id}</p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th align="left">Product</th>
              <th align="left">Quantity</th>
              <th align="left">Price</th>
            </tr>
          </thead>

          <tbody>
            ${emailItems}
          </tbody>
        </table>

        <h3>Delivery Fee: ₦${deliveryFee.toLocaleString("en-NG")}</h3>

        <h3>Total: ₦${totalPrice.toLocaleString("en-NG")}</h3>

        <p>Order Status: Pending</p>

        <p>We will notify you when your order status changes.</p>

        <p>Thank you for choosing VICKSTACK.</p>
      </div>
    `;

    await sendEmail(
      shippingAddress.email,
      "Your VICKSTACK Order Confirmation",
      confirmationEmail
    );

    return res.status(201).json({
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    // If order creation failed, return reserved stock.
    if (reservedItems.length > 0) {
      try {
        await restoreReservedStock(reservedItems);
      } catch (rollbackError) {
        console.error(
          "Stock rollback failed:",
          rollbackError.message
        );
      }
    }

    return res.status(500).json({
      message: "Something went wrong while placing your order.",
      error: error.message,
    });
  }
};

// GET LOGGED-IN USER'S ORDERS
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    })
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Your orders retrieved successfully.",
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      message: "Unable to retrieve your orders.",
      error: error.message,
    });
  }
};

// GET ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All orders retrieved successfully.",
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      message: "Unable to retrieve orders.",
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS (ADMIN)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const previousStatus = order.orderStatus;

    // Do not allow a cancelled order to be reopened.
    if (
      previousStatus === "Cancelled" &&
      orderStatus !== "Cancelled"
    ) {
      return res.status(400).json({
        message: "A cancelled order cannot be reopened. Please create a new order.",
      });
    }

    // Do nothing if the status has not changed.
    if (previousStatus === orderStatus) {
      return res.status(200).json({
        message: "Order status is already set to this value.",
        order,
      });
    }

    // Restore stock when an eligible order is cancelled.
    if (
      orderStatus === "Cancelled" &&
      order.stockDeducted &&
      !order.stockRestored
    ) {
      for (const item of order.orderItems) {
        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } }
        );
      }

      order.stockRestored = true;
    }

    order.orderStatus = orderStatus;

    await order.save();

    // Send status update email.
    const customerEmail = order.shippingAddress.email;
    const customerName = escapeHtml(
      order.shippingAddress.fullName
    );

    const statusEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">VICKSTACK.</h2>

        <h3>Order Status Update</h3>

        <p>Hello ${customerName},</p>

        <p>Your order status has been updated.</p>

        <h3>Order ID: ${order._id}</h3>

        <h3>New Status: ${escapeHtml(orderStatus)}</h3>

        <p>Thank you for shopping with VICKSTACK.</p>
      </div>
    `;

    await sendEmail(
      customerEmail,
      "VICKSTACK Order Status Update",
      statusEmail
    );

    return res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      message: "Unable to update order status.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};


const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Visit = require("../models/Visit");

// GET ADMIN DASHBOARD ANALYTICS
const getAdminDashboardAnalytics = async (req, res) => {
  try {
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      deliveredRevenue,
      trafficData,
      bestSellingProducts,
    ] = await Promise.all([
      // Registered customers (excluding admins).
      User.countDocuments({ role: "user" }),

      // Total products.
      Product.countDocuments(),

      // All orders.
      Order.countDocuments(),

      // Orders still being processed or delivered.
      Order.countDocuments({
        orderStatus: {
          $in: ["Pending", "Processing", "Shipped"],
        },
      }),

      // Successfully delivered orders.
      Order.countDocuments({
        orderStatus: "Delivered",
      }),

      // Cancelled orders.
      Order.countDocuments({
        orderStatus: "Cancelled",
      }),

      // Revenue from delivered orders only.
      Order.aggregate([
        {
          $match: {
            orderStatus: "Delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalPrice",
            },
          },
        },
      ]),

      // Website visits over the last seven days.
      Visit.aggregate([
        {
          $match: {
            visitedAt: {
              $gte: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$visitedAt",
              },
            },
            pageViews: {
              $sum: 1,
            },
            visitors: {
              $addToSet: "$visitorId",
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            pageViews: 1,
            uniqueVisitors: {
              $size: "$visitors",
            },
          },
        },
        {
          $sort: {
            date: 1,
          },
        },
      ]),

      // Best-selling products from delivered orders.
      Order.aggregate([
        {
          $match: {
            orderStatus: "Delivered",
          },
        },
        {
          $unwind: "$orderItems",
        },
        {
          $group: {
            _id: "$orderItems.product",
            name: {
              $first: "$orderItems.name",
            },
            image: {
              $first: "$orderItems.image",
            },
            quantitySold: {
              $sum: "$orderItems.quantity",
            },
            revenue: {
              $sum: {
                $multiply: [
                  "$orderItems.price",
                  "$orderItems.quantity",
                ],
              },
            },
          },
        },
        {
          $sort: {
            quantitySold: -1,
          },
        },
        {
          $limit: 5,
        },
      ]),
    ]);

    return res.status(200).json({
      message: "Admin dashboard analytics retrieved successfully.",

      analytics: {
        totalCustomers,
        totalProducts,
        totalOrders,
        activeOrders,
        completedOrders,
        cancelledOrders,

        totalRevenue:
          deliveredRevenue.length > 0
            ? deliveredRevenue[0].totalRevenue
            : 0,

        trafficData,
        bestSellingProducts,
      },
    });
  } catch (error) {
    console.error("Admin dashboard analytics error:", error);

    return res.status(500).json({
      message: "Unable to retrieve admin dashboard analytics.",
    });
  }
};

module.exports = {
  getAdminDashboardAnalytics,
};

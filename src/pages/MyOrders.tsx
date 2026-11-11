
import { useEffect, useState } from "react";
import API from "../services/api";

type OrderItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  orderItems: OrderItem[];
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

interface MyOrdersProps {
  onBack: () => void;
}

const orderSteps = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
];

function MyOrders({ onBack }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch customer orders
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const response = await API.get("/orders/myorders");

        setOrders(response.data.orders || []);
        setError("");
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Unable to load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch orders immediately
    fetchMyOrders();

    // Refresh orders automatically every 10 seconds
    const interval = setInterval(() => {
      fetchMyOrders();
    }, 10000);

    // Stop automatic refreshing when leaving the page
    return () => clearInterval(interval);
  }, []);

  // Format prices in Nigerian Naira
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);

  // Format order status for CSS
  const getStatusClass = (status: string) =>
    status.toLowerCase().replace(/\s+/g, "-");

  // Find current delivery stage
  const getStepIndex = (status: string) =>
    orderSteps.indexOf(status);

  return (
    <div className="my-orders-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Shopping
      </button>

      <div className="my-orders-heading">
        <h1>My Orders</h1>
        <p>View your purchases and track your deliveries.</p>
        <small>Order statuses refresh automatically every 10 seconds.</small>
      </div>

      {loading && <p>Loading your orders...</p>}

      {error && <p className="order-error">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-orders">
          <h2>No orders yet</h2>
          <p>Your purchases will appear here when you place an order.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="my-orders-list">
          {orders.map((order) => {
            const currentStep = getStepIndex(order.orderStatus);

            return (
              <div className="my-order-card" key={order._id}>
                <div className="my-order-header">
                  <div>
                    <h3>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>

                    <p>
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-NG",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <span
                    className={`my-order-status ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Delivery Tracking Timeline */}
                <div className="order-tracking">
                  <h4>Delivery Progress</h4>

                  <div className="tracking-steps">
                    {orderSteps.map((step, index) => (
                      <div
                        className={`tracking-step ${
                          currentStep >= index ? "completed" : ""
                        }`}
                        key={step}
                      >
                        <div className="tracking-circle">
                          {currentStep >= index ? "✓" : index + 1}
                        </div>

                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.orderStatus === "Cancelled" && (
                  <p className="cancelled-order-message">
                    This order has been cancelled.
                  </p>
                )}

                {/* Ordered Products */}
                <div className="my-order-items">
                  {order.orderItems.map((item, index) => (
                    <div
                      className="my-order-item"
                      key={`${order._id}-${index}`}
                    >
                      <img src={item.image} alt={item.name} />

                      <div>
                        <h4>{item.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment and Total */}
                <div className="my-order-footer">
                  <div>
                    <p>Payment: {order.paymentMethod}</p>
                    <p>Payment Status: {order.paymentStatus}</p>
                  </div>

                  <div className="my-order-total">
                    <span>Total</span>
                    <strong>
                      {formatPrice(order.totalPrice)}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;

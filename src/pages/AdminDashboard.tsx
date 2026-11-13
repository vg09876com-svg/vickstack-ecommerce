
import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import "../AdminDashboard.css";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
  };
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
  };
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  createdAt: string;
}

interface DashboardAnalytics {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
}

function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] =
    useState<DashboardAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingOrderId, setSavingOrderId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersResponse, analyticsResponse] =
        await Promise.all([
          API.get("/orders"),
          API.get("/admin/analytics"),
        ]);

      setOrders(ordersResponse.data.orders || []);
      setAnalytics(analyticsResponse.data.analytics);
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setError(
        "Unable to load dashboard information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApproveOrder = async (orderId: string) => {
    try {
      setSavingOrderId(orderId);
      setError("");
      setSuccessMessage("");

      await API.put(`/orders/${orderId}/status`, {
        orderStatus: "Processing",
      });

      setSuccessMessage("Order approved successfully!");

      await fetchDashboardData();
    } catch (error) {
      console.error("Order approval error:", error);
      setError("Unable to approve this order. Please try again.");
    } finally {
      setSavingOrderId("");
    }
  };

  const pendingOrders = orders.filter(
    (order) => order.orderStatus === "Pending"
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-simple">
        <p className="admin-loading">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="admin-simple">
      <header className="admin-simple-header">
        <div>
          <span className="admin-simple-label">
            VICKSTACK ADMIN
          </span>
          <h1>Dashboard Overview</h1>
          <p>Monitor your store and manage customer orders.</p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchDashboardData}
        >
          Refresh Dashboard
        </button>
      </header>

      {error && (
        <div className="admin-message admin-message-error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="admin-message admin-message-success">
          {successMessage}
        </div>
      )}

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Registered Customers</span>
          <h2>{analytics?.totalCustomers ?? 0}</h2>
          <p>Total customer accounts</p>
        </article>

        <article className="admin-stat-card">
          <span>Total Orders</span>
          <h2>{analytics?.totalOrders ?? orders.length}</h2>
          <p>All customer orders</p>
        </article>

        <article className="admin-stat-card admin-stat-pending">
          <span>Pending Orders</span>
          <h2>{pendingOrders.length}</h2>
          <p>Waiting for your approval</p>
        </article>

        <article className="admin-stat-card">
          <span>Completed Orders</span>
          <h2>
            {analytics?.completedOrders ??
              orders.filter(
                (order) => order.orderStatus === "Delivered"
              ).length}
          </h2>
          <p>Successfully delivered</p>
        </article>

        <article className="admin-stat-card admin-stat-revenue">
          <span>Total Revenue</span>
          <h2>{formatPrice(analytics?.totalRevenue ?? 0)}</h2>
          <p>Store revenue</p>
        </article>
      </section>

      <section className="admin-orders-section">
        <div className="admin-orders-heading">
          <div>
            <span className="admin-simple-label">
              ORDER MANAGEMENT
            </span>
            <h2>Orders Awaiting Approval</h2>
            <p>Review new customer orders and approve them.</p>
          </div>

          <span className="admin-pending-count">
            {pendingOrders.length} Pending
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="admin-empty-orders">
            <h3>No pending orders</h3>
            <p>New customer orders will appear here.</p>
          </div>
        ) : (
          <div className="admin-order-list">
            {pendingOrders.map((order) => (
              <article
                className="admin-order-card"
                key={order._id}
              >
                <div className="admin-order-top">
                  <div>
                    <span className="admin-order-id">
                      ORDER #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>

                  <span className="admin-order-status">
                    Pending Approval
                  </span>
                </div>

                <div className="admin-order-customer">
                  <h3>
                    {order.user?.fullName ||
                      order.shippingAddress?.fullName ||
                      "Customer"}
                  </h3>
                  <p>
                    {order.user?.email ||
                      order.shippingAddress?.email}
                  </p>
                  <p>
                    Phone: {order.shippingAddress?.phone || "Not provided"}
                  </p>
                </div>

                <div className="admin-order-delivery">
                  <strong>Delivery Address</strong>
                  <p>
                    {order.shippingAddress?.address},{" "}
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state}
                  </p>
                </div>

                <div className="admin-order-items">
                  <strong>Products Ordered</strong>

                  {order.orderItems.map((item, index) => (
                    <div
                      className="admin-order-item"
                      key={`${item.product}-${index}`}
                    >
                      <img src={item.image} alt={item.name} />

                      <div className="admin-order-item-info">
                        <strong>{item.name}</strong>
                        <span>Quantity: {item.quantity}</span>
                      </div>

                      <strong>
                        {formatPrice(item.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="admin-order-bottom">
                  <div>
                    <span>Payment: {order.paymentMethod}</span>
                    <span>
                      Payment Status: {order.paymentStatus}
                    </span>
                    <strong>
                      Total: {formatPrice(order.totalPrice)}
                    </strong>
                  </div>

                  <button
                    className="admin-approve-button"
                    onClick={() => handleApproveOrder(order._id)}
                    disabled={savingOrderId === order._id}
                  >
                    {savingOrderId === order._id
                      ? "Approving..."
                      : "Approve Order"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;

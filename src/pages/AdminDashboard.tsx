
import "../AdminDashboard.css";
import { useEffect, useState, type FormEvent } from "react";
import API from "../services/api";
import type { Product } from "../types/Product";

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

interface TrafficDay {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
}

interface BestSellingProduct {
  _id: string;
  name: string;
  image: string;
  quantitySold: number;
  revenue: number;
}

interface DashboardAnalytics {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  trafficData: TrafficDay[];
  bestSellingProducts: BestSellingProduct[];
}

interface VisitorAnalytics {
  totalUniqueVisitors: number;
  totalPageViews: number;
  today: {
    uniqueVisitors: number;
    pageViews: number;
  };
  thisWeek: {
    uniqueVisitors: number;
    pageViews: number;
  };
  thisMonth: {
    uniqueVisitors: number;
    pageViews: number;
  };
  popularPages: {
    page: string;
    views: number;
    uniqueVisitors: number;
  }[];
}

function AdminDashboard() {
  // PRODUCT STATES
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ORDER STATES
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [ordersSuccess, setOrdersSuccess] = useState("");
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  // ANALYTICS STATES
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [visitorAnalytics, setVisitorAnalytics] =
    useState<VisitorAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  // PRODUCT FORM STATES
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    image: "",
    category: "accessories",
    stock: "",
    originalPrice: "",
    isFeatured: false,
  };

  const [formData, setFormData] = useState(emptyForm);

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/products");

      const fetchedProducts: Product[] = (
        response.data.products || []
      ).map((item: Product) => ({
        ...item,
        id: item._id ?? item.id,
      }));

      setProducts(fetchedProducts);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  // FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");

      const response = await API.get("/orders");

      setOrders(response.data.orders || []);
    } catch (err: any) {
      console.error("Fetch orders error:", err);

      setOrdersError(
        err.response?.data?.message || "Unable to load customer orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  // FETCH DASHBOARD ANALYTICS
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");

      const [dashboardResponse, visitorResponse] = await Promise.all([
        API.get("/admin/analytics"),
        API.get("/visits/analytics"),
      ]);

      setAnalytics(dashboardResponse.data.analytics);
      setVisitorAnalytics(visitorResponse.data.analytics);
    } catch (err: any) {
      console.error("Fetch analytics error:", err);

      setAnalyticsError(
        err.response?.data?.message ||
          "Unable to load dashboard analytics."
      );
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // LOAD DASHBOARD DATA
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchAnalytics();
  }, []);

  // UPDATE ORDER STATUS
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      setSavingOrderId(orderId);
      setOrdersError("");
      setOrdersSuccess("");

      await API.put(`/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );

      setOrdersSuccess("Order status updated successfully!");

      // Refresh analytics after an order status changes.
      fetchAnalytics();
    } catch (err: any) {
      console.error("Update order status error:", err);

      setOrdersError(
        err.response?.data?.message || "Unable to update order status."
      );
    } finally {
      setSavingOrderId(null);
    }
  };

  // FORMAT PRICE
  const formatPrice = (price: number) =>
    (price || 0).toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    });

  // PRODUCT FORM CHANGE
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // OPEN ADD PRODUCT FORM
  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setSuccess("");
    setError("");
    setShowForm(true);
  };

  // OPEN EDIT PRODUCT FORM
  const openEditForm = (product: Product) => {
    setEditingId(product.id);

    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      image: product.image,
      category: product.category,
      stock: String(product.stock ?? 0),
      originalPrice: product.originalPrice
        ? String(product.originalPrice)
        : "",
      isFeatured: Boolean(product.isFeatured),
    });

    setSuccess("");
    setError("");
    setShowForm(true);
  };

  // SAVE PRODUCT
  const handleSaveProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        image: formData.image.trim(),
        category: formData.category,
        stock: Number(formData.stock),
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice)
          : undefined,
        isFeatured: formData.isFeatured,
      };

      if (editingId !== null) {
        await API.put(`/products/${editingId}`, productData);
        setSuccess("Product updated successfully!");
      } else {
        await API.post("/products", productData);
        setSuccess("Product added successfully!");
      }

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchProducts();
      fetchAnalytics();
    } catch (err) {
      console.error("Save product error:", err);
      setError("Unable to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (id: string | number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/products/${id}`);

      setProducts((previous) =>
        previous.filter((product) => product.id !== id)
      );

      setSuccess("Product deleted successfully!");
      setError("");

      fetchAnalytics();
    } catch (err) {
      console.error("Delete product error:", err);
      setError("Failed to delete product.");
    }
  };

  // ORDER GROUPS
  const activeOrders = orders.filter(
    (order) =>
      order.orderStatus === "Pending" ||
      order.orderStatus === "Processing" ||
      order.orderStatus === "Shipped"
  );

  const completedOrders = orders.filter(
    (order) => order.orderStatus === "Delivered"
  );

  const cancelledOrders = orders.filter(
    (order) => order.orderStatus === "Cancelled"
  );

  // REUSABLE ORDER DISPLAY
  const renderOrder = (order: Order, allowStatusUpdate: boolean) => (
    <div className="admin-order-card" key={order._id}>
      <div className="admin-order-header">
        <div>
          <h4>Order #{order._id.slice(-8).toUpperCase()}</h4>
          <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <strong>{formatPrice(order.totalPrice)}</strong>
      </div>

      <div className="admin-order-customer">
        <h4>Customer Information</h4>

        <p>
          <strong>Name:</strong>{" "}
          {order.shippingAddress?.fullName || order.user?.fullName}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {order.shippingAddress?.email || order.user?.email}
        </p>

        <p>
          <strong>Phone:</strong> {order.shippingAddress?.phone}
        </p>

        <p>
          <strong>Delivery Address:</strong>{" "}
          {order.shippingAddress?.address},{" "}
          {order.shippingAddress?.city},{" "}
          {order.shippingAddress?.state}
        </p>
      </div>

      <div className="admin-order-items">
        <h4>Products Ordered</h4>

        {order.orderItems.map((item, index) => (
          <div
            className="admin-order-item"
            key={`${order._id}-${index}`}
          >
            <img src={item.image} alt={item.name} />

            <div>
              <p><strong>{item.name}</strong></p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: {formatPrice(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-order-payment">
        <p>
          <strong>Payment Method:</strong> {order.paymentMethod}
        </p>

        <p>
          <strong>Payment Status:</strong> {order.paymentStatus}
        </p>

        <p>
          <strong>Order Status:</strong> {order.orderStatus}
        </p>
      </div>

      {allowStatusUpdate && (
        <div className="admin-order-status">
          <label htmlFor={`status-${order._id}`}>
            <strong>Update Order Status:</strong>
          </label>

          <select
            id={`status-${order._id}`}
            value={order.orderStatus}
            disabled={savingOrderId === order._id}
            onChange={(e) =>
              handleUpdateOrderStatus(
                order._id,
                e.target.value as OrderStatus
              )
            }
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {savingOrderId === order._id && (
            <span>Updating status...</span>
          )}
        </div>
      )}
    </div>
  );

  // TRAFFIC CHART MAXIMUM
  const maximumViews = Math.max(
    1,
    ...(analytics?.trafficData || []).map((day) => day.pageViews)
  );

  return (
    <section className="admin-dashboard">

      {/* DASHBOARD HEADER */}
      <div className="admin-dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage your VICKSTACK store and monitor performance.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchProducts();
            fetchOrders();
            fetchAnalytics();
          }}
        >
          Refresh Dashboard
        </button>
      </div>

      {/* ANALYTICS OVERVIEW */}
      <section className="admin-analytics-section">
        <h3>Store Overview</h3>

        {analyticsLoading ? (
          <p>Loading store analytics...</p>
        ) : analyticsError ? (
          <p className="admin-error">{analyticsError}</p>
        ) : analytics ? (
          <>
            <div className="admin-stats">

              <div className="admin-stat-card">
                <h3>Total Visitors</h3>
                <p>{visitorAnalytics?.totalUniqueVisitors ?? 0}</p>
                <span>Unique browsers recorded</span>
              </div>

              <div className="admin-stat-card">
                <h3>Total Page Views</h3>
                <p>{visitorAnalytics?.totalPageViews ?? 0}</p>
                <span>All recorded page visits</span>
              </div>

              <div className="admin-stat-card">
                <h3>Customers</h3>
                <p>{analytics.totalCustomers}</p>
                <span>Registered customer accounts</span>
              </div>

              <div className="admin-stat-card">
                <h3>Total Products</h3>
                <p>{analytics.totalProducts}</p>
                <span>Products in your store</span>
              </div>

              <div className="admin-stat-card">
                <h3>Total Orders</h3>
                <p>{analytics.totalOrders}</p>
                <span>All customer orders</span>
              </div>

              <div className="admin-stat-card">
                <h3>Active Orders</h3>
                <p>{analytics.activeOrders}</p>
                <span>Pending, processing and shipped</span>
              </div>

              <div className="admin-stat-card">
                <h3>Completed Orders</h3>
                <p>{analytics.completedOrders}</p>
                <span>Successfully delivered</span>
              </div>

              <div className="admin-stat-card">
                <h3>Cancelled Orders</h3>
                <p>{analytics.cancelledOrders}</p>
                <span>Cancelled customer orders</span>
              </div>

              <div className="admin-stat-card">
                <h3>Total Revenue</h3>
                <p>{formatPrice(analytics.totalRevenue)}</p>
                <span>Revenue from delivered orders</span>
              </div>

            </div>

            {/* VISITOR SUMMARY */}
            <div className="admin-traffic-summary">
              <h3>Visitor Activity</h3>

              <div className="admin-stats">
                <div className="admin-stat-card">
                  <h3>Today</h3>
                  <p>{visitorAnalytics?.today.uniqueVisitors ?? 0}</p>
                  <span>
                    {visitorAnalytics?.today.pageViews ?? 0} page views
                  </span>
                </div>

                <div className="admin-stat-card">
                  <h3>This Week</h3>
                  <p>{visitorAnalytics?.thisWeek.uniqueVisitors ?? 0}</p>
                  <span>
                    {visitorAnalytics?.thisWeek.pageViews ?? 0} page views
                  </span>
                </div>

                <div className="admin-stat-card">
                  <h3>This Month</h3>
                  <p>{visitorAnalytics?.thisMonth.uniqueVisitors ?? 0}</p>
                  <span>
                    {visitorAnalytics?.thisMonth.pageViews ?? 0} page views
                  </span>
                </div>
              </div>
            </div>

            {/* SEVEN-DAY TRAFFIC CHART */}
            <div className="admin-traffic-chart">
              <h3>Website Traffic - Last 7 Days</h3>

              {analytics.trafficData.length === 0 ? (
                <p>No traffic data recorded yet.</p>
              ) : (
                <div className="admin-chart-bars">
                  {analytics.trafficData.map((day) => (
                    <div className="admin-chart-column" key={day.date}>
                      <strong>{day.pageViews}</strong>

                      <div className="admin-chart-bar-container">
                        <div
                          className="admin-chart-bar"
                          style={{
                            height: `${
                              (day.pageViews / maximumViews) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <span>
                        {new Date(
                          `${day.date}T00:00:00`
                        ).toLocaleDateString("en-NG", {
                          weekday: "short",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p>Bars represent recorded page views per day.</p>
            </div>

            {/* BEST-SELLING PRODUCTS */}
            <div className="admin-best-selling">
              <h3>Best-Selling Products</h3>

              {analytics.bestSellingProducts.length === 0 ? (
                <p>
                  No delivered product sales have been recorded yet.
                </p>
              ) : (
                <div className="admin-products-list">
                  {analytics.bestSellingProducts.map((product) => (
                    <div
                      className="admin-product-card"
                      key={product._id}
                    >
                      <img src={product.image} alt={product.name} />

                      <div className="admin-product-info">
                        <h4>{product.name}</h4>
                        <span>
                          Quantity sold: {product.quantitySold}
                        </span>
                        <span>
                          Revenue: {formatPrice(product.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* POPULAR PAGES */}
            <div className="admin-popular-pages">
              <h3>Popular Website Pages</h3>

              {!visitorAnalytics?.popularPages.length ? (
                <p>No popular page data available yet.</p>
              ) : (
                <div className="admin-products-list">
                  {visitorAnalytics.popularPages.map((item) => (
                    <div className="admin-stat-card" key={item.page}>
                      <h3>{item.page}</h3>
                      <p>{item.views}</p>
                      <span>
                        {item.uniqueVisitors} unique browsers
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p>Analytics are currently unavailable.</p>
        )}
      </section>

      {/* PRODUCT MANAGEMENT */}
      <div className="admin-products-section">
        <div className="admin-dashboard-header">
          <h3>Product Management</h3>

          <button type="button" onClick={openAddForm}>
            + Add New Product
          </button>
        </div>

        {showForm && (
          <form
            className="admin-add-product-form"
            onSubmit={handleSaveProduct}
          >
            <h3>
              {editingId !== null ? "Edit Product" : "Add New Product"}
            </h3>

            <label>Product Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />

            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product"
              required
            />

            <label>Product Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              required
            />

            <label>Price (₦)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              required
            />

            <label>Original Price (₦) - Optional</label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              min="0"
            />

            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="accessories">Accessories</option>
              <option value="clothing">Clothing</option>
              <option value="bags">Bags</option>
              <option value="footwear">Footwear</option>
              <option value="beauty">Beauty</option>
              <option value="electronics">Electronics</option>
              <option value="phones/tablets">Phones & Tablets</option>
              <option value="computers">Computers</option>
              <option value="home/living">Home & Living</option>
              <option value="sports">Sports</option>
            </select>

            <label>Available Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
            />

            <label className="admin-featured-label">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData((previous) => ({
                    ...previous,
                    isFeatured: e.target.checked,
                  }))
                }
              />
              Feature this product
            </label>

            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Product"
                  : "Save Product"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData(emptyForm);
              }}
            >
              Cancel
            </button>
          </form>
        )}

        {success && <p className="admin-success">{success}</p>}
        {error && <p className="admin-error">{error}</p>}

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products have been added yet.</p>
        ) : (
          <div className="admin-products-list">
            {products.map((product) => (
              <div className="admin-product-card" key={product.id}>
                <img src={product.image} alt={product.name} />

                <div className="admin-product-info">
                  <h4>{product.name}</h4>
                  <p>{formatPrice(product.price)}</p>
                  <span>Category: {product.category}</span>
                  <span>Stock: {product.stock ?? 0}</span>
                </div>

                <button
                  type="button"
                  onClick={() => openEditForm(product)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="admin-delete-button"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ORDER MANAGEMENT */}
      <div className="admin-orders-section">
        <div className="admin-dashboard-header">
          <div>
            <h3>Order Management</h3>
            <p>Manage active orders and customer deliveries.</p>
          </div>

          <button type="button" onClick={fetchOrders}>
            Refresh Orders
          </button>
        </div>

        {ordersSuccess && (
          <p className="admin-success">{ordersSuccess}</p>
        )}

        {ordersError && (
          <p className="admin-error">{ordersError}</p>
        )}

        {ordersLoading ? (
          <p>Loading customer orders...</p>
        ) : (
          <>
            {/* ACTIVE ORDERS */}
            <div className="admin-order-group">
              <h3>Active Orders ({activeOrders.length})</h3>
              <p>Orders waiting to be processed or delivered.</p>

              {activeOrders.length === 0 ? (
                <p>There are no active orders.</p>
              ) : (
                <div className="admin-orders-list">
                  {activeOrders.map((order) =>
                    renderOrder(order, true)
                  )}
                </div>
              )}
            </div>

            {/* COMPLETED ORDERS */}
            <div className="admin-order-group">
              <h3>Completed Orders ({completedOrders.length})</h3>
              <p>Orders successfully delivered to customers.</p>

              {completedOrders.length === 0 ? (
                <p>No completed deliveries yet.</p>
              ) : (
                <div className="admin-orders-list">
                  {completedOrders.map((order) =>
                    renderOrder(order, false)
                  )}
                </div>
              )}
            </div>

            {/* CANCELLED ORDERS */}
            <div className="admin-order-group">
              <h3>Cancelled Orders ({cancelledOrders.length})</h3>

              {cancelledOrders.length === 0 ? (
                <p>No cancelled orders.</p>
              ) : (
                <div className="admin-orders-list">
                  {cancelledOrders.map((order) =>
                    renderOrder(order, false)
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default AdminDashboard;

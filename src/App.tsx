
import { useEffect, useState } from "react";
import ProductList from "./components/ProductList";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import MyOrders from "./pages/MyOrders";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { useCart } from "./context/CartContext";
import API from "./services/api";
import "./App.css";

type Page =
  | "home"
  | "cart"
  | "checkout"
  | "login"
  | "register"
  | "admin"
  | "orders";

interface User {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
}

function App() {
  const { cartCount } = useCart();

  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verify saved authentication when the app loads.
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("vickstack_token");

      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await API.get("/auth/profile");

        const verifiedUser = response.data.user as User;

        setUser(verifiedUser);

        localStorage.setItem(
          "vickstack_user",
          JSON.stringify(verifiedUser)
        );
      } catch (error) {
        console.error("Authentication error:", error);

        localStorage.removeItem("vickstack_token");
        localStorage.removeItem("vickstack_user");

        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    verifyUser();
  }, []);

  // Track public website visits.
  useEffect(() => {
    // Wait until authentication has been checked.
    if (checkingAuth || page === "admin") {
      return;
    }

    // Get or create an anonymous visitor ID.
    let visitorId = localStorage.getItem(
      "vickstack_visitor_id"
    );

    if (!visitorId) {
      visitorId =
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `visitor-${Date.now()}-${Math.random()}`;

      localStorage.setItem(
        "vickstack_visitor_id",
        visitorId
      );
    }

    // Record the page visit in the backend.
    API.post("/visits", {
      visitorId,
      page,
    }).catch((error) => {
      console.error("Visitor tracking failed:", error);
    });
  }, [page, checkingAuth]);

  // Handle successful login or registration.
  const handleAuthSuccess = async () => {
    try {
      const savedUser = localStorage.getItem("vickstack_user");

      if (!savedUser) {
        console.error("No user information found after login.");
        setUser(null);
        return;
      }

      const loggedInUser = JSON.parse(savedUser) as User;

      setUser(loggedInUser);

      const response = await API.get("/auth/profile");

      const verifiedUser = response.data.user as User;

      setUser(verifiedUser);

      localStorage.setItem(
        "vickstack_user",
        JSON.stringify(verifiedUser)
      );

      setPage("home");
    } catch (error) {
      console.error("Account verification failed:", error);
    }
  };

  // Logout.
  const handleLogout = () => {
    localStorage.removeItem("vickstack_token");
    localStorage.removeItem("vickstack_user");

    setUser(null);
    setPage("home");
  };

  if (checkingAuth) {
    return (
      <main className="store">
        <div className="auth-page">
          <p>Checking your account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="store">

      {/* HEADER */}
      <header className="store-header">
        <div className="store-brand">
          <h1>
            VICKSTACK<span>.</span>
          </h1>
          <p>Upgrade your everyday.</p>
        </div>

        <div className="store-tagline">
          <span>NEW COLLECTION</span>
          <p>Find your next favourite.</p>

          <div className="header-actions">

            <button
              type="button"
              className="cart-counter"
              onClick={() => setPage("cart")}
            >
              🛒 Cart ({cartCount})
            </button>

            {/* MY ORDERS BUTTON */}
            {user && (
              <button
                type="button"
                className="auth-nav-button"
                onClick={() => setPage("orders")}
              >
                My Orders
              </button>
            )}

            {/* ADMIN DASHBOARD BUTTON */}
            {user?.role === "admin" && (
              <button
                type="button"
                className="auth-nav-button"
                onClick={() => setPage("admin")}
              >
                Admin Dashboard
              </button>
            )}

            {/* LOGIN AND LOGOUT BUTTONS */}
            {user ? (
              <button
                type="button"
                className="auth-nav-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="auth-nav-button"
                  onClick={() => setPage("login")}
                >
                  Login
                </button>

                <button
                  type="button"
                  className="auth-nav-button register-nav-button"
                  onClick={() => setPage("register")}
                >
                  Sign Up
                </button>
              </>
            )}

          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {page === "login" ? (
        <Login
          onLoginSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setPage("register")}
        />
      ) : page === "register" ? (
        <Register
          onRegisterSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setPage("login")}
        />
      ) : page === "checkout" ? (
        <Checkout onBack={() => setPage("cart")} />
      ) : page === "cart" ? (
        <section className="cart-section">

          <button
            type="button"
            className="product-card__button"
            onClick={() => setPage("home")}
          >
            ← Continue Shopping
          </button>

          <Cart />

          <button
            type="button"
            className="checkout-submit"
            onClick={() => setPage("checkout")}
            disabled={cartCount === 0}
          >
            Proceed to Checkout →
          </button>

        </section>
      ) : page === "admin" ? (
        user?.role === "admin" ? (
          <section>

            <button
              type="button"
              className="product-card__button"
              onClick={() => setPage("home")}
            >
              ← Back to Store
            </button>

            <AdminDashboard />

          </section>
        ) : (
          <p>Access denied. Admin privileges required.</p>
        )
      ) : page === "orders" ? (
        user ? (
          <MyOrders onBack={() => setPage("home")} />
        ) : (
          <p>Please log in to view your orders.</p>
        )
      ) : (
        <ProductList />
      )}

      {/* FOOTER */}
      <footer className="store-footer">
        <p>© 2026 VICKSTACK. All rights reserved.</p>
      </footer>

    </main>
  );
}

export default App;

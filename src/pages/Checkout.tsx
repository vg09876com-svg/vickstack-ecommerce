
import { useState } from "react";
import { useCart } from "../context/CartContext";
import API from "../services/api";

interface CheckoutProps {
  onBack: () => void;
}

function Checkout({ onBack }: CheckoutProps) {
  const { cartItems, cartTotal, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee = 5000;
  const finalTotal = cartTotal + deliveryFee;

  const formatPrice = (price: number) =>
    price.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    });

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
        })),

        shippingAddress: {
          fullName,
          email,
          phone,
          address,
          city,
          state,
        },

        paymentMethod: "Cash on Delivery",
      };

      // Send the order to the backend.
      await API.post("/orders", orderData);

      // Clear the cart after successful order creation.
      clearCart();

      // Display the success page.
      setOrderPlaced(true);
    } catch (err: any) {
      console.error("Place order error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Order success screen.
  if (orderPlaced) {
    return (
      <section className="checkout-success">
        <div className="success-icon">✓</div>

        <h2>Order Placed Successfully!</h2>

        <p>
          Thank you, {fullName}. Your order has been received.
        </p>

        <p>
          Delivery address: {address}, {city}, {state}.
        </p>

        <p>Estimated delivery: 3–5 business days.</p>

        <p>Payment method: Cash on Delivery.</p>

        <button type="button" onClick={onBack}>
          Back to Store
        </button>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <button
        type="button"
        className="checkout-back"
        onClick={onBack}
      >
        ← Back to Cart
      </button>

      <div className="checkout-heading">
        <h2>Checkout</h2>
        <p>Complete your details to place your order.</p>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Delivery Information</h3>

          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />

          <label htmlFor="address">Delivery Address</label>
          <textarea
            id="address"
            placeholder="Enter your full delivery address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
          />

          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            placeholder="Enter your city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
          />

          <label htmlFor="state">State</label>
          <input
            id="state"
            type="text"
            placeholder="Enter your state"
            value={state}
            onChange={(event) => setState(event.target.value)}
            required
          />

          <p className="delivery-estimate">
            Estimated delivery: 3–5 business days.
          </p>

          <p>Payment method: Cash on Delivery</p>

          {error && (
            <p className="admin-error">{error}</p>
          )}

          <button
            type="submit"
            className="checkout-submit"
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="checkout-summary">
          <h3>Your Order</h3>

          {cartItems.map((item) => (
            <div
              className="checkout-product"
              key={item.product.id}
            >
              <img
                src={item.product.image}
                alt={item.product.name}
              />

              <div>
                <h4>{item.product.name}</h4>

                <p>Quantity: {item.quantity}</p>

                <strong>
                  {formatPrice(
                    item.product.price * item.quantity
                  )}
                </strong>
              </div>
            </div>
          ))}

          <div className="checkout-total">
            <p>
              Subtotal: <strong>{formatPrice(cartTotal)}</strong>
            </p>

            <p>
              Delivery Fee: <strong>{formatPrice(deliveryFee)}</strong>
            </p>

            <div className="checkout-final-total">
              <span>Grand Total</span>
              <strong>{formatPrice(finalTotal)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;

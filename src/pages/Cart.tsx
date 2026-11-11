
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const formatPrice = (price: number) =>
    price.toLocaleString("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    });

  return (
    <section className="cart-page">
      <h2>Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p className="cart-empty">
          Your cart is empty. Add some products to get started!
        </p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <article
                className="cart-item"
                key={item.product.id}
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="cart-item__image"
                />

                <div className="cart-item__details">
                  <h3>{item.product.name}</h3>

                  <p>{formatPrice(item.product.price)}</p>

                  <div className="cart-item__quantity">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(item.product.id)
                      }
                      aria-label={`Decrease ${item.product.name} quantity`}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(item.product.id)
                      }
                      aria-label={`Increase ${item.product.name} quantity`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-item__remove"
                    onClick={() =>
                      removeFromCart(item.product.id)
                    }
                  >
                    Remove
                  </button>
                </div>

                <p className="cart-item__subtotal">
                  {formatPrice(
                    item.product.price * item.quantity
                  )}
                </p>
              </article>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>

            <p>
              Total: <strong>{formatPrice(cartTotal)}</strong>
            </p>
          </div>
        </>
      )}
    </section>
  );
}

export default Cart;

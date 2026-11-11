
import ProductCard from "./ProductCard";
import type { Product } from "../types/Product";

interface FlashSalesProps {
  products: Product[];
  onViewDetails: (product: Product) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
}

function FlashSales({
  products,
  onViewDetails,
  wishlist,
  onToggleWishlist,
}: FlashSalesProps) {
  const discountedProducts = products
    .filter(
      (product) =>
        product.originalPrice !== undefined &&
        product.originalPrice > product.price
    )
    .sort((a, b) => {
      const discountA =
        ((a.originalPrice! - a.price) / a.originalPrice!) * 100;

      const discountB =
        ((b.originalPrice! - b.price) / b.originalPrice!) * 100;

      return discountB - discountA;
    });

  return (
    <section className="flash-sales">
      <div className="flash-sales-heading">
        <div>
          <span className="flash-sales-label">
            LIMITED-TIME DEALS
          </span>

          <h2>⚡ Flash Sales</h2>

          <p>
            Grab your favorites before the deals disappear!
          </p>
        </div>

        <span className="flash-sales-offer">
          HOT DEALS
        </span>
      </div>

      {discountedProducts.length > 0 ? (
        <div className="flash-sales-grid">
          {discountedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              isWishlisted={wishlist.some(
                (item) => item.id === product.id
              )}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      ) : (
        <p className="no-products">
          No discounted products available right now.
        </p>
      )}
    </section>
  );
}

export default FlashSales;

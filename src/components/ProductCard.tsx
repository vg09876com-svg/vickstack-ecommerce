
import { useState } from "react";
import type { Product } from "../types/Product";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

const FALLBACK_IMAGE =
  "https://placehold.co/600x600/eaf0ff/2563eb?text=Product+Image";

function ProductCard({
  product,
  onViewDetails,
  isWishlisted = false,
  onToggleWishlist,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const [isAdded, setIsAdded] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.image);
  const [imageFailed, setImageFailed] = useState(false);

  const stock = product.stock;
  const isOutOfStock = stock !== undefined && stock <= 0;

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart(product);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleImageError = () => {
    if (!imageFailed) {
      setImageFailed(true);
      setImageSrc(FALLBACK_IMAGE);
    }
  };

  return (
    <article className="product-card">
      <div className="product-card__image-container">
        <img
          src={imageSrc}
          alt={product.name}
          className="product-card__image"
          width={600}
          height={600}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      </div>

      <div className="product-card__header-row">
        <div className="product-card__badges">
          {discount > 0 && (
            <span className="discount-badge">
              -{discount}%
            </span>
          )}

          {isOutOfStock && (
            <span className="stock-badge">
              Out of Stock
            </span>
          )}
        </div>

        {onToggleWishlist && (
          <button
            type="button"
            className={
              isWishlisted
                ? "wishlist-button active"
                : "wishlist-button"
            }
            onClick={() => onToggleWishlist(product)}
            aria-label={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            {isWishlisted ? "♥" : "♡"}
          </button>
        )}
      </div>

      <div className="product-card__content">
        <p className="product-card__category">
          {product.category}
        </p>

        <h3>{product.name}</h3>

        <p className="product-card__description">
          {product.description}
        </p>

        <div className="product-card__prices">
          <span className="product-card__price">
            {product.price.toLocaleString("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0,
            })}
          </span>

          {discount > 0 && (
            <span className="original-price">
              {product.originalPrice!.toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0,
              })}
            </span>
          )}
        </div>

        {stock !== undefined && (
          <p className="stock-information">
            {isOutOfStock
              ? "Currently unavailable"
              : stock <= 5
                ? `Only ${stock} left!`
                : `${stock} items available`}
          </p>
        )}

        <button
          type="button"
          className="product-card__button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock
            ? "Out of Stock"
            : isAdded
              ? "Added to Cart ✓"
              : "Add to Cart"}
        </button>

        <button
          type="button"
          className="view-details-button"
          onClick={() => onViewDetails(product)}
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export default ProductCard;


import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Product } from "../types/Product";
import { useCart } from "../context/CartContext";
import ProductCard from "./ProductCard";
import API from "../services/api";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onViewRelatedProduct: (product: Product) => void;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
}

function ProductDetails({
  product,
  onBack,
  onViewRelatedProduct,
}: ProductDetailsProps) {
  const { addToCart } = useCart();

  const [detailedProduct, setDetailedProduct] = useState(product);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the selected product and related products from MongoDB.
  useEffect(() => {
    let isMounted = true;

    const fetchProductDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const productId = product._id ?? product.id;

        const response = await API.get(`/products/${productId}`);

        if (!isMounted) return;

        const fetchedProduct = response.data.product;

        setDetailedProduct({
          ...fetchedProduct,
          id: fetchedProduct._id ?? fetchedProduct.id,
        });
      } catch (err) {
        console.error("Failed to fetch product details:", err);

        if (isMounted) {
          setError("Could not refresh product details from the server.");
          setDetailedProduct(product);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }

      try {
        const response = await API.get("/products");

        if (!isMounted) return;

        const fetchedProducts: Product[] = response.data.products.map(
          (item: Product) => ({
            ...item,
            id: item._id ?? item.id,
          })
        );

        setRelatedProducts(fetchedProducts);
      } catch (err) {
        console.error("Failed to fetch related products:", err);
      }
    };

    fetchProductDetails();

    return () => {
      isMounted = false;
    };
  }, [product]);

  const productImages =
    detailedProduct.images && detailedProduct.images.length > 0
      ? detailedProduct.images
      : [detailedProduct.image];

  const [selectedImage, setSelectedImage] = useState(
    product.image
  );

  useEffect(() => {
    setSelectedImage(productImages[0]);
  }, [detailedProduct.id, detailedProduct.image]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");

  const isOutOfStock = detailedProduct.stock === 0;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / reviews.length
      : 0;

  const relatedProductsForDisplay = relatedProducts
    .filter(
      (item) =>
        item.category.toLowerCase() ===
          detailedProduct.category.toLowerCase() &&
        item.id !== detailedProduct.id
    )
    .slice(0, 4);

  const handleSubmitReview = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (selectedRating === 0) {
      setReviewMessage("Please select a star rating.");
      return;
    }

    if (!reviewName.trim() || !reviewComment.trim()) {
      setReviewMessage("Please complete all review fields.");
      return;
    }

    const newReview: Review = {
      id: Date.now(),
      name: reviewName.trim(),
      rating: selectedRating,
      comment: reviewComment.trim(),
    };

    setReviews((previousReviews) => [
      newReview,
      ...previousReviews,
    ]);

    setReviewName("");
    setReviewComment("");
    setSelectedRating(0);
    setReviewMessage("Your review has been submitted!");
  };

  return (
    <section className="product-details">
      <button
        type="button"
        className="details-back-button"
        onClick={onBack}
      >
        ← Back to Shopping
      </button>

      {loading && (
        <p>Loading product details...</p>
      )}

      {error && (
        <p className="review-message">{error}</p>
      )}

      {/* Product Information */}
      <div className="product-details-layout">
        <div className="product-details-gallery">
          <div className="product-details-image">
            <img
              src={selectedImage}
              alt={detailedProduct.name}
            />
          </div>

          {productImages.length > 1 && (
            <div className="product-thumbnails">
              {productImages.map((image, index) => (
                <button
                  key={`${detailedProduct.id}-${index}`}
                  type="button"
                  className={
                    selectedImage === image
                      ? "product-thumbnail active"
                      : "product-thumbnail"
                  }
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={selectedImage === image}
                >
                  <img
                    src={image}
                    alt={`${detailedProduct.name} view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-details-info">
          <p className="product-card__category">
            {detailedProduct.category}
          </p>

          <h2>{detailedProduct.name}</h2>

          <p className="product-details-description">
            {detailedProduct.description}
          </p>

          <p className="product-details-price">
            {detailedProduct.price.toLocaleString("en-NG", {
              style: "currency",
              currency: "NGN",
              maximumFractionDigits: 0,
            })}
          </p>

          <div className="product-rating-summary">
            <span className="rating-stars">
              {reviews.length > 0
                ? "★".repeat(Math.round(averageRating)) +
                  "☆".repeat(5 - Math.round(averageRating))
                : "☆☆☆☆☆"}
            </span>

            <span>
              {reviews.length > 0
                ? `${averageRating.toFixed(1)} / 5 (${reviews.length} reviews)`
                : "No reviews yet"}
            </span>
          </div>

          {detailedProduct.stock !== undefined && (
            <p className="stock-information">
              {isOutOfStock
                ? "Currently unavailable"
                : `${detailedProduct.stock} items available`}
            </p>
          )}

          <button
            type="button"
            className="product-card__button"
            disabled={isOutOfStock}
            onClick={() => addToCart(detailedProduct)}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Customer Reviews */}
      <section className="customer-reviews">
        <div className="reviews-heading">
          <h2>Customer Reviews</h2>
          <p>Share your experience with this product.</p>
        </div>

        <form
          className="review-form"
          onSubmit={handleSubmitReview}
        >
          <h3>Write a Review</h3>

          <label>How would you rate this product?</label>

          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={
                  selectedRating >= star
                    ? "rating-star selected"
                    : "rating-star"
                }
                onClick={() => setSelectedRating(star)}
                aria-label={`Rate ${star} out of 5 stars`}
              >
                ★
              </button>
            ))}
          </div>

          <label htmlFor="review-name">Your Name</label>

          <input
            id="review-name"
            type="text"
            placeholder="Enter your name"
            value={reviewName}
            onChange={(event) =>
              setReviewName(event.target.value)
            }
          />

          <label htmlFor="review-comment">Your Review</label>

          <textarea
            id="review-comment"
            placeholder="Tell us what you think about this product..."
            rows={5}
            value={reviewComment}
            onChange={(event) =>
              setReviewComment(event.target.value)
            }
          />

          {reviewMessage && (
            <p className="review-message" role="status">
              {reviewMessage}
            </p>
          )}

          <button
            type="submit"
            className="submit-review-button"
          >
            Submit Review
          </button>
        </form>

        <div className="reviews-list">
          <h3>Customer Feedback ({reviews.length})</h3>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card-heading">
                  <h4>{review.name}</h4>

                  <span className="review-stars">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>

                <p>{review.comment}</p>
              </article>
            ))
          ) : (
            <div className="no-reviews">
              <span>⭐</span>
              <p>
                No customer reviews yet. Be the first to
                review this product!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section className="related-products">
        <div className="section-heading">
          <h2>You May Also Like</h2>
          <p>Discover more products in this category.</p>
        </div>

        {relatedProductsForDisplay.length > 0 ? (
          <div className="products-grid">
            {relatedProductsForDisplay.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onViewDetails={onViewRelatedProduct}
              />
            ))}
          </div>
        ) : (
          <p className="no-products">
            No related products available right now.
          </p>
        )}
      </section>
    </section>
  );
}

export default ProductDetails;

import { useEffect, useState } from "react";

import ProductCard from "./ProductCard";
import ProductDetails from "./ProductDetails";
import HeroBanner from "./HeroBanner";
import FlashSales from "./FlashSales";

import API from "../services/api";
import type { Product } from "../types/Product";

interface BackendProduct extends Omit<Product, "id"> {
  _id: string;
}

interface ProductListProps {
  defaultShowWishlist?: boolean;
  onBackToHome?: () => void;
}

function ProductList({
  defaultShowWishlist = false,
  onBackToHome,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("vickstack_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showWishlist, setShowWishlist] = useState(defaultShowWishlist);

  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try {
      const savedProducts = localStorage.getItem("vickstack_recently_viewed");
      return savedProducts ? JSON.parse(savedProducts) : [];
    } catch {
      return [];
    }
  });

  // Fetch products from MongoDB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await API.get("/products");

        const fetchedProducts: Product[] = (
          response.data.products as BackendProduct[]
        ).map((product) => ({
          ...product,
          id: product._id,
        }));

        setProducts(fetchedProducts);

        setRecentlyViewed((previousProducts) =>
          previousProducts.filter((savedProduct) =>
            fetchedProducts.some(
              (product) => String(product.id) === String(savedProduct.id)
            )
          )
        );
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    localStorage.setItem("vickstack_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Save recently viewed products
  useEffect(() => {
    localStorage.setItem(
      "vickstack_recently_viewed",
      JSON.stringify(recentlyViewed)
    );
  }, [recentlyViewed]);

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlist((previousWishlist) => {
      const alreadySaved = previousWishlist.some(
        (item) => item.id === product.id
      );

      if (alreadySaved) {
        return previousWishlist.filter((item) => item.id !== product.id);
      }

      return [...previousWishlist, product];
    });
  };

  // Recently viewed and product details
  const handleViewProduct = (product: Product) => {
    setRecentlyViewed((previousProducts) => {
      const updatedProducts = [
        product,
        ...previousProducts.filter((item) => item.id !== product.id),
      ];

      return updatedProducts.slice(0, 8);
    });

    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Search products
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    return (
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
    );
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "low-to-high":
        return a.price - b.price;
      case "high-to-low":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Wishlist or all products
  const displayedProducts = showWishlist
    ? sortedProducts.filter((product) =>
        wishlist.some((item) => item.id === product.id)
      )
    : sortedProducts;

  // Pagination
  const totalPages = Math.ceil(displayedProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = displayedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document
      .getElementById("marketplace-products")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Product details page
  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onViewRelatedProduct={handleViewProduct}
      />
    );
  }

  return (
    <section className="products-section" id="marketplace-products">
      {/* Only show Hero, Flash Sales, and Recently Viewed on the main Home view */}
      {!showWishlist && (
        <>
          <HeroBanner />

          <FlashSales
            products={products}
            onViewDetails={handleViewProduct}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />

          {recentlyViewed.length > 0 && (
            <section className="recently-viewed-section">
              <div className="section-heading">
                <h2>Recently Viewed</h2>
                <p>Pick up where you left off.</p>
              </div>

              <div className="products-grid">
                {recentlyViewed.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={handleViewProduct}
                    isWishlisted={wishlist.some(
                      (item) => item.id === product.id
                    )}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Back to Store button when opened from Navbar Wishlist */}
      {showWishlist && onBackToHome && (
        <button
          type="button"
          className="product-card__button"
          onClick={onBackToHome}
          style={{ marginBottom: "1rem", maxWidth: "220px" }}
        >
          {"\u2190"} Back to Store
        </button>
      )}

      {/* Product Heading with id for scroll */}
      <div id="products-gallery" className="section-heading">
        <h2>{showWishlist ? "My Wishlist" : "Discover Our Products"}</h2>
        <p>
          {showWishlist
            ? `You have ${wishlist.length} saved item(s).`
            : "Shop your favorite products at amazing prices."}
        </p>
      </div>

      {/* Search */}
      <div className="product-search">
        <input
          type="text"
          placeholder="Search for products, brands and categories..."
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Full-width marketplace */}
      <div className="marketplace-layout">
        <div className="marketplace-products">
          {/* Sorting */}
          <div className="sorting-section">
            <p>
              Showing{" "}
              {displayedProducts.length > 0 ? indexOfFirstProduct + 1 : 0}
              {" - "}
              {Math.min(indexOfLastProduct, displayedProducts.length)}
              {" of "}
              {displayedProducts.length} products
            </p>

            <div>
              <label htmlFor="sort-products">Sort by:</label>

              <select
                id="sort-products"
                value={sortOption}
                onChange={(event) => {
                  setSortOption(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="default">Recommended</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Gallery */}
          <div className="products-grid">
            {loading ? (
              <div className="no-products">
                <h3>Loading products...</h3>
                <p>Please wait while we retrieve products.</p>
              </div>
            ) : error ? (
              <div className="no-products">
                <h3>Something went wrong</h3>
                <p>{error}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewProduct}
                  isWishlisted={wishlist.some(
                    (item) => item.id === product.id
                  )}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))
            ) : (
              <div className="no-products">
                <h3>
                  {showWishlist
                    ? "Your wishlist is empty"
                    : "No products found"}
                </h3>

                <p>
                  {showWishlist
                    ? "Save products using the heart icon to see them here."
                    : "Try another search."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (onBackToHome) {
                      onBackToHome();
                    } else {
                      setShowWishlist(false);
                    }
                    setSearchTerm("");
                    setSortOption("default");
                    setCurrentPage(1);
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="pagination-button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                {"\u2190"} Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      currentPage === page
                        ? "pagination-number active"
                        : "pagination-number"
                    }
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                className="pagination-button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next {"\u2192"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductList;
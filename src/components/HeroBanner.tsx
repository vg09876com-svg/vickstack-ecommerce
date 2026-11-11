
function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="hero-banner-content">
        <span className="hero-label">
          VICKSTACK MEGA DEALS
        </span>

        <h1>
          Everything You Love.
          <br />
          All in One Place.
        </h1>

        <p>
          Discover amazing products, enjoy exciting deals,
          and upgrade your everyday shopping experience.
        </p>

        <button
          type="button"
          onClick={() => {
            document
              .getElementById("marketplace-products")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Shop Now →
        </button>

        <div className="hero-benefits">
          <span>✓ Amazing Deals</span>
          <span>✓ Quality Products</span>
          <span>✓ Easy Shopping</span>
        </div>
      </div>

      <div className="hero-banner-image">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
          alt="Fashion and lifestyle shopping collection"
        />
      </div>
    </section>
  );
}

export default HeroBanner;

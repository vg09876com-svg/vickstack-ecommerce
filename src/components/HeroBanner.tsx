function HeroBanner() {
  const handleShopNow = () => {
    document
      .getElementById("products-gallery")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero-banner">
      <div className="hero-banner-content">
        <span className="hero-banner-tag">VICKSTACK MEGA DEALS</span>
        <h1>Everything You Love. All in One Place.</h1>
        <p>
          Discover amazing products, enjoy exciting deals, and upgrade your
          everyday shopping experience.
        </p>
        <button
          type="button"
          className="hero-banner-button"
          onClick={handleShopNow}
        >
          Shop Now →
        </button>
      </div>

      <div className="hero-banner-image">
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
          alt="Fashion and lifestyle shopping collection"
          loading="eager"
          fetchPriority="high"
        />
      </div>
    </section>
  );
}

export default HeroBanner;
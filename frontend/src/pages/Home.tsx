import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService, Product } from "../services/productService";
import ProductCard from "../components/ProductCard";
import "./Home.css";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>
        <div className="hero-content">
          <h1>Welcome to VoltEX</h1>
          <p>Your Premier Destination for Electronics and Gadgets</p>
          <Link to="/products" className="cta-button">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="featured-section">
        <div className="container">
          <h2>Featured Products</h2>
          <p>
            Discover our curated selection of premium electronics and gadgets
          </p>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2>Shop by Category</h2>
          <p>Explore our extensive range of tech products</p>
          <div className="categories-grid">
            <Link to="/products?category=smartphones" className="category-card">
              <h3>Smartphones</h3>
            </Link>
            <Link to="/products?category=laptops" className="category-card">
              <h3>Laptops</h3>
            </Link>
            <Link to="/products?category=tablets" className="category-card">
              <h3>Tablets</h3>
            </Link>
            <Link to="/products?category=audio" className="category-card">
              <h3>Audio</h3>
            </Link>
            <Link to="/products?category=wearables" className="category-card">
              <h3>Wearables</h3>
            </Link>
            <Link to="/products?category=gaming" className="category-card">
              <h3>Gaming</h3>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

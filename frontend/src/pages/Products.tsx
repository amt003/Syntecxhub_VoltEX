import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productService, Product } from "../services/productService";
import ProductCard from "../components/ProductCard";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get category directly from URL on every render (don't use state for URL params)
  const category = searchParams.get("category") || "";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts(
        category || undefined,
        search || undefined,
        page,
      );
      setProducts(data.products);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  // Reset page and search when category changes
  useEffect(() => {
    setPage(1);
    setSearch("");
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    // Only update the URL - let the URL listener handle state updates
    if (newCategory) {
      setSearchParams({ category: newCategory });
    } else {
      setSearchParams({});
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="products-page">
      <div className="container">
        <h1>Products</h1>

        <div className="filters">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />

          <select
            value={category}
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="">All Categories</option>
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
            <option value="tablets">Tablets</option>
            <option value="accessories">Accessories</option>
            <option value="audio">Audio</option>
            <option value="wearables">Wearables</option>
            <option value="gaming">Gaming</option>
          </select>
        </div>

        {loading ? (
          <p className="loading">Loading products...</p>
        ) : (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {products.length === 0 && (
              <p className="no-products">No products found</p>
            )}
          </>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="pagination-btn"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`pagination-btn ${page === p ? "active" : ""}`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "react-feather";
import { Product } from "../services/productService";
import { cartService } from "../services/cartService";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { getImageUrl } from "../utils/imageUrl";
import toast from "react-hot-toast";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Add to local store
    addItem({
      productId: product._id,
      quantity: 1,
      price: product.price,
      name: product.name,
      image: product.image,
      stock: product.stock,
    });

    // If authenticated, also save to backend
    if (isAuthenticated) {
      try {
        await cartService.addToCart(product._id, 1);
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to save to cart");
        return;
      }
    }

    toast.success("Product added to cart!");
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-image">
        <img src={getImageUrl(product.image)} alt={product.name} />
        {product.discount > 0 && (
          <span className="discount-badge">{product.discount}%</span>
        )}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="brand">{product.brand}</p>

        <div className="rating">
          <span className="stars">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </span>
          <span className="reviews">({product.reviews})</span>
        </div>

        <div className="price-section">
          <span className="price">₹{product.price}</span>
          {product.discount > 0 && (
            <span className="original-price">
              ₹{(product.price * (1 + product.discount / 100)).toFixed(2)}
            </span>
          )}
        </div>

        <div className="stock-status">
          {product.stock > 0 ? (
            <span className="in-stock">In Stock</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>

        <button
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}

export default ProductCard;

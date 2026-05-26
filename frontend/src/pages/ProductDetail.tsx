import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart } from "react-feather";
import { productService, Product } from "../services/productService";
import { cartService } from "../services/cartService";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { getImageUrl } from "../utils/imageUrl";
import ReviewForm from "../components/ReviewForm";
import ReviewsList from "../components/ReviewsList";
import toast from "react-hot-toast";
import "./ProductDetail.css";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [refreshReviews, setRefreshReviews] = useState(false);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handlePrevImage = () => {
    const images = product?.image || [product?.image].filter(Boolean);
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const images = product?.image || [product?.image].filter(Boolean);
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Add to local store
    addItem({
      productId: product._id,
      quantity,
      price: product.price,
      name: product.name,
      image: product.image,
      stock: product.stock,
    });

    // If authenticated, also save to backend
    if (isAuthenticated) {
      try {
        await cartService.addToCart(product._id, quantity);
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Failed to save to cart");
        return;
      }
    }

    toast.success("Product added to cart!");
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-grid">
          <div className="product-images">
            {product.image && product.image.length > 0 ? (
              <>
                <div className="image-slider">
                  <button
                    className="slider-btn prev-btn"
                    onClick={handlePrevImage}
                    title="Previous image"
                  >
                    ❮
                  </button>
                  <img
                    src={getImageUrl(product.image[currentImageIndex])}
                    alt={product.name}
                    className="main-image"
                  />
                  <button
                    className="slider-btn next-btn"
                    onClick={handleNextImage}
                    title="Next image"
                  >
                    ❯
                  </button>
                </div>
                <div className="image-indicators">
                  <div className="indicator-info">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                  <div className="image-thumbnails">
                    {product.images.map((img, index) => (
                      <img
                        key={index}
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${index + 1}`}
                        className={`thumbnail ${
                          index === currentImageIndex ? "active" : ""
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                        title={`Image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="image-slider">
                <img
                  src={getImageUrl(product.image)}
                  alt={product.name}
                  className="main-image"
                />
              </div>
            )}
          </div>

          <div className="product-details">
            <h1>{product.name}</h1>
            <p className="brand">{product.brand}</p>

            <div className="rating">
              <span className="stars">
                {"★".repeat(Math.round(product.rating))}
                {"☆".repeat(5 - Math.round(product.rating))}
              </span>
              <span>({product.reviews} reviews)</span>
            </div>

            <div className="price-section">
              <span className="price">₹{product.price}</span>
              {product.discount > 0 && (
                <>
                  <span className="original-price">
                    ₹{(product.price * (1 + product.discount / 100)).toFixed(2)}
                  </span>
                  <span className="discount">{product.discount}% OFF</span>
                </>
              )}
            </div>

            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            <div className="description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <div className="specifications">
                  <h3>Specifications</h3>
                  <table>
                    <tbody>
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <td className="spec-key">{key}</td>
                            <td className="spec-value">{value}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            <div className="purchase-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  disabled={product.stock === 0}
                />
              </div>

              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-container">
          <ReviewForm
            productId={id!}
            onReviewAdded={() => setRefreshReviews(!refreshReviews)}
          />
          <ReviewsList
            productId={id!}
            onReviewUpdate={() => {
              // Refresh product to update rating and review count
              if (id) {
                productService.getProductById(id).then(setProduct);
              }
            }}
            triggerRefresh={refreshReviews}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

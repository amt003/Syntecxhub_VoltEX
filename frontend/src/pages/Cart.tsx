import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus } from "react-feather";
import { useCartStore } from "../store/cartStore";
import { cartService } from "../services/cartService";
import { useAuthStore } from "../store/authStore";
import { getImageUrl } from "../utils/imageUrl";
import toast from "react-hot-toast";
import "./Cart.css";

function Cart() {
  const { isAuthenticated } = useAuthStore();
  const { items, totalPrice, setCart, removeItem, updateItem } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        const cart = await cartService.getCart();
        setCart(cart.items || [], cart.totalPrice || 0);
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, setCart]);

  const handleRemove = async (productId: string) => {
    removeItem(productId);
    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(productId);
        toast.success("Product removed from cart");
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number,
  ) => {
    if (newQuantity < 1) return;
    updateItem(productId, newQuantity);
    if (isAuthenticated) {
      try {
        await cartService.updateCartItem(productId, newQuantity);
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    }
  };

  // Calculate delivery charges: 12% for items ₹500+ (based on total price including quantity)
  const deliveryCharge = items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    if (itemTotal >= 500) {
      return total + itemTotal * 0.12;
    }
    return total;
  }, 0);

  const tax = totalPrice * 0.1;
  const grandTotal = totalPrice + deliveryCharge + tax;

  if (loading) return <div className="cart loading">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="cart">
        <div className="container">
          <h1>Shopping Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.productId} className="cart-item">
                {item.image && (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="item-image"
                  />
                )}
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>₹{item.price.toFixed(2)}</p>
                </div>

                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.productId, item.quantity + 1)
                    }
                    disabled={item.quantity >= (item.stock || 0)}
                    title={
                      item.quantity >= (item.stock || 0)
                        ? "Max stock reached"
                        : "Increase quantity"
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="item-total">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => handleRemove(item.productId)}
                  className="remove-btn"
                  title="Remove from cart"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-box">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Delivery:</span>
                <span>₹{deliveryCharge.toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Tax (10%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>

              {isAuthenticated ? (
                <Link to="/checkout" className="checkout-btn">
                  Proceed to Checkout
                </Link>
              ) : (
                <Link to="/login" className="checkout-btn">
                  Login to Checkout
                </Link>
              )}

              <Link to="/products" className="continue-shopping">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

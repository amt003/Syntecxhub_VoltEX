import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { orderService, Order } from "../services/orderService";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import "./Checkout.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("✅ Razorpay script loaded successfully");
    };
    script.onerror = () => {
      console.error("❌ Failed to load Razorpay script");
      toast.error(
        "Failed to load payment gateway. Please refresh and try again.",
      );
    };
    document.body.appendChild(script);

    // Check for pending order from session storage or route state
    const storedOrder = sessionStorage.getItem("pendingOrder");
    const routeOrder = location.state?.pendingOrder;

    if (storedOrder) {
      setPendingOrder(JSON.parse(storedOrder));
      sessionStorage.removeItem("pendingOrder");
    } else if (routeOrder) {
      setPendingOrder(routeOrder);
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [location.state]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If continuing a pending order, skip address requirement
    if (!pendingOrder) {
      if (
        !formData.street ||
        !formData.city ||
        !formData.state ||
        !formData.country ||
        !formData.zipCode
      ) {
        toast.error("Please fill in all address fields");
        return;
      }
    }

    setLoading(true);
    try {
      let orderToProcess;

      // If continuing pending order, use existing order; otherwise create new
      if (pendingOrder) {
        orderToProcess = pendingOrder;
        console.log("Continuing pending order:", orderToProcess._id);
      } else {
        // Create order first
        orderToProcess = await orderService.createOrder(formData);
        console.log("Order created:", orderToProcess);

        if (!orderToProcess || !orderToProcess._id) {
          toast.error("Order creation failed - invalid response");
          setLoading(false);
          return;
        }
      }

      // Create Razorpay order
      const razorpayOrderData = await orderService.createRazorpayOrder(
        orderToProcess._id,
      );
      console.log("Razorpay order created:", razorpayOrderData);

      // Razorpay payment options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        name: "VoltEX",
        description: `Order for ${user?.email}`,
        order_id: razorpayOrderData.razorpayOrder.id,
        handler: async (response: any) => {
          try {
            console.log("✅ Payment handler called with response:", response);
            // Verify payment on backend
            await orderService.processPayment(
              orderToProcess._id,
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
            );

            toast.success("Payment successful! Order placed.");
            clearCart();
            navigate(`/orders`);
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            console.log("⚠️ Payment modal closed by user");
            toast.error("Payment cancelled");
            setLoading(false);
          },
        },
        prefill: {
          email: user?.email || "",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay script not loaded. Please refresh the page.");
      }

      console.log("🔄 Initializing Razorpay with options:", {
        key: options.key ? "***" : "MISSING",
        amount: options.amount,
        order_id: options.order_id,
      });

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("❌ Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error("❌ Error in payment flow:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create order";
      toast.error(errorMessage);
      setLoading(false);
    } finally {
      // Note: setLoading(false) is called in catch block or by payment handlers
    }
  };

  if (items.length === 0 && !pendingOrder) {
    return (
      <div className="checkout">
        <div className="container">
          <h1>Checkout</h1>
          <p>Your cart is empty. Please add items before checking out.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="container">
        <h1>{pendingOrder ? "Continue Payment" : "Checkout"}</h1>

        {pendingOrder && (
          <div className="pending-order-notice">
            <p>
              You are continuing payment for order #
              {pendingOrder._id.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {!pendingOrder && (
              <section className="form-section">
                <h2>Shipping Address</h2>
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleAddressChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>
              </section>
            )}

            {pendingOrder && (
              <section className="form-section">
                <h2>Shipping Address</h2>
                <div className="address-display">
                  <p>
                    {pendingOrder.shippingAddress.street},
                    {pendingOrder.shippingAddress.city}
                  </p>
                  <p>
                    {pendingOrder.shippingAddress.state},
                    {pendingOrder.shippingAddress.country} -
                    {pendingOrder.shippingAddress.zipCode}
                  </p>
                </div>
              </section>
            )}

            <section className="form-section">
              <h2>Payment Method</h2>
              <p className="payment-info">
                Click "Proceed to Payment" to securely process your payment via
                Razorpay. You can use credit/debit cards, UPI, net banking, and
                more.
              </p>
            </section>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="order-items">
              {(pendingOrder ? pendingOrder.items : items).map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="order-item">
                  <div>
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="item-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>
                  ₹
                  {pendingOrder
                    ? (
                        pendingOrder.totalAmount -
                        pendingOrder.totalAmount * 0.1 -
                        pendingOrder.totalAmount * 0.12
                      ).toFixed(2)
                    : totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="total-row">
                <span>Delivery:</span>
                <span>
                  ₹
                  {pendingOrder
                    ? (pendingOrder.totalAmount * 0.12).toFixed(2)
                    : deliveryCharge.toFixed(2)}
                </span>
              </div>
              <div className="total-row">
                <span>Tax (10%):</span>
                <span>
                  ₹
                  {pendingOrder
                    ? (pendingOrder.totalAmount * 0.1).toFixed(2)
                    : tax.toFixed(2)}
                </span>
              </div>
              <div className="total-row final">
                <span>Total:</span>
                <span>
                  ₹
                  {pendingOrder
                    ? pendingOrder.totalAmount.toFixed(2)
                    : grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderService, Order } from "../services/orderService";
import toast from "react-hot-toast";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      toast.success("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  };

  const handleContinuePayment = (order: Order) => {
    // Store order data in session storage for checkout to use
    sessionStorage.setItem("pendingOrder", JSON.stringify(order));
    navigate("/checkout", { state: { pendingOrder: order } });
  };

  if (loading) {
    return <div className="orders loading">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="orders">
        <div className="container">
          <h1>My Orders</h1>
          <p className="no-orders">You haven't placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div className="container">
        <h1>My Orders</h1>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-status">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-price">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="total">
                  <strong>Total:</strong>
                  <strong>₹{order.totalAmount.toFixed(2)}</strong>
                </div>

                {order.status === "pending" && (
                  <div className="order-actions">
                    <button
                      className="continue-btn"
                      onClick={() => handleContinuePayment(order)}
                    >
                      Continue Payment
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;

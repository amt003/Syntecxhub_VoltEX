import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, LogOut, User, LogIn } from "react-feather";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { authService } from "../services/authService";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { items } = useCartStore();

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>VoltEX</h1>
        </Link>

        <div className="navbar-right">
          <Link to="/cart" className="cart-link">
            <ShoppingCart size={24} />
            {items.length > 0 && (
              <span className="cart-badge">{items.length}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-info">
                <User size={20} />
                {user?.name}
              </span>
              {user?.role === "admin" && (
                <Link to="/admin" className="admin-link">
                  Admin
                </Link>
              )}
              <Link to="/orders" className="nav-link">
                Orders
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={20} /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">
                <LogIn size={20} /> Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

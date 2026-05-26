import React from "react";
import { Heart } from "react-feather";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About VoltEX</h3>
          <p>
            VoltEX is your premier destination for cutting-edge electronics and
            gadgets. We deliver quality, innovation, and exceptional customer
            service.
          </p>
        </div>

        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul>
            <li>
              <a href="#contact">Contact Us</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <a href="#shipping">Shipping Info</a>
            </li>
            <li>
              <a href="#returns">Returns</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <a href="#careers">Careers</a>
            </li>
            <li>
              <a href="#blog">Blog</a>
            </li>
            <li>
              <a href="#privacy">Privacy Policy</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Connect With Us</h3>
          <ul>
            <li>
              <a href="#facebook">Facebook</a>
            </li>
            <li>
              <a href="#twitter">Twitter</a>
            </li>
            <li>
              <a href="#instagram">Instagram</a>
            </li>
            <li>
              <a href="#linkedin">LinkedIn</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <Heart size={16} style={{ color: "#ef4444" }} />
        <p>VoltEX. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;

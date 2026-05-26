import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Razorpay from "razorpay";

// Initialize Razorpay lazily to ensure env vars are loaded
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error(
      "❌ Razorpay keys not configured:",
      "RAZORPAY_KEY_ID:",
      process.env.RAZORPAY_KEY_ID ? "set" : "NOT SET",
      "RAZORPAY_KEY_SECRET:",
      process.env.RAZORPAY_KEY_SECRET ? "set" : "NOT SET",
    );
    throw new Error(
      "Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
    );
  }
  console.log("✅ Razorpay keys found - initializing Razorpay instance");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate delivery charges: 12% for items ₹500+ (based on total price including quantity)
    const deliveryCharge = cart.items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      if (itemTotal >= 500) {
        return total + itemTotal * 0.12;
      }
      return total;
    }, 0);

    // Calculate tax (10% on subtotal)
    const tax = cart.totalPrice * 0.1;

    // Calculate total amount
    const totalAmount = cart.totalPrice + deliveryCharge + tax;

    console.log("Order Calculation Debug:", {
      subtotal: cart.totalPrice,
      deliveryCharge,
      tax,
      totalAmount,
      cartItems: cart.items.length,
    });

    if (!totalAmount || isNaN(totalAmount)) {
      return res.status(400).json({
        message: "Invalid order total",
        debug: { subtotal: cart.totalPrice, deliveryCharge, tax },
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      shippingAddress,
      status: "pending",
      paymentStatus: "pending",
    });

    // Clear cart after order creation
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      order,
      message: "Order created successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate(
      "items.productId",
    );

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.productId",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

export const processPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to process this order" });
    }

    try {
      // Verify payment signature
      const crypto = await import("crypto");
      const hmac = crypto.default
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (hmac === razorpaySignature) {
        order.paymentStatus = "completed";
        order.status = "confirmed";
        order.paymentMethod = "razorpay";
        order.transactionId = razorpayPaymentId;
        await order.save();

        // Reduce product stock quantities
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock -= item.quantity;
            product.stock = Math.max(0, product.stock); // Ensure stock doesn't go negative
            await product.save();
            console.log(
              `✅ Stock reduced for ${product.name}: ${item.quantity} units sold. New stock: ${product.stock}`,
            );
          }
        }

        res.status(200).json({
          success: true,
          order,
          message: "Payment processed successfully",
        });
      } else {
        order.paymentStatus = "failed";
        await order.save();

        res.status(400).json({
          message: "Payment signature verification failed",
          success: false,
        });
      }
    } catch (error) {
      order.paymentStatus = "failed";
      await order.save();

      res.status(400).json({
        message: "Payment processing failed",
        error: error.message,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing payment", error: error.message });
  }
};

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    console.log("🔍 createRazorpayOrder called with orderId:", orderId);

    if (!orderId) {
      console.error("❌ Order ID is missing");
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      console.error("❌ Order not found:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order found:", {
      orderId: order._id,
      totalAmount: order.totalAmount,
      userId: order.userId,
    });

    if (order.userId.toString() !== req.user.id) {
      console.error("❌ Authorization failed - user mismatch");
      return res
        .status(403)
        .json({ message: "Not authorized to create payment for this order" });
    }

    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: orderId.toString(),
      payment_capture: 1,
    };

    console.log("📝 Razorpay options:", options);

    const razorpay = getRazorpay();
    console.log("✅ Razorpay instance obtained");

    const razorpayOrder = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", razorpayOrder.id);

    res.status(200).json({
      success: true,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Razorpay Order Creation Error:");
    console.error("Error message:", error.message);
    console.error("Error details:", error.response?.data || error);
    console.error("Stack trace:", error.stack);

    res.status(500).json({
      message: "Error creating Razorpay order",
      error: error.message,
      details: error.response?.data || null,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel this order" });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      order,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling order", error: error.message });
  }
};

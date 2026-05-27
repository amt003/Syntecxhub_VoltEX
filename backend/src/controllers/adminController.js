import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// Product Management
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, stock, specifications } =
      req.body;

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one product image (up to 4)",
      });
    }

    // Create image URL paths
    const images = req.files.map(
      (file) => `/uploads/products/${file.filename}`,
    );
    const image = images[0]; // Primary image is the first one

    // Parse specifications if provided
    let specsObject = {};
    if (specifications) {
      try {
        specsObject = JSON.parse(specifications);
      } catch (e) {
        console.error("Error parsing specifications:", e);
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      brand,
      stock,
      image,
      images,
      specifications: specsObject,
    });

    res.status(201).json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      products,
      message: "Products retrieved successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Parse specifications if provided as JSON string
    if (
      updateData.specifications &&
      typeof updateData.specifications === "string"
    ) {
      try {
        updateData.specifications = JSON.parse(updateData.specifications);
      } catch (e) {
        console.error("Error parsing specifications:", e);
      }
    }

    // If files were uploaded, update the image paths
    if (req.files && req.files.length > 0) {
      const images = req.files.map(
        (file) => `/uploads/products/${file.filename}`,
      );
      updateData.image = images[0]; // Primary image is the first one
      updateData.images = images;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      product,
      message: "Product updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// Order Management
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate("userId", "name email")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Build update object
    const updateData = { status };

    // Automatically update payment status based on order status
    if (status === "confirmed") {
      updateData.paymentStatus = "completed";
    } else if (status === "cancelled") {
      updateData.paymentStatus = "failed";
    }

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
      message: "Order status updated",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order", error: error.message });
  }
};

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email");

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

export const getProductAnalytics = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: { _id: "$items.productId", count: { $sum: "$items.quantity" } },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      topProducts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: error.message });
  }
};

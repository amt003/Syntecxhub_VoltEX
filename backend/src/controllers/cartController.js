import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
    );

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    // Map items to include both productId (as string) and product details with stock
    const formattedCart = {
      ...cart.toObject(),
      items: cart.items.map((item) => ({
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        price: item.price,
        name: item.productId.name,
        image: item.productId.image,
        stock: item.productId.stock,
      })),
    };

    res.status(200).json({
      success: true,
      cart: formattedCart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Product ID and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if sufficient stock is available
    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: product.stock,
        requested: quantity,
      });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        items: [{ productId, quantity, price: product.price }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price: product.price });
      }
    }

    // Calculate total
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    await cart.save();

    // Populate and format response
    cart = await cart.populate("items.productId");
    const formattedCart = {
      ...cart.toObject(),
      items: cart.items.map((item) => ({
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        price: item.price,
        name: item.productId.name,
        image: item.productId.image,
        stock: item.productId.stock,
      })),
    };

    res.status(200).json({
      success: true,
      cart: formattedCart,
      message: "Product added to cart",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    await cart.save();

    // Populate and format response
    cart = await cart.populate("items.productId");
    const formattedCart = {
      ...cart.toObject(),
      items: cart.items.map((item) => ({
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        price: item.price,
        name: item.productId.name,
        image: item.productId.image,
        stock: item.productId.stock,
      })),
    };

    res.status(200).json({
      success: true,
      cart: formattedCart,
      message: "Product removed from cart",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing from cart", error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Quantity must be greater than 0" });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: product.stock,
        requested: quantity,
      });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (!item) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    item.quantity = quantity;
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    await cart.save();

    // Populate and format response
    cart = await cart.populate("items.productId");
    const formattedCart = {
      ...cart.toObject(),
      items: cart.items.map((item) => ({
        productId: item.productId._id.toString(),
        quantity: item.quantity,
        price: item.price,
        name: item.productId.name,
        image: item.productId.image,
        stock: item.productId.stock,
      })),
    };

    res.status(200).json({
      success: true,
      cart: formattedCart,
      message: "Cart updated",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      cart,
      message: "Cart cleared",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

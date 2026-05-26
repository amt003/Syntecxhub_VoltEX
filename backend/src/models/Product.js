import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    images: [String],
    category: {
      type: String,
      enum: [
        "smartphones",
        "laptops",
        "tablets",
        "accessories",
        "audio",
        "wearables",
        "gaming",
      ],
      required: true,
    },
    brand: String,
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    specifications: {
      type: Map,
      of: String,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

productSchema.pre("save", function (next) {
  this.inStock = this.stock > 0;
  next();
});

export default mongoose.model("Product", productSchema);

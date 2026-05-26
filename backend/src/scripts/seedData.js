import Product from "../models/Product.js";

const products = [
  {
    name: "iPhone 15 Pro",
    description: "Latest Apple flagship with A17 Pro chip",
    price: 999,
    image: "https://via.placeholder.com/300x300?text=iPhone+15+Pro",
    category: "smartphones",
    brand: "Apple",
    stock: 50,
    rating: 4.8,
    reviews: 320,
    featured: true,
    discount: 5,
    specifications: {
      storage: "256GB",
      ram: "8GB",
      display: "6.1 inch",
      battery: "3200 mAh",
    },
  },
  {
    name: "Samsung Galaxy S24",
    description: "Powerful Android phone with amazing camera",
    price: 899,
    image: "https://via.placeholder.com/300x300?text=Galaxy+S24",
    category: "smartphones",
    brand: "Samsung",
    stock: 45,
    rating: 4.7,
    reviews: 280,
    featured: true,
    discount: 10,
    specifications: {
      storage: "256GB",
      ram: "12GB",
      display: "6.2 inch",
      battery: "4000 mAh",
    },
  },
  {
    name: "MacBook Pro 16",
    description: "Powerful laptop for professionals",
    price: 2499,
    image: "https://via.placeholder.com/300x300?text=MacBook+Pro",
    category: "laptops",
    brand: "Apple",
    stock: 20,
    rating: 4.9,
    reviews: 180,
    featured: true,
    discount: 0,
    specifications: {
      processor: "M3 Max",
      ram: "36GB",
      storage: "1TB SSD",
      display: "16 inch",
    },
  },
  {
    name: "Dell XPS 15",
    description: "Premium Windows laptop with OLED display",
    price: 2299,
    image: "https://via.placeholder.com/300x300?text=Dell+XPS+15",
    category: "laptops",
    brand: "Dell",
    stock: 25,
    rating: 4.6,
    reviews: 150,
    featured: true,
    discount: 8,
    specifications: {
      processor: "Intel i9",
      ram: "32GB",
      storage: "1TB SSD",
      display: "15.6 inch OLED",
    },
  },
  {
    name: "iPad Air",
    description: "Versatile tablet for work and creativity",
    price: 599,
    image: "https://via.placeholder.com/300x300?text=iPad+Air",
    category: "tablets",
    brand: "Apple",
    stock: 30,
    rating: 4.5,
    reviews: 200,
    featured: true,
    discount: 5,
    specifications: {
      storage: "256GB",
      ram: "8GB",
      display: "11 inch",
      battery: "8000 mAh",
    },
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise cancelling headphones",
    price: 399,
    image: "https://via.placeholder.com/300x300?text=Sony+WH-1000XM5",
    category: "audio",
    brand: "Sony",
    stock: 100,
    rating: 4.8,
    reviews: 450,
    featured: true,
    discount: 15,
    specifications: {
      driver: "40mm",
      battery: "30 hours",
      connectivity: "Bluetooth 5.3",
      weight: "250g",
    },
  },
  {
    name: "Apple Watch Series 9",
    description: "Advanced health and fitness tracker",
    price: 399,
    image: "https://via.placeholder.com/300x300?text=Apple+Watch+9",
    category: "wearables",
    brand: "Apple",
    stock: 60,
    rating: 4.7,
    reviews: 380,
    featured: true,
    discount: 10,
    specifications: {
      display: "2.0 inch",
      battery: "18 hours",
      storage: "32GB",
      water_resistance: "50m",
    },
  },
  {
    name: "PlayStation 5",
    description: "Next-gen gaming console",
    price: 499,
    image: "https://via.placeholder.com/300x300?text=PS5",
    category: "gaming",
    brand: "Sony",
    stock: 15,
    rating: 4.8,
    reviews: 520,
    featured: true,
    discount: 0,
    specifications: {
      storage: "825GB SSD",
      ram: "16GB GDDR6",
      resolution: "4K@120fps",
      power: "350W",
    },
  },
];

export const seedDatabase = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});

    // Insert sample products
    await Product.insertMany(products);
    console.log("Database seeded with sample products");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

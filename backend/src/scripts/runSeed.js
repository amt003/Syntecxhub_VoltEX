import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedDatabase } from "./seedData.js";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    seedDatabase();
  })
  .catch((err) => console.log("MongoDB connection error:", err));

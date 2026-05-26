import express from "express";
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  refreshAccessToken,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);

export default router;

import { Router } from "express";
import {
  getUserInfo,
  login,
  signup,
  updateProfile,
  addProfile,
  removeProfile,
  logOut,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/profiles/" });

const authRoutes = Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile",
  verifyToken,
  upload.single("profile-image"),
  addProfile
);

authRoutes.delete("/remove-profile", verifyToken, removeProfile);
authRoutes.post("/logout", logOut);

export default authRoutes;

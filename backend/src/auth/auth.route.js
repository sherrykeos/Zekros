import express from "express";
import * as authController from "./auth.controller.js";
import passport from "passport";
import authenticate from "./auth.middleware.js";
import { app } from "../config/app.config.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verify);
router.post("/resend-verification", authController.resendVerification);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.patch("/change-password", authenticate, authController.changePassword);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${app.frontendUrl}/login?error=google`,
  }),
  authController.googleCallback,
);


router.get("/me", authenticate, authController.me);
router.patch("/profile", authenticate, authController.updateProfile);
router.delete("/profile", authenticate, authController.deleteAccount);

export default router;

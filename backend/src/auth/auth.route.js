// const {
//   register,
//   login,
//   verify,
//   resendVerification,
// } = require("./auth.controller");

const express = require("express");
const authController = require("./auth.controller");
const passport = require("passport");
const authenticate = require("./auth.middleware");
const { app } = require("../config/app.config");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify", authController.verify);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

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
// router.post("/resend-verification", authController.resendVerification);

module.exports = router;

import jwt from "jsonwebtoken";
import auth from "../config/auth.config.js";

/**
 * Generate Access Token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: auth.accessToken.expiresIn,
  });
}

/**
 * Generate Refresh Token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: auth.refreshToken.expiresIn,
  });
}

/**
 * Verify Access Token
 */
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

/**
 * Verify Refresh Token
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
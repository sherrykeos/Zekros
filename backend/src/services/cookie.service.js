const auth = require("../config/auth.config");

const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Returns cookie options for refresh token
 */
function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: auth.session.expiresInDays * 24 * 60 * 60 * 1000,
  };
}

/**
 * Set Refresh Token Cookie
 */
function setRefreshTokenCookie(res, refreshToken) {
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getRefreshTokenCookieOptions()
  );
}

/**
 * Clear Refresh Token Cookie
 */
function clearRefreshTokenCookie(res) {
  res.clearCookie(
    REFRESH_COOKIE_NAME,
    getRefreshTokenCookieOptions()
  );
}

module.exports = {
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
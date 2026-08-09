import auth from "../config/auth.config.js";

const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Returns cookie options for refresh token
 */
function getRefreshTokenCookieOptions() {
  const isDev = process.env.NODE_ENV === "development";
  const isProduction = !isDev;
  const sameSite = isProduction
    ? process.env.COOKIE_SAME_SITE || "none"
    : "lax";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSite,
    maxAge: auth.session.expiresInDays * 24 * 60 * 60 * 1000,
    path: "/",
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

export {
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
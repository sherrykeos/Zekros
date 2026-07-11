const crypto = require("crypto");

/**
 * Generate a secure random token.
 */
function generateToken(bytes) {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Hash a token before storing it.
 */
function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

module.exports = {
  generateToken,
  hashToken,
};
import crypto from "crypto";

/**
 * Generates compact, non-sequential IDs suitable for in-memory entities now and
 * database rows later. The prefix keeps exported history easier to inspect.
 *
 * @param {string} [prefix="id"] Domain prefix such as "match" or "move".
 * @returns {string} Unique-enough runtime ID for backend domain objects.
 */
function generateId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(6).toString("hex")}`;
}

export default generateId;

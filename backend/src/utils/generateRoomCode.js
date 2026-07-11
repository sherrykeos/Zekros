const crypto = require("crypto");

const DEFAULT_ROOM_CODE_LENGTH = 7;
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates a human-friendly room code for lobbies. Ambiguous characters are
 * excluded so codes are easier to read aloud and type on mobile.
 *
 * @param {number} [length=DEFAULT_ROOM_CODE_LENGTH] Number of characters.
 * @returns {string} Uppercase room code.
 */
function generateRoomCode(length = DEFAULT_ROOM_CODE_LENGTH) {
  let code = "";

  for (let index = 0; index < length; index++) {
    const randomIndex = crypto.randomInt(0, ROOM_CODE_ALPHABET.length);
    code += ROOM_CODE_ALPHABET[randomIndex];
  }

  return code;
}

generateRoomCode.DEFAULT_LENGTH = DEFAULT_ROOM_CODE_LENGTH;
generateRoomCode.ALPHABET = ROOM_CODE_ALPHABET;

module.exports = generateRoomCode;

import generateId from "../utils/id.js";

const PLAYER_TYPE = Object.freeze({
  HUMAN: "HUMAN",
  BOT: "BOT",
});

const PLAYER_STATUS = Object.freeze({
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  READY: "READY",
  PLAYING: "PLAYING",
  DISCONNECTED: "DISCONNECTED",
});

/**
 * Player describes a room participant, not an authenticated account. Keeping it
 * small lets future auth attach a user id without changing room membership.
 */
class Player {
  /**
   * @param {object} options Player creation options.
   * @param {string} [options.id] Stable player id for runtime and future storage.
   * @param {string} [options.name] Display name shown in lobbies and matches.
   * @param {string|null} [options.symbol] Engine symbol assigned for a match.
   * @param {string} [options.type] HUMAN or BOT.
   * @param {string} [options.status] Current lobby/connection status.
   * @param {string|null} [options.socketId] Future Socket.IO connection id.
   * @param {string|Date} [options.joinedAt] Time the player joined the room.
   * @param {object} [options.metadata] Optional future-safe player metadata.
   */
  constructor({
    id = generateId("player"),
    name = "Player",
    symbol = null,
    type = PLAYER_TYPE.HUMAN,
    status = PLAYER_STATUS.ONLINE,
    socketId = null,
    joinedAt = new Date(),
    metadata = {},
  } = {}) {
    this.id = id;
    this.name = name;
    this.symbol = symbol;
    this.type = type;
    this.status = status;
    this.socketId = socketId;
    this.joinedAt = this.toIsoString(joinedAt);
    this.metadata = this.clone(metadata);
  }

  /**
   * Updates lobby/match status without exposing enum strings throughout callers.
   *
   * @param {string} status New player status.
   */
  setStatus(status) {
    this.status = status;
  }

  /**
   * Assigns the GameEngine symbol used by this participant for a match.
   *
   * @param {string|null} symbol Engine symbol, usually "X" or "O".
   */
  setSymbol(symbol) {
    this.symbol = symbol;
  }

  /**
   * Stores the current socket connection id while keeping networking optional.
   *
   * @param {string|null} socketId Socket.IO id when real-time transport is added.
   */
  setSocketId(socketId) {
    this.socketId = socketId;
  }

  /**
   * Marks the player disconnected without removing their room identity.
   */
  markDisconnected() {
    this.status = PLAYER_STATUS.DISCONNECTED;
    this.socketId = null;
  }

  /**
   * @returns {object} Serializable player state for managers, APIs, or sockets.
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      symbol: this.symbol,
      type: this.type,
      status: this.status,
      socketId: this.socketId,
      joinedAt: this.joinedAt,
      metadata: this.clone(this.metadata),
    };
  }

  toIsoString(value) {
    return value instanceof Date ? value.toISOString() : value;
  }

  clone(value) {
    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value));
  }
}

Player.TYPE = PLAYER_TYPE;
Player.STATUS = PLAYER_STATUS;

export default Player;

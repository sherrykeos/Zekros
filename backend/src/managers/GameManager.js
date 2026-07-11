import GameEngine from "../Engine/GameEngine.js";
import { success, failure } from "../utils/managerResponse.js";

const GAME_MANAGER_ERRORS = Object.freeze({
  INVALID_MATCH_ID: "GAME_INVALID_MATCH_ID",
  INVALID_CONFIG: "GAME_INVALID_CONFIG",
  GAME_EXISTS: "GAME_EXISTS",
  GAME_NOT_FOUND: "GAME_NOT_FOUND",
});

/**
 * GameManager owns runtime GameEngine instances keyed by match id. It exists so
 * engine lifecycle stays centralized and does not leak into rooms or transports.
 */
class GameManager {
  constructor() {
    this.games = new Map();
  }

  /**
   * Creates and stores a GameEngine for a match.
   *
   * @param {string} matchId Match id used as the runtime game key.
   * @param {object} config GameEngine configuration.
   * @returns {object} Standard manager response containing the GameEngine.
   */
  createGame(matchId, config) {
    if (!matchId) {
      return failure(GAME_MANAGER_ERRORS.INVALID_MATCH_ID, "A match id is required to create a game.");
    }

    if (!config) {
      return failure(GAME_MANAGER_ERRORS.INVALID_CONFIG, "Game configuration is required.");
    }

    if (this.games.has(matchId)) {
      return failure(GAME_MANAGER_ERRORS.GAME_EXISTS, "A game already exists for this match.");
    }

    const game = new GameEngine(config);
    this.games.set(matchId, game);

    return success(game);
  }

  /**
   * Retrieves a GameEngine by match id.
   *
   * @param {string} matchId Match id.
   * @returns {object} Standard manager response containing the GameEngine.
   */
  getGame(matchId) {
    const game = this.games.get(matchId);

    if (!game) {
      return failure(GAME_MANAGER_ERRORS.GAME_NOT_FOUND, "Game not found.");
    }

    return success(game);
  }

  /**
   * Checks whether a GameEngine exists for a match.
   *
   * @param {string} matchId Match id.
   * @returns {object} Standard manager response containing a boolean.
   */
  hasGame(matchId) {
    return success(this.games.has(matchId));
  }

  /**
   * Deletes a GameEngine so finished/deleted rooms do not leak memory.
   *
   * @param {string} matchId Match id.
   * @returns {object} Standard manager response containing true when removed.
   */
  deleteGame(matchId) {
    if (!this.games.has(matchId)) {
      return failure(GAME_MANAGER_ERRORS.GAME_NOT_FOUND, "Game not found.");
    }

    this.games.delete(matchId);

    return success(true);
  }

  /**
   * Executes a move in a specific game.
   *
   * @param {string} matchId The ID of the match/game.
   * @param {string} move The move to be made (e.g., "1-1").
   * @returns {object} Standard manager response with the game state.
   */
  makeMove(matchId, move) {
    const gameResponse = this.getGame(matchId);

    if (!gameResponse.success) {
      return gameResponse;
    }

    const game = gameResponse.data;
    const moveResult = game.makeMove(move);

    if (!moveResult.success) {
      // The GameEngine itself returns a success/failure object.
      // We can wrap it in our standard manager failure response.
      return failure("INVALID_MOVE", moveResult.message); // Use the message directly
    }

    return success(game.getState());
  }

  /**
   * Replaces a match's GameEngine with a fresh instance.
   *
   * @param {string} matchId Match id.
   * @param {object} config GameEngine configuration.
   * @returns {object} Standard manager response containing the fresh GameEngine.
   */
  resetGame(matchId, config) {
    if (!this.games.has(matchId)) {
      return failure(GAME_MANAGER_ERRORS.GAME_NOT_FOUND, "Game not found.");
    }

    if (!config) {
      return failure(GAME_MANAGER_ERRORS.INVALID_CONFIG, "Game configuration is required.");
    }

    const game = new GameEngine(config);
    this.games.set(matchId, game);

    return success(game);
  }
}

GameManager.ERRORS = GAME_MANAGER_ERRORS;

const gameManagerInstance = new GameManager();
export default gameManagerInstance;


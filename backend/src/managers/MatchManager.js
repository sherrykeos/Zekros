import Match from "../entities/Match.js";
import gameManagerInstance from "./GameManager.js";
import BotService from "../services/BotService.js";
import generateId from "../utils/id.js";
import { success, failure } from "../utils/managerResponse.js";

const MATCH_MANAGER_ERRORS = Object.freeze({
  INVALID_CONFIG: "MATCH_INVALID_CONFIG",
  MATCH_EXISTS: "MATCH_EXISTS",
  MATCH_NOT_FOUND: "MATCH_NOT_FOUND",
  MATCH_FINISHED: "MATCH_FINISHED",
  INVALID_MOVE: "INVALID_MOVE",
  NOT_PLAYER_TURN: "NOT_PLAYER_TURN",
  PLAYER_NOT_IN_MATCH: "PLAYER_NOT_IN_MATCH",
  BOT_MOVE_FAILED: "BOT_MOVE_FAILED",
});

class MatchManager {
  constructor({ gameManager = gameManagerInstance, botService = BotService } = {}) {
    this.gameManager = gameManager;
    this.botService = botService;
    this.matches = new Map();
  }

  createMatch({ id = generateId("match"), config, metadata = {} } = {}) {
    if (!config) {
      return failure(MATCH_MANAGER_ERRORS.INVALID_CONFIG, "Game configuration is required to create a match.");
    }

    if (this.matches.has(id)) {
      return failure(MATCH_MANAGER_ERRORS.MATCH_EXISTS, "A match already exists with this id.");
    }

    const gameResponse = this.gameManager.createGame(id, config);

    if (!gameResponse.success) {
      return gameResponse;
    }

    const match = new Match({ id, game: gameResponse.data, metadata });
    this.matches.set(id, match);

    return success(match);
  }

  getMatch(matchId) {
    const match = this.matches.get(matchId);

    if (!match) {
      return failure(MATCH_MANAGER_ERRORS.MATCH_NOT_FOUND, "Match not found.");
    }

    return success(match);
  }

  hasMatch(matchId) {
    return success(this.matches.has(matchId));
  }

  deleteMatch(matchId) {
    if (!this.matches.has(matchId)) {
      return failure(MATCH_MANAGER_ERRORS.MATCH_NOT_FOUND, "Match not found.");
    }

    this.gameManager.deleteGame(matchId);
    this.matches.delete(matchId);

    return success(true);
  }

  makeMove(matchId, { playerId, move, allowBot = true, metadata = {} } = {}) {
    const matchResponse = this.getMatch(matchId);

    if (!matchResponse.success) {
      return matchResponse;
    }

    const match = matchResponse.data;

    if (match.status === Match.STATUS.FINISHED || match.game.isGameOver()) {
      return failure(MATCH_MANAGER_ERRORS.MATCH_FINISHED, "Match is already finished.");
    }

    const turnValidation = this.validateParticipantTurn(match, playerId);

    if (!turnValidation.success) {
      return turnValidation;
    }

    const appliedMoves = [];
    const humanMoveResponse = this.applyMove(match, move, {
      ...metadata,
      playerId,
      source: "HUMAN",
    });

    if (!humanMoveResponse.success) {
      return humanMoveResponse;
    }

    appliedMoves.push(humanMoveResponse.data);

    if (allowBot) {
      const botResponse = this.executeBotTurns(match);

      if (!botResponse.success) {
        return botResponse;
      }

      appliedMoves.push(...botResponse.data);
    }

    return success(this.createMoveResponse(match, appliedMoves));
  }

  finishMatch(matchId, winner = null) {
    const matchResponse = this.getMatch(matchId);

    if (!matchResponse.success) {
      return matchResponse;
    }

    const match = matchResponse.data;
    match.finish(winner ?? match.game.getWinner());

    return success(match);
  }

  restartMatch(matchId, config = null, metadata = null) {
    const matchResponse = this.getMatch(matchId);

    if (!matchResponse.success) {
      return matchResponse;
    }

    const match = matchResponse.data;
    const nextConfig = config ?? match.config;
    const gameResponse = this.gameManager.resetGame(matchId, nextConfig);

    if (!gameResponse.success) {
      return gameResponse;
    }

    match.reset(gameResponse.data, metadata);

    return success(match);
  }

  getHistory(matchId) {
    const matchResponse = this.getMatch(matchId);

    if (!matchResponse.success) {
      return matchResponse;
    }

    return success(matchResponse.data.getHistory());
  }

  getReplayData(matchId) {
    const matchResponse = this.getMatch(matchId);

    if (!matchResponse.success) {
      return matchResponse;
    }

    return success(matchResponse.data.getReplayData());
  }

  validateParticipantTurn(match, playerId) {
    const participants = match.metadata?.participants ?? [];

    if (!playerId || participants.length === 0) {
      return success(true);
    }

    const participant = participants.find((entry) => entry.id === playerId);

    if (!participant) {
      return failure(MATCH_MANAGER_ERRORS.PLAYER_NOT_IN_MATCH, "Player is not part of this match.");
    }

    if (participant.symbol !== match.game.currentTurn) {
      return failure(MATCH_MANAGER_ERRORS.NOT_PLAYER_TURN, "It's not your turn.");
    }

    return success(true);
  }

  applyMove(match, move, metadata) {
    const historyLengthBefore = match.moveHistory.length;
    const moveResult = match.makeMove(move, metadata);

    if (!moveResult.success) {
      return failure(MATCH_MANAGER_ERRORS.INVALID_MOVE, moveResult.message ?? "Invalid move.");
    }

    return success(match.moveHistory[historyLengthBefore]);
  }

  executeBotTurns(match) {
    const appliedMoves = [];
    const maxBotMovesPerRequest = 1;

    for (let index = 0; index < maxBotMovesPerRequest; index++) {
      if (match.game.isGameOver()) {
        break;
      }

      const botParticipant = this.getCurrentBotParticipant(match);

      if (!botParticipant) {
        break;
      }

      const move = this.botService.chooseMove({
        game: match.game,
        mode: match.metadata?.gameMode,
        symbol: botParticipant.symbol,
      });

      if (!move) {
        return failure(MATCH_MANAGER_ERRORS.BOT_MOVE_FAILED, "Bot could not choose a legal move.");
      }

      const moveResponse = this.applyMove(match, move, {
        playerId: botParticipant.id,
        source: "BOT",
        botName: botParticipant.name,
        gameMode: match.metadata?.gameMode,
      });

      if (!moveResponse.success) {
        return moveResponse;
      }

      appliedMoves.push(moveResponse.data);
    }

    return success(appliedMoves);
  }

  getCurrentBotParticipant(match) {
    const participants = match.metadata?.participants ?? [];

    return participants.find(
      (participant) => participant.symbol === match.game.currentTurn && participant.type === "BOT",
    ) ?? null;
  }

  createMoveResponse(match, appliedMoves = []) {
    const gameState = match.game.getState();

    return {
      ...gameState,
      matchId: match.id,
      matchStatus: match.status,
      match: match.getState(),
      appliedMoves,
    };
  }
}

MatchManager.ERRORS = MATCH_MANAGER_ERRORS;

const matchManagerInstance = new MatchManager();
export default matchManagerInstance;

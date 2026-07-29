import Match from "../entities/Match.js";
import gameManagerInstance from "./GameManager.js";
import BotService from "../services/BotService.js";
import * as MatchService from "../services/match.service.js";
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
  constructor({
    gameManager = gameManagerInstance,
    botService = BotService,
    matchService = MatchService,
  } = {}) {
    this.gameManager = gameManager;
    this.botService = botService;
    this.matchService = matchService;
    this.matches = new Map();
  }

  async createMatch({ id = generateId("match"), config, metadata = {} } = {}) {
    if (!config) {
      return failure(
        MATCH_MANAGER_ERRORS.INVALID_CONFIG,
        "Game configuration is required to create a match.",
      );
    }

    if (this.matches.has(id)) {
      return failure(
        MATCH_MANAGER_ERRORS.MATCH_EXISTS,
        "A match already exists with this id.",
      );
    }

    const gameResponse = this.gameManager.createGame(id, config);

    if (!gameResponse.success) {
      return gameResponse;
    }

    const match = new Match({ id, game: gameResponse.data, metadata });
    this.matches.set(id, match);

    try {
      await this.matchService.persistMatch(match);
    } catch (error) {
      this.matches.delete(id);
      this.gameManager.deleteGame(id);
      throw error;
    }

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

  async deleteMatch(matchId, userId = null) {
    this.gameManager.deleteGame(matchId);
    this.matches.delete(matchId);

    try {
      await this.matchService.deleteMatch(matchId, userId);
    } catch {
      // Record might already be removed
    }

    return success(true);
  }

  async cleanupUnfinishedMatches() {
    return await this.matchService.cleanupUnfinishedMatches();
  }

  async makeMove(
    matchId,
    { playerId, move, allowBot = true, metadata = {} } = {},
  ) {
    const matchResponse = this.getMatch(matchId);

    if (!matchResponse.success) {
      return matchResponse;
    }

    const match = matchResponse.data;

    if (match.status === Match.STATUS.FINISHED || match.game.isGameOver()) {
      return failure(
        MATCH_MANAGER_ERRORS.MATCH_FINISHED,
        "Match is already finished.",
      );
    }

    const turnValidation = this.validateParticipantTurn(match, playerId);

    if (!turnValidation.success) {
      return turnValidation;
    }

    const appliedMoves = [];
    const humanMoveResponse = await this.applyAndPersistMove(match, move, {
      ...metadata,
      playerId,
      source: "HUMAN",
    });

    if (!humanMoveResponse.success) {
      return humanMoveResponse;
    }

    appliedMoves.push(humanMoveResponse.data);

    if (allowBot) {
      const botResponse = await this.executeBotTurns(match);

      if (!botResponse.success) {
        return botResponse;
      }

      appliedMoves.push(...botResponse.data);
    }

    return success(this.createMoveResponse(match, appliedMoves));
  }

  async finishMatch(matchId, winner = null) {
    const matchResponse = this.getMatch(matchId);

    if (!matchResponse.success) {
      return matchResponse;
    }

    const match = matchResponse.data;
    const snapshot = this.captureRuntimeSnapshot(match);

    match.finish(winner ?? match.game.getWinner());

    try {
      await this.matchService.completeMatch(match);
    } catch (error) {
      this.restoreRuntimeSnapshot(match, snapshot);
      throw error;
    }

    return success(match);
  }


  async createRematch(matchId, { metadata = null } = {}) {
    const matchResponse = this.getMatch(matchId);

    if (!matchResponse.success) {
      return matchResponse;
    }

    const previousMatch = matchResponse.data;

    return this.createMatch({
      config: { ...previousMatch.config },
      metadata: this.createRematchMetadata(previousMatch, metadata),
    });
  }

  createRematchMetadata(previousMatch, metadataOverride = null) {
    const sourceMetadata = metadataOverride ?? previousMatch.metadata ?? {};

    return {
      ...previousMatch.clone(sourceMetadata),
      previousMatchId: previousMatch.id,
      rematchOf: sourceMetadata.rematchOf ?? previousMatch.metadata?.rematchOf ?? previousMatch.id,
    };
  }

  async getHistory(matchId) {
    const history = await this.matchService.getHistory(matchId);

    if (!history) {
      return failure(MATCH_MANAGER_ERRORS.MATCH_NOT_FOUND, "Match not found.");
    }

    return success(history);
  }

  async listMatches(params) {
    const matches = await this.matchService.listMatches(params);
    return success(matches);
  }

  async getReplayData(matchId) {
    const replay = await this.matchService.getReplay(matchId);

    if (!replay) {
      return failure(MATCH_MANAGER_ERRORS.MATCH_NOT_FOUND, "Match not found.");
    }

    return success(replay);
  }

  validateParticipantTurn(match, playerId) {
    const participants = match.metadata?.participants ?? [];

    if (!playerId || participants.length === 0) {
      return success(true);
    }

    const participant = participants.find((entry) => entry.id === playerId);

    if (!participant) {
      return failure(
        MATCH_MANAGER_ERRORS.PLAYER_NOT_IN_MATCH,
        "Player is not part of this match.",
      );
    }

    if (participant.symbol !== match.game.currentTurn) {
      return failure(
        MATCH_MANAGER_ERRORS.NOT_PLAYER_TURN,
        "It's not your turn.",
      );
    }

    return success(true);
  }

  async applyAndPersistMove(match, move, metadata) {
    const snapshot = this.captureRuntimeSnapshot(match);
    const moveResponse = this.applyMove(match, move, metadata);

    if (!moveResponse.success) {
      return moveResponse;
    }

    try {
      await this.matchService.persistMove(match, moveResponse.data);
    } catch (error) {
      this.restoreRuntimeSnapshot(match, snapshot);
      throw error;
    }

    return moveResponse;
  }

  applyMove(match, move, metadata) {
    const historyLengthBefore = match.moveHistory.length;
    const moveResult = match.makeMove(move, metadata);

    if (!moveResult.success) {
      return failure(
        MATCH_MANAGER_ERRORS.INVALID_MOVE,
        moveResult.message ?? "Invalid move.",
      );
    }

    return success(match.moveHistory[historyLengthBefore]);
  }

  async executeBotTurns(match) {
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
        return failure(
          MATCH_MANAGER_ERRORS.BOT_MOVE_FAILED,
          "Bot could not choose a legal move.",
        );
      }

      const moveResponse = await this.applyAndPersistMove(match, move, {
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

    return (
      participants.find(
        (participant) =>
          participant.symbol === match.game.currentTurn &&
          participant.type === "BOT",
      ) ?? null
    );
  }

  captureRuntimeSnapshot(match) {
    return {
      game: match.game.clone(),
      config: { ...match.config },
      moveHistory: match.getMoveHistory(),
      winner: match.winner,
      status: match.status,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
      metadata: match.clone(match.metadata),
    };
  }

  restoreRuntimeSnapshot(match, snapshot) {
    match.game = snapshot.game;
    match.config = { ...snapshot.config };
    match.moveHistory = snapshot.moveHistory.map((entry) => match.clone(entry));
    match.winner = snapshot.winner;
    match.status = snapshot.status;
    match.startedAt = snapshot.startedAt;
    match.endedAt = snapshot.endedAt;
    match.metadata = match.clone(snapshot.metadata);
    this.gameManager.games.set(match.id, match.game);
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
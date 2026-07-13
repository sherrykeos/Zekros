import Room from "../entities/Room.js";
import Player from "../entities/Player.js";
import matchManagerInstance from "./MatchManager.js";
import BotService from "../services/BotService.js";
import generateId from "../utils/id.js";
import generateRoomCode from "../utils/generateRoomCode.js";
import { success, failure } from "../utils/managerResponse.js";

const ROOM_MANAGER_ERRORS = Object.freeze({
  ROOM_NOT_FOUND: "ROOM_NOT_FOUND",
  ROOM_CLOSED: "ROOM_CLOSED",
  ROOM_FULL: "ROOM_FULL",
  PLAYER_ALREADY_JOINED: "PLAYER_ALREADY_JOINED",
  PLAYER_NOT_FOUND: "PLAYER_NOT_FOUND",
  SPECTATORS_DISABLED: "SPECTATORS_DISABLED",
  MATCH_ALREADY_RUNNING: "MATCH_ALREADY_RUNNING",
  MATCH_NOT_RUNNING: "MATCH_NOT_RUNNING",
  NOT_ENOUGH_PLAYERS: "NOT_ENOUGH_PLAYERS",
  INVALID_CONFIG: "ROOM_MATCH_INVALID_CONFIG",
});

class RoomManager {
  constructor({ matchManager = matchManagerInstance, botService = BotService } = {}) {
    this.matchManager = matchManager;
    this.botService = botService;
    this.rooms = new Map();
  }

  createRoom({ host = null, settings = {}, metadata = {}, codeLength } = {}) {
    const gameMode = this.botService.resolveMode({ config: settings, metadata });

    if (!gameMode) {
      return failure(ROOM_MANAGER_ERRORS.INVALID_CONFIG, "Unsupported game mode.");
    }

    let code = generateRoomCode(codeLength);

    while (this.rooms.has(code)) {
      code = generateRoomCode(codeLength);
    }

    const room = new Room({
      id: generateId("room"),
      code,
      host,
      settings: { ...settings, gameMode, maxPlayers: 2 },
      metadata: { ...metadata, gameMode },
    });

    if (this.botService.isBotMode(gameMode) && room.players.length > 0) {
      this.ensureBotPlayer(room, gameMode);
    }

    this.rooms.set(room.code, room);

    return success(room);
  }

  getRoom(roomCode) {
    const room = this.findRoom(roomCode);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found.");
    }

    return success(room);
  }

  hasRoom(roomCode) {
    return success(Boolean(this.findRoom(roomCode)));
  }

  deleteRoom(roomCode) {
    const code = this.normalizeRoomCode(roomCode);
    const room = this.findRoom(code);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found.");
    }

    this.deleteRoomMatches(room);
    this.rooms.delete(code);

    return success(true);
  }

  joinRoom(roomCode, player, { asSpectator = false } = {}) {
    const room = this.findRoom(roomCode);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found.");
    }

    if (room.status === Room.STATUS.CLOSED) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_CLOSED, "Room is closed.");
    }

    const participant = player instanceof Player ? player : new Player(player);

    if (room.hasPlayer(participant.id) || room.hasSpectator(participant.id)) {
      return failure(ROOM_MANAGER_ERRORS.PLAYER_ALREADY_JOINED, "Player is already in this room.");
    }

    if (asSpectator) {
      if (!room.settings.allowSpectators) {
        return failure(ROOM_MANAGER_ERRORS.SPECTATORS_DISABLED, "Spectators are disabled for this room.");
      }

      return success(room.addSpectator(participant));
    }

    if (this.botService.isBotMode(room.settings.gameMode)) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_FULL, "Bot rooms only allow one human player.");
    }

    if (room.isFull()) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_FULL, "Room is full.");
    }

    return success(room.addPlayer(participant));
  }

  leaveRoom(roomCode, participant) {
    const room = this.findRoom(roomCode);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found.");
    }

    const removedPlayer = room.removePlayer(participant);
    const removedParticipant = removedPlayer ?? room.removeSpectator(participant);

    if (!removedParticipant) {
      return failure(ROOM_MANAGER_ERRORS.PLAYER_NOT_FOUND, "Participant not found in room.");
    }

    if (room.players.length === 0 && room.spectators.length === 0) {
      room.close();
    }

    return success(removedParticipant);
  }

  closeRoom(roomCode) {
    const room = this.findRoom(roomCode);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found.");
    }

    if (room.currentMatch) {
      this.matchManager.deleteMatch(room.currentMatch.id);
    }

    room.close();

    return success(room);
  }

  assignHost(roomCode, player) {
    const room = this.findRoom(roomCode);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found.");
    }

    const nextHost = room.getPlayer(player);

    if (!nextHost) {
      return failure(ROOM_MANAGER_ERRORS.PLAYER_NOT_FOUND, "Player not found in room.");
    }

    room.host = nextHost;

    return success(nextHost);
  }

  async startMatch(roomCode, config, metadata = {}) {
    const room = this.findRoom(roomCode);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found.");
    }

    if (room.status === Room.STATUS.CLOSED) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_CLOSED, "Room is closed.");
    }

    if (room.currentMatch) {
      return failure(ROOM_MANAGER_ERRORS.MATCH_ALREADY_RUNNING, "Room already has an active match.");
    }

    if (!config) {
      return failure(ROOM_MANAGER_ERRORS.INVALID_CONFIG, "Game configuration is required to start a match.");
    }

    const gameMode = this.botService.resolveMode({ room, config, metadata });

    if (!gameMode) {
      return failure(ROOM_MANAGER_ERRORS.INVALID_CONFIG, "Unsupported game mode.");
    }

    const roomSnapshot = this.captureRoomSnapshot(room);

    room.settings.gameMode = gameMode;
    room.metadata.gameMode = gameMode;

    if (this.botService.isBotMode(gameMode)) {
      this.ensureBotPlayer(room, gameMode);
    }

    const playablePlayers = room.players.filter((player) => !this.botService.isBotPlayer(player));

    if (this.botService.isBotMode(gameMode)) {
      if (playablePlayers.length !== 1 || !this.botService.getBotParticipant(room.players)) {
        this.restoreRoomSnapshot(room, roomSnapshot);
        return failure(ROOM_MANAGER_ERRORS.NOT_ENOUGH_PLAYERS, "Bot matches require one human player and one bot.");
      }
    } else if (room.players.length < 2) {
      this.restoreRoomSnapshot(room, roomSnapshot);
      return failure(ROOM_MANAGER_ERRORS.NOT_ENOUGH_PLAYERS, "Human matches require two players.");
    }

    this.assignSymbolsForMatch(room, gameMode);

    const matchMetadata = {
      ...metadata,
      roomCode: room.code,
      gameMode,
      participants: room.players.map((player) => player.toJSON()),
    };

    let matchResponse;

    try {
      matchResponse = await this.matchManager.createMatch({
        config: { ...config, gameMode },
        metadata: matchMetadata,
      });
    } catch (error) {
      this.restoreRoomSnapshot(room, roomSnapshot);
      throw error;
    }

    if (!matchResponse.success) {
      this.restoreRoomSnapshot(room, roomSnapshot);
      return matchResponse;
    }

    const match = matchResponse.data;
    room.setCurrentMatch(match);

    for (const player of room.players) {
      player.setStatus(Player.STATUS.PLAYING);
    }

    return success(match);
  }

  async makeMove({ roomCode = null, matchId, playerId, move } = {}) {
    let room = roomCode ? this.findRoom(roomCode) : this.findRoomByMatchId(matchId);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found for this match.");
    }

    if (!room.currentMatch || room.currentMatch.id !== matchId) {
      const roomForMatch = this.findRoomByMatchId(matchId);

      if (roomForMatch?.currentMatch?.id === matchId) {
        room = roomForMatch;
      } else {
        return failure(
          ROOM_MANAGER_ERRORS.MATCH_NOT_RUNNING,
          `Room does not have this active match. Active match: ${room.currentMatch?.id ?? "none"}. Requested match: ${matchId}.`,
        );
      }
    }

    const player = room.getPlayer(playerId);

    if (!player || this.botService.isBotPlayer(player)) {
      return failure(ROOM_MANAGER_ERRORS.PLAYER_NOT_FOUND, "Human player not found in room.");
    }

    return this.matchManager.makeMove(matchId, {
      playerId,
      move,
      metadata: {
        roomCode: room.code,
        playerName: player.name,
      },
    });
  }

  async endMatch(roomCode, winner = null) {
    const room = this.findRoom(roomCode);

    if (!room) {
      return failure(ROOM_MANAGER_ERRORS.ROOM_NOT_FOUND, "Room not found.");
    }

    if (!room.currentMatch) {
      return failure(ROOM_MANAGER_ERRORS.MATCH_NOT_RUNNING, "Room does not have an active match.");
    }

    const matchResponse = await this.matchManager.finishMatch(room.currentMatch.id, winner);

    if (!matchResponse.success) {
      return matchResponse;
    }

    room.clearMatch();

    for (const player of room.players) {
      player.setStatus(Player.STATUS.ONLINE);
    }

    return success(matchResponse.data);
  }

  ensureBotPlayer(room, gameMode) {
    const existingBot = this.botService.getBotParticipant(room.players);

    if (existingBot) {
      existingBot.setSymbol("O");
      return existingBot;
    }

    if (room.players.length >= room.settings.maxPlayers) {
      return null;
    }

    return room.addPlayer(this.botService.createBotPlayer(gameMode));
  }

  assignSymbolsForMatch(room, gameMode) {
    if (this.botService.isBotMode(gameMode)) {
      const human = room.players.find((player) => !this.botService.isBotPlayer(player));
      const bot = this.botService.getBotParticipant(room.players);

      human?.setSymbol("X");
      bot?.setSymbol("O");
      return;
    }

    room.players.forEach((player, index) => {
      player.setSymbol(index === 0 ? "X" : "O");
    });
  }

  captureRoomSnapshot(room) {
    return {
      host: room.host,
      players: [...room.players],
      spectators: [...room.spectators],
      currentMatch: room.currentMatch,
      matches: [...room.matches],
      status: room.status,
      settings: room.clone(room.settings),
      metadata: room.clone(room.metadata),
      playerStates: new Map(
        room.players.map((player) => [
          player,
          {
            symbol: player.symbol,
            status: player.status,
          },
        ]),
      ),
    };
  }

  restoreRoomSnapshot(room, snapshot) {
    room.host = snapshot.host;
    room.players = [...snapshot.players];
    room.spectators = [...snapshot.spectators];
    room.currentMatch = snapshot.currentMatch;
    room.matches = [...snapshot.matches];
    room.status = snapshot.status;
    room.settings = room.clone(snapshot.settings);
    room.metadata = room.clone(snapshot.metadata);

    for (const [player, state] of snapshot.playerStates.entries()) {
      player.setSymbol(state.symbol);
      player.setStatus(state.status);
    }
  }
  deleteRoomMatches(room) {
    const matchIds = new Set(room.matches.map((match) => match.id).filter(Boolean));

    if (room.currentMatch?.id) {
      matchIds.add(room.currentMatch.id);
    }

    for (const matchId of matchIds) {
      this.matchManager.deleteMatch(matchId);
    }
  }

  findRoom(roomCode) {
    return this.rooms.get(this.normalizeRoomCode(roomCode)) ?? null;
  }

  findRoomByMatchId(matchId) {
    for (const room of this.rooms.values()) {
      if (room.currentMatch?.id === matchId || room.matches.some((match) => match.id === matchId)) {
        return room;
      }
    }

    return null;
  }

  normalizeRoomCode(roomCode) {
    return typeof roomCode === "string" ? roomCode.toUpperCase() : roomCode;
  }
}

RoomManager.ERRORS = ROOM_MANAGER_ERRORS;

const roomManagerInstance = new RoomManager();
export default roomManagerInstance;



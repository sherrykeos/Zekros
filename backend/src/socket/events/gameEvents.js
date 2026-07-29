import MatchManager from "../../managers/MatchManager.js";
import RoomManager from "../../managers/RoomManager.js";
import {
  acknowledge,
  createMatchResponse,
  createRoomResponse,
  emitError,
  getRoomCode,
  handleAsync,
  success,
} from "../../utils/socket.utils.js";

const MATCH_UPDATE_EVENT = "match:update";
const MATCH_STARTED_EVENT = "match:started";
const MATCH_FINISHED_EVENT = "match:finished";
const MATCH_REMATCHED_EVENT = "match:rematched";
const MATCH_ERROR_EVENT = "match:error";
const ROOM_UPDATE_EVENT = "room:update";
const LEGACY_ROOM_UPDATE_EVENT = "room-updated";

const LEGACY_GAME_STATE_EVENT = "game-state";
const LEGACY_GAME_ERROR_EVENT = "game-error";
const LEGACY_GAME_OVER_EVENT = "game-over";

function emitMatchError(socket, eventName, response, acknowledgeCallback) {
  emitError(socket, eventName, response, acknowledgeCallback, MATCH_ERROR_EVENT);
  socket.emit(LEGACY_GAME_ERROR_EVENT, { event: eventName, ...response });
}
function findRoomByMatchId(matchId) {
  return typeof RoomManager.findRoomByMatchId === "function" ? RoomManager.findRoomByMatchId(matchId) : null;
}

function getRoom(roomCode) {
  const result = RoomManager.getRoom(roomCode);
  return result.success ? result.data : null;
}

function resolveRoomCode(payload = {}, match = null) {
  return getRoomCode(payload) ?? match?.metadata?.roomCode ?? findRoomByMatchId(payload.matchId ?? match?.id)?.code;
}

function emitRoomUpdate(io, roomCode) {
  const room = getRoom(roomCode);

  if (room) {
    const response = createRoomResponse(success(room));
    io.to(room.code).emit(ROOM_UPDATE_EVENT, response);
    io.to(room.code).emit(LEGACY_ROOM_UPDATE_EVENT, response);
  }
}

function emitMatchUpdate(io, roomCode, response) {
  io.to(roomCode).emit(MATCH_UPDATE_EVENT, response);
  io.to(roomCode).emit(LEGACY_GAME_STATE_EVENT, response);

  if (response.data?.gameOver) {
    io.to(roomCode).emit(MATCH_FINISHED_EVENT, response);
    io.to(roomCode).emit(LEGACY_GAME_OVER_EVENT, response);
  }
}

function acknowledgeAndBroadcastMatch(io, roomCode, response, acknowledgeCallback, eventName = null) {
  acknowledge(acknowledgeCallback, response);
  emitMatchUpdate(io, roomCode, response);

  if (eventName) {
    io.to(roomCode).emit(eventName, response);
  }
}

function isHostPlayer(room, player) {
  if (!room?.host || !player) return false;
  const hostId = room.host.id ?? room.host;
  const hostUserId = room.host.userId ?? room.host.id;
  const playerId = player.id;
  const playerUserId = player.userId;

  return Boolean(
    (hostId && playerId === hostId) ||
      (hostUserId && playerId === hostUserId) ||
      (hostId && playerUserId && playerUserId === hostId) ||
      (hostUserId && playerUserId && playerUserId === hostUserId),
  );
}

async function handleStartMatch(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  
  const roomResult = RoomManager.getRoom(roomCode);
  if (roomResult.success) {
    const room = roomResult.data;
    const allGuestsReady = room.players.every((player) => 
      isHostPlayer(room, player) || player.type === "BOT" || player.status === "READY"
    );
    if (!allGuestsReady) {
      emitMatchError(socket, "match:start", failure("GUESTS_NOT_READY", "All players must be ready to start."), acknowledgeCallback);
      return;
    }
  }

  const result = await RoomManager.startMatch(roomCode, payload.config, payload.metadata);

  if (!result.success) {
    emitMatchError(socket, "match:start", result, acknowledgeCallback);
    return;
  }

  const matchRoomCode = result.data.metadata?.roomCode ?? roomCode;
  socket.join(matchRoomCode);

  const response = createMatchResponse({ match: result.data, roomCode: matchRoomCode });
  acknowledgeAndBroadcastMatch(io, matchRoomCode, response, acknowledgeCallback, MATCH_STARTED_EVENT);
  emitRoomUpdate(io, matchRoomCode);
}

async function handleMakeMove(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  const result = await RoomManager.makeMove({
    roomCode,
    matchId: payload.matchId,
    playerId: payload.playerId ?? socket.data?.playerId,
    move: payload.move,
  });

  if (!result.success) {
    emitMatchError(socket, "match:move", result, acknowledgeCallback);
    return;
  }

  const matchRoomCode = result.data.match?.metadata?.roomCode ?? roomCode;
  const response = createMatchResponse({ moveData: result.data, roomCode: matchRoomCode });
  acknowledgeAndBroadcastMatch(io, matchRoomCode, response, acknowledgeCallback);

  // Trigger bot turn after 300ms so human sees the human move land and bot's expiring piece blink
  const roomResult = RoomManager.getRoom(matchRoomCode);
  if (roomResult.success) {
    const room = roomResult.data;
    const currentMatch = room.currentMatch;
    if (currentMatch && !currentMatch.game.isGameOver()) {
      const nextTurnSymbol = currentMatch.game.currentTurn;
      const nextPlayer = room.players.find((p) => p.symbol === nextTurnSymbol);
      if (nextPlayer && nextPlayer.type === "BOT") {
        setTimeout(async () => {
          const botResult = await RoomManager.executeBotTurn(matchRoomCode, currentMatch.id);
          if (botResult.success) {
            const botResponse = createMatchResponse({ moveData: botResult.data, roomCode: matchRoomCode });
            emitMatchUpdate(io, matchRoomCode, botResponse);
            emitRoomUpdate(io, matchRoomCode);
          }
        }, 300);
      }
    }
  }
}

async function handleFinishMatch(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  let result;
  if (roomCode) {
    result = await RoomManager.endMatch(roomCode, payload.winner ?? null);
  } else if (payload.matchId) {
    result = await MatchManager.finishMatch(payload.matchId, payload.winner ?? null);
  } else {
    result = failure("INVALID_PAYLOAD", "Missing roomCode or matchId");
  }

  if (!result.success) {
    emitMatchError(socket, "match:finish", result, acknowledgeCallback);
    return;
  }

  const matchRoomCode = result.data.metadata?.roomCode ?? roomCode ?? payload.matchId;
  const response = createMatchResponse({ match: result.data, roomCode: matchRoomCode });
  acknowledgeAndBroadcastMatch(io, matchRoomCode, response, acknowledgeCallback);
  if (matchRoomCode) {
    emitRoomUpdate(io, matchRoomCode);
  }
}

async function handleRematch(io, socket, payload = {}, acknowledgeCallback) {
  const roomCodeFromPayload = getRoomCode(payload) ?? socket.data?.roomCode;
  const result = roomCodeFromPayload
    ? await RoomManager.createRematchForRoom(roomCodeFromPayload)
    : await RoomManager.createRematch(payload.matchId);

  if (!result.success) {
    emitMatchError(socket, "match:rematch", result, acknowledgeCallback);
    return;
  }

  const roomCode = result.data.metadata?.roomCode ?? roomCodeFromPayload ?? findRoomByMatchId(result.data.id)?.code;
  socket.join(roomCode);

  const response = createMatchResponse({ match: result.data, roomCode });
  acknowledgeAndBroadcastMatch(io, roomCode, response, acknowledgeCallback, MATCH_REMATCHED_EVENT);
  emitRoomUpdate(io, roomCode);
}

function handleRematchRequest(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  const senderId = payload.senderId ?? socket.data?.playerId ?? socket.data?.userId;
  const senderName = payload.senderName ?? "Opponent";

  if (!roomCode) {
    emitMatchError(socket, "match:rematch-request", failure("ROOM_NOT_FOUND", "Room not found."), acknowledgeCallback);
    return;
  }

  const response = success({ roomCode, matchId: payload.matchId, senderId, senderName });
  acknowledge(acknowledgeCallback, response);
  socket.to(roomCode).emit("match:rematch-offered", response);
}

async function handleRematchAccept(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  if (!roomCode) {
    emitMatchError(socket, "match:rematch-accept", failure("ROOM_NOT_FOUND", "Room not found."), acknowledgeCallback);
    return;
  }

  const result = await RoomManager.createRematchForRoom(roomCode);

  if (!result.success) {
    emitMatchError(socket, "match:rematch-accept", result, acknowledgeCallback);
    return;
  }

  const matchRoomCode = result.data.metadata?.roomCode ?? roomCode;
  socket.join(matchRoomCode);

  const response = createMatchResponse({ match: result.data, roomCode: matchRoomCode });
  acknowledgeAndBroadcastMatch(io, matchRoomCode, response, acknowledgeCallback, MATCH_REMATCHED_EVENT);
  io.to(matchRoomCode).emit(MATCH_STARTED_EVENT, response);
  emitRoomUpdate(io, matchRoomCode);
}

function handleRematchDecline(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  const response = success({
    roomCode,
    declinedBy: socket.data?.playerId ?? payload.senderId,
  });

  if (roomCode) {
    io.to(roomCode).emit("match:rematch-declined", response);
  }
  acknowledge(acknowledgeCallback, response);
}

function handleGetMatchState(io, socket, payload = {}, acknowledgeCallback) {
  const result = MatchManager.getMatch(payload.matchId);

  if (!result.success) {
    emitMatchError(socket, "match:get", result, acknowledgeCallback);
    return;
  }

  const roomCode = resolveRoomCode(payload, result.data);
  const response = createMatchResponse({ match: result.data, roomCode });

  if (roomCode) {
    socket.join(roomCode);
  }

  acknowledge(acknowledgeCallback, response);
  socket.emit(MATCH_UPDATE_EVENT, response);
  socket.emit(LEGACY_GAME_STATE_EVENT, response);
}

function handleGameOverState(socket, payload = {}, acknowledgeCallback) {
  const result = MatchManager.getMatch(payload.matchId);

  if (!result.success) {
    emitMatchError(socket, LEGACY_GAME_OVER_EVENT, result, acknowledgeCallback);
    return;
  }

  const response = createMatchResponse({ match: result.data, roomCode: resolveRoomCode(payload, result.data) });
  acknowledge(acknowledgeCallback, response);
  socket.emit(MATCH_FINISHED_EVENT, response);
  socket.emit(LEGACY_GAME_OVER_EVENT, response);
}

function on(socket, eventName, handler) {
  socket.on(eventName, (payload, acknowledgeCallback) => {
    handleAsync(socket, eventName, acknowledgeCallback, () => handler(payload, acknowledgeCallback), MATCH_ERROR_EVENT);
  });
}

function registerGameEvents(io, socket) {
  on(socket, "match:start", (payload, acknowledgeCallback) => handleStartMatch(io, socket, payload, acknowledgeCallback));
  on(socket, "match:move", (payload, acknowledgeCallback) => handleMakeMove(io, socket, payload, acknowledgeCallback));
  on(socket, "match:finish", (payload, acknowledgeCallback) => handleFinishMatch(io, socket, payload, acknowledgeCallback));
  on(socket, "match:rematch", (payload, acknowledgeCallback) => handleRematch(io, socket, payload, acknowledgeCallback));
  on(socket, "match:rematch-request", (payload, acknowledgeCallback) => handleRematchRequest(io, socket, payload, acknowledgeCallback));
  on(socket, "match:rematch-accept", (payload, acknowledgeCallback) => handleRematchAccept(io, socket, payload, acknowledgeCallback));
  on(socket, "match:rematch-decline", (payload, acknowledgeCallback) => handleRematchDecline(io, socket, payload, acknowledgeCallback));
  on(socket, "match:get", (payload, acknowledgeCallback) => handleGetMatchState(io, socket, payload, acknowledgeCallback));

  on(socket, "start-match", (payload, acknowledgeCallback) => handleStartMatch(io, socket, payload, acknowledgeCallback));
  on(socket, "make-move", (payload, acknowledgeCallback) => handleMakeMove(io, socket, payload, acknowledgeCallback));
  on(socket, "finish-match", (payload, acknowledgeCallback) => handleFinishMatch(io, socket, payload, acknowledgeCallback));
  on(socket, "rematch", (payload, acknowledgeCallback) => handleRematch(io, socket, payload, acknowledgeCallback));
  on(socket, LEGACY_GAME_STATE_EVENT, (payload, acknowledgeCallback) => handleGetMatchState(io, socket, payload, acknowledgeCallback));
  on(socket, LEGACY_GAME_OVER_EVENT, (payload, acknowledgeCallback) => handleGameOverState(socket, payload, acknowledgeCallback));
}

export default registerGameEvents;
import MatchManager from "../../managers/MatchManager.js";
import RoomManager from "../../managers/RoomManager.js";
import connectionEvents from "./connectionEvents.js";
import {
  acknowledge,
  createMatchResponse,
  createRoomResponse,
  emitError,
  failure,
  getRoomCode,
  handleAsync,
  success,
} from "../../utils/socket.utils.js";

const ROOM_UPDATE_EVENT = "room:update";
const ROOM_CLOSED_EVENT = "room:closed";
const ROOM_ERROR_EVENT = "room:error";
const PLAYER_CONNECTED_EVENT = "player:connected";
const LEGACY_ROOM_UPDATE_EVENT = "room-updated";
const LEGACY_ROOM_ERROR_EVENT = "room-error";

function getRoom(roomCode) {
  const result = RoomManager.getRoom(roomCode);
  return result.success ? result.data : null;
}

function emitRoomUpdate(io, roomCode, response) {
  io.to(roomCode).emit(ROOM_UPDATE_EVENT, response);
  io.to(roomCode).emit(LEGACY_ROOM_UPDATE_EVENT, response);
}

function emitRoomError(socket, eventName, response, acknowledgeCallback) {
  emitError(socket, eventName, response, acknowledgeCallback, ROOM_ERROR_EVENT);
  socket.emit(LEGACY_ROOM_ERROR_EVENT, { event: eventName, ...response });
}

function emitPlayerConnected(io, roomCode, bindingResult) {
  if (bindingResult?.success) {
    io.to(roomCode).emit(PLAYER_CONNECTED_EVENT, success(bindingResult.data));
  }
}

function getRoomStateResponse(roomCode) {
  return createRoomResponse(RoomManager.getRoom(roomCode));
}

function withAuthenticatedUser(socket, player = null) {
  if (!player || typeof player !== "object") {
    return player;
  }

  return {
    ...player,
    userId: player.userId ?? socket.data?.userId ?? null,
  };
}

function getCreateRoomOptions(socket, payload = {}) {
  const roomOptions = payload.roomOptions ?? payload;
  const host = payload.host ?? payload.playerInfo ?? payload.player ?? roomOptions.host ?? null;

  return {
    ...roomOptions,
    host: withAuthenticatedUser(socket, host),
  };
}

function bindSocketToPlayer(socket, roomCode, playerId) {
  if (!roomCode || !playerId) {
    return failure("SOCKET_BINDING_INVALID", "roomCode and playerId are required to bind a socket.");
  }

  return connectionEvents.bindPlayer(socket, { roomCode, playerId });
}

function clearSocketBinding(socket, roomCode) {
  socket.leave(roomCode);
  socket.data.roomCode = null;
  socket.data.playerId = null;

  const connection = connectionEvents.getConnection(socket.id);

  if (connection) {
    connection.roomCode = null;
    connection.playerId = null;
  }
}

function handleCreateRoom(io, socket, payload = {}, acknowledgeCallback) {
  const result = RoomManager.createRoom(getCreateRoomOptions(socket, payload));
  const response = createRoomResponse(result);

  if (!response.success) {
    emitRoomError(socket, "room:create", response, acknowledgeCallback);
    return;
  }

  const hostId = response.data.host?.id ?? null;
  let bindingResult = null;

  if (hostId) {
    bindingResult = bindSocketToPlayer(socket, response.data.code, hostId);
  } else {
    socket.join(response.data.code);
  }

  if (bindingResult && !bindingResult.success) {
    RoomManager.deleteRoom(response.data.code);
    emitRoomError(socket, "room:create", bindingResult, acknowledgeCallback);
    return;
  }

  const roomResponse = getRoomStateResponse(response.data.code);
  acknowledge(acknowledgeCallback, roomResponse);
  emitPlayerConnected(io, response.data.code, bindingResult);
  emitRoomUpdate(io, response.data.code, roomResponse);
}

function handleJoinRoom(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload);
  const player = withAuthenticatedUser(socket, payload.playerInfo ?? payload.player);
  const options = payload.options ?? { asSpectator: Boolean(payload.asSpectator) };
  const reconnectPlayerId = payload.reconnectPlayerId ?? payload.playerId;
  const result = RoomManager.joinRoom(roomCode, player, options);

  if (!result.success) {
    const pid = reconnectPlayerId ?? player?.id ?? player?.userId;
    if (pid && roomCode) {
      handleReconnectRoom(io, socket, { roomCode, playerId: pid }, acknowledgeCallback);
      return;
    }

    emitRoomError(socket, "room:join", result, acknowledgeCallback);
    return;
  }

  const joinedPlayer = result.data;
  const bindingResult = bindSocketToPlayer(socket, roomCode, joinedPlayer.id);

  if (!bindingResult.success) {
    RoomManager.leaveRoom(roomCode, joinedPlayer.id);
    emitRoomError(socket, "room:join", bindingResult, acknowledgeCallback);
    return;
  }

  const response = getRoomStateResponse(roomCode);

  if (!response.success) {
    emitRoomError(socket, "room:join", response, acknowledgeCallback);
    return;
  }

  acknowledge(acknowledgeCallback, response);
  emitPlayerConnected(io, response.data.code, bindingResult);
  emitRoomUpdate(io, response.data.code, response);
}













function handleReconnectRoom(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload);
  const playerId = payload.playerId ?? payload.participantId;
  const bindingResult = bindSocketToPlayer(socket, roomCode, playerId);

  if (!bindingResult.success) {
    emitRoomError(socket, "room:reconnect", bindingResult, acknowledgeCallback);
    return;
  }

  const room = getRoom(bindingResult.data.roomCode);
  const response = success(connectionEvents.createSyncState(room));

  acknowledge(acknowledgeCallback, response);
  connectionEvents.emitCurrentMatchState(socket, room);
  emitPlayerConnected(io, room.code, bindingResult);
  emitRoomUpdate(io, room.code, getRoomStateResponse(room.code));
}

async function handleLeaveRoom(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  const participant = payload.playerId ?? payload.participantId ?? payload.player ?? socket.data?.playerId;

  const room = getRoom(roomCode);
  const activeMatchId = room?.currentMatch?.id;

  const result = await RoomManager.leaveRoom(roomCode, participant);

  if (!result.success) {
    emitRoomError(socket, "room:leave", result, acknowledgeCallback);
    return;
  }

  const roomResponse = getRoomStateResponse(roomCode);
  acknowledge(acknowledgeCallback, success(result.data));
  clearSocketBinding(socket, roomCode);

  if (roomResponse.success) {
    emitRoomUpdate(io, roomResponse.data.code, roomResponse);

    if (activeMatchId) {
      const matchResult = MatchManager.getMatch(activeMatchId);
      if (matchResult.success) {
        const response = createMatchResponse({ match: matchResult.data, roomCode: roomCode });
        io.to(roomCode).emit("match:update", response);
        io.to(roomCode).emit("game-state", response);
        if (response.data?.gameOver) {
          io.to(roomCode).emit("match:finished", response);
          io.to(roomCode).emit("game-over", response);
        }
      }
    }

    if (roomResponse.data.status === "CLOSED") {
      RoomManager.deleteRoom(roomResponse.data.code);
      io.to(roomResponse.data.code).emit(ROOM_CLOSED_EVENT, success({ roomCode: roomResponse.data.code }));

      if (typeof io.in(roomResponse.data.code).socketsLeave === "function") {
        io.in(roomResponse.data.code).socketsLeave(roomResponse.data.code);
      }
    }
  }
}

function handleAssignHost(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  const player = payload.playerId ?? payload.player ?? socket.data?.playerId;
  const result = RoomManager.assignHost(roomCode, player);

  if (!result.success) {
    emitRoomError(socket, "room:host", result, acknowledgeCallback);
    return;
  }

  const response = getRoomStateResponse(roomCode);
  acknowledge(acknowledgeCallback, response);
  emitRoomUpdate(io, response.data.code, response);
}

function handleToggleReady(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  const playerId = payload.playerId ?? socket.data?.playerId ?? socket.data?.userId;
  const isReady = Boolean(payload.ready);

  const roomResult = RoomManager.getRoom(roomCode);
  if (!roomResult.success) {
    emitRoomError(socket, "room:ready-toggle", roomResult, acknowledgeCallback);
    return;
  }

  const room = roomResult.data;
  const player =
    room.getPlayer(playerId) ??
    room.players.find(
      (p) =>
        p.id === playerId ||
        p.userId === playerId ||
        p.id === socket.data?.playerId ||
        p.userId === socket.data?.userId,
    );

  if (!player) {
    emitRoomError(socket, "room:ready-toggle", failure("PLAYER_NOT_FOUND", "Player not found in room."), acknowledgeCallback);
    return;
  }

  player.setStatus(isReady ? "READY" : "ONLINE");

  const response = getRoomStateResponse(roomCode);
  acknowledge(acknowledgeCallback, response);
  emitRoomUpdate(io, roomCode, response);
}

function handleGetRoom(socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  const response = getRoomStateResponse(roomCode);

  if (!response.success) {
    emitRoomError(socket, "room:get", response, acknowledgeCallback);
    return;
  }

  socket.join(response.data.code);
  acknowledge(acknowledgeCallback, response);
}

function handleCloseRoom(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload) ?? socket.data?.roomCode;
  const result = RoomManager.closeRoom(roomCode);
  const response = createRoomResponse(result);

  if (!response.success) {
    emitRoomError(socket, "room:close", response, acknowledgeCallback);
    return;
  }

  acknowledge(acknowledgeCallback, response);
  emitRoomUpdate(io, response.data.code, response);
  io.to(response.data.code).emit(ROOM_CLOSED_EVENT, success({ roomCode: response.data.code }));
  RoomManager.deleteRoom(response.data.code);

  if (typeof io.in(response.data.code).socketsLeave === "function") {
    io.in(response.data.code).socketsLeave(response.data.code);
  }
}

function on(socket, eventName, handler) {
  socket.on(eventName, (payload, acknowledgeCallback) => {
    handleAsync(socket, eventName, acknowledgeCallback, () => handler(payload, acknowledgeCallback), ROOM_ERROR_EVENT);
  });
}

function registerRoomEvents(io, socket) {
  on(socket, "room:create", (payload, acknowledgeCallback) => handleCreateRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "room:join", (payload, acknowledgeCallback) => handleJoinRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "room:reconnect", (payload, acknowledgeCallback) => handleReconnectRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "room:subscribe", (payload, acknowledgeCallback) => handleReconnectRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "room:leave", (payload, acknowledgeCallback) => handleLeaveRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "room:host", (payload, acknowledgeCallback) => handleAssignHost(io, socket, payload, acknowledgeCallback));
  on(socket, "room:get", (payload, acknowledgeCallback) => handleGetRoom(socket, payload, acknowledgeCallback));
  on(socket, "room:close", (payload, acknowledgeCallback) => handleCloseRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "room:ready-toggle", (payload, acknowledgeCallback) => handleToggleReady(io, socket, payload, acknowledgeCallback));

  on(socket, "create-room", (payload, acknowledgeCallback) => handleCreateRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "join-room", (payload, acknowledgeCallback) => handleJoinRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "leave-room", (payload, acknowledgeCallback) => handleLeaveRoom(io, socket, payload, acknowledgeCallback));
  on(socket, "close-room", (payload, acknowledgeCallback) => handleCloseRoom(io, socket, payload, acknowledgeCallback));
}

export default registerRoomEvents;
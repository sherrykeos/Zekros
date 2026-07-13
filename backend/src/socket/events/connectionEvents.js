import RoomManager from "../../managers/RoomManager.js";
import Player from "../../entities/Player.js";
import {
  acknowledge,
  createMatchResponse,
  createRoomResponse,
  emitError,
  failure,
  getRoomCode,
  handleAsync,
  serializeRoom,
  success,
} from "../../utils/socket.utils.js";

const DEFAULT_CLEANUP_GRACE_MS = 30000;
const PLAYER_CONNECTED_EVENT = "player:connected";
const PLAYER_DISCONNECTED_EVENT = "player:disconnected";
const ROOM_UPDATE_EVENT = "room:update";
const MATCH_UPDATE_EVENT = "match:update";
const CONNECTION_ERROR_EVENT = "connection:error";
const LEGACY_ROOM_UPDATE_EVENT = "room-updated";
const LEGACY_GAME_STATE_EVENT = "game-state";

const cleanupGraceMs = Number(process.env.SOCKET_CLEANUP_GRACE_MS ?? DEFAULT_CLEANUP_GRACE_MS);
const connections = new Map();
const playerSessions = new Map();
const cleanupTimers = new Map();

function getSessionKey(roomCode, playerId) {
  return `${String(roomCode).toUpperCase()}:${playerId}`;
}

function getRoom(roomCode) {
  const result = RoomManager.getRoom(roomCode);
  return result.success ? result.data : null;
}

function getParticipant(room, playerId) {
  return room?.getPlayer?.(playerId) ?? room?.spectators?.find((entry) => entry.id === playerId) ?? null;
}

function isClientParticipant(participant) {
  return participant?.type !== Player.TYPE.BOT;
}

function hasConnectedClientParticipant(room) {
  const participants = [...(room?.players ?? []), ...(room?.spectators ?? [])];

  return participants.some((participant) => {
    if (!isClientParticipant(participant) || !participant.socketId) {
      return false;
    }

    return connections.has(participant.socketId);
  });
}

function isSocketConnected(socketId) {
  return Boolean(socketId) && connections.has(socketId);
}

function clearRoomSessions(roomCode) {
  const normalizedRoomCode = String(roomCode).toUpperCase();

  for (const [sessionKey, session] of playerSessions.entries()) {
    if (session?.roomCode === normalizedRoomCode) {
      playerSessions.delete(sessionKey);
    }
  }
}

function cancelRoomCleanup(roomCode) {
  const normalizedRoomCode = String(roomCode).toUpperCase();
  const timer = cleanupTimers.get(normalizedRoomCode);

  if (timer) {
    clearTimeout(timer);
    cleanupTimers.delete(normalizedRoomCode);
  }
}

function cleanupRoomIfEmpty(roomCode) {
  const room = getRoom(roomCode);

  if (!room) {
    cleanupTimers.delete(String(roomCode).toUpperCase());
    return;
  }

  if (!hasConnectedClientParticipant(room)) {
    RoomManager.deleteRoom(room.code);
    clearRoomSessions(room.code);
    console.log(`Socket room cleaned up: ${room.code}`);
  }

  cleanupTimers.delete(room.code);
}

function scheduleRoomCleanup(roomCode) {
  if (!roomCode) {
    return;
  }

  const normalizedRoomCode = String(roomCode).toUpperCase();
  cancelRoomCleanup(normalizedRoomCode);

  const timer = setTimeout(() => {
    cleanupRoomIfEmpty(normalizedRoomCode);
  }, cleanupGraceMs);

  if (typeof timer.unref === "function") {
    timer.unref();
  }

  cleanupTimers.set(normalizedRoomCode, timer);
}

function addConnection(socket) {
  const connection = {
    socketId: socket.id,
    connectedAt: new Date().toISOString(),
    roomCode: null,
    playerId: null,
    userId: socket.data?.userId ?? null,
  };

  connections.set(socket.id, connection);
  return connection;
}

function removeConnection(socketId) {
  const connection = connections.get(socketId) ?? null;
  connections.delete(socketId);
  return connection;
}

function createSyncState(room) {
  return {
    room: serializeRoom(room),
    match: room?.currentMatch?.getState?.() ?? null,
  };
}

function bindPlayer(socket, { roomCode, playerId } = {}) {
  if (!roomCode || !playerId) {
    return failure("SOCKET_BINDING_INVALID", "roomCode and playerId are required to bind a socket.");
  }

  const room = getRoom(roomCode);

  if (!room) {
    return failure("ROOM_NOT_FOUND", "Room not found.");
  }

  const participant = getParticipant(room, playerId);

  if (!participant || !isClientParticipant(participant)) {
    return failure("PLAYER_NOT_FOUND", "Player not found in room.");
  }

  const normalizedRoomCode = room.code;
  const connection = connections.get(socket.id) ?? addConnection(socket);
  const sessionKey = getSessionKey(normalizedRoomCode, playerId);
  const previousSession = playerSessions.get(sessionKey);

  if (previousSession?.socketId && previousSession.socketId !== socket.id) {
    const previousConnection = connections.get(previousSession.socketId);

    if (previousConnection) {
      previousConnection.replacedAt = new Date().toISOString();
    }
  }

  connection.roomCode = normalizedRoomCode;
  connection.playerId = playerId;
  connection.userId = socket.data?.userId ?? participant.userId ?? null;
  connection.boundAt = new Date().toISOString();

  socket.data = {
    ...(socket.data ?? {}),
    roomCode: normalizedRoomCode,
    playerId,
  };
  socket.join(normalizedRoomCode);

  participant.setSocketId(socket.id);
  participant.setStatus(room.currentMatch ? Player.STATUS.PLAYING : Player.STATUS.ONLINE);

  playerSessions.set(sessionKey, {
    roomCode: normalizedRoomCode,
    playerId,
    socketId: socket.id,
    userId: connection.userId,
    connected: true,
    connectedAt: connection.connectedAt,
    lastSeenAt: new Date().toISOString(),
  });
  cancelRoomCleanup(normalizedRoomCode);

  return success({
    roomCode: normalizedRoomCode,
    playerId,
    socketId: socket.id,
  });
}

function markPlayerDisconnected(connection) {
  if (!connection?.roomCode || !connection?.playerId) {
    return null;
  }

  const room = getRoom(connection.roomCode);
  const participant = getParticipant(room, connection.playerId);
  const sessionKey = getSessionKey(connection.roomCode, connection.playerId);
  const session = playerSessions.get(sessionKey);

  if (participant?.socketId === connection.socketId) {
    participant.markDisconnected();
  }

  if (session?.socketId === connection.socketId) {
    playerSessions.set(sessionKey, {
      ...session,
      connected: false,
      disconnectedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    });
  }

  scheduleRoomCleanup(connection.roomCode);

  return {
    room,
    participant,
    roomCode: connection.roomCode,
    playerId: connection.playerId,
  };
}

function getConnection(socketId) {
  return connections.get(socketId) ?? null;
}

function getConnections() {
  return Array.from(connections.values());
}

function getPlayerSession(roomCode, playerId) {
  if (!roomCode || !playerId) {
    return null;
  }

  return playerSessions.get(getSessionKey(roomCode, playerId)) ?? null;
}

function emitCurrentState(socket, room) {
  const roomResponse = createRoomResponse(success(room));
  socket.emit(ROOM_UPDATE_EVENT, roomResponse);
  socket.emit(LEGACY_ROOM_UPDATE_EVENT, roomResponse);
  emitCurrentMatchState(socket, room);
}

function emitCurrentMatchState(socket, room) {
  if (!room?.currentMatch) {
    return;
  }

  const response = createMatchResponse({ match: room.currentMatch, roomCode: room.code });
  socket.emit(MATCH_UPDATE_EVENT, response);
  socket.emit(LEGACY_GAME_STATE_EVENT, response);
}

function handleReconnect(io, socket, payload = {}, acknowledgeCallback) {
  const roomCode = getRoomCode(payload);
  const playerId = payload.playerId ?? payload.participantId;
  const bindingResult = bindPlayer(socket, { roomCode, playerId });

  if (!bindingResult.success) {
    emitError(socket, "player:reconnect", bindingResult, acknowledgeCallback, CONNECTION_ERROR_EVENT);
    return;
  }

  const room = getRoom(bindingResult.data.roomCode);
  const response = success(createSyncState(room));

  acknowledge(acknowledgeCallback, response);
  emitCurrentMatchState(socket, room);
  io.to(room.code).emit(PLAYER_CONNECTED_EVENT, success(bindingResult.data));

  const roomResponse = createRoomResponse(success(room));
  io.to(room.code).emit(ROOM_UPDATE_EVENT, roomResponse);
  io.to(room.code).emit(LEGACY_ROOM_UPDATE_EVENT, roomResponse);
}

function registerConnectionEvents(io, socket) {
  const connection = addConnection(socket);

  socket.emit(
    PLAYER_CONNECTED_EVENT,
    success({
      socketId: socket.id,
      authenticated: Boolean(socket.data?.isAuthenticated),
      userId: socket.data?.userId ?? null,
    }),
  );

  console.log(`Socket connected: ${connection.socketId}`);

  socket.on("player:reconnect", (payload, acknowledgeCallback) => {
    handleReconnect(io, socket, payload, acknowledgeCallback);
  });

  socket.on("room:reconnect", (payload, acknowledgeCallback) => {
    handleReconnect(io, socket, payload, acknowledgeCallback);
  });

  socket.on("reconnect-player", (payload, acknowledgeCallback) => {
    handleReconnect(io, socket, payload, acknowledgeCallback);
  });

  socket.on("disconnect", (reason) => {
    const removedConnection = removeConnection(socket.id);
    const disconnectState = markPlayerDisconnected(removedConnection);

    if (disconnectState?.room) {
      const payload = success({
        roomCode: disconnectState.roomCode,
        playerId: disconnectState.playerId,
        socketId: socket.id,
        reason,
      });

      io.to(disconnectState.roomCode).emit(PLAYER_DISCONNECTED_EVENT, payload);

      const roomResponse = createRoomResponse(success(disconnectState.room));
      io.to(disconnectState.roomCode).emit(ROOM_UPDATE_EVENT, roomResponse);
      io.to(disconnectState.roomCode).emit(LEGACY_ROOM_UPDATE_EVENT, roomResponse);
    }

    console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
  });
}

registerConnectionEvents.bindPlayer = bindPlayer;
registerConnectionEvents.getConnection = getConnection;
registerConnectionEvents.getConnections = getConnections;
registerConnectionEvents.getPlayerSession = getPlayerSession;
registerConnectionEvents.scheduleRoomCleanup = scheduleRoomCleanup;
registerConnectionEvents.cleanupRoomIfEmpty = cleanupRoomIfEmpty;
registerConnectionEvents.isSocketConnected = isSocketConnected;
registerConnectionEvents.createSyncState = createSyncState;
registerConnectionEvents.emitCurrentState = emitCurrentState;
registerConnectionEvents.emitCurrentMatchState = emitCurrentMatchState;

export default registerConnectionEvents;
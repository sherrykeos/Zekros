const RoomManager = require("../../managers/RoomManager");
const Player = require("../../entities/Player");

const DEFAULT_CLEANUP_GRACE_MS = 30000;
const cleanupGraceMs = Number(process.env.SOCKET_CLEANUP_GRACE_MS ?? DEFAULT_CLEANUP_GRACE_MS);
const connections = new Map();
const playerSessions = new Map();
const cleanupTimers = new Map();

/**
 * Builds a stable key for room-scoped player sessions.
 *
 * @param {string} roomCode Room code.
 * @param {string} playerId Player id.
 * @returns {string} Session key.
 */
function getSessionKey(roomCode, playerId) {
  return `${String(roomCode).toUpperCase()}:${playerId}`;
}

/**
 * Returns the room entity for a room code.
 *
 * @param {string} roomCode Room code.
 * @returns {object|null} Room entity or null.
 */
function getRoom(roomCode) {
  const result = RoomManager.getRoom(roomCode);
  return result.success ? result.data : null;
}

/**
 * Finds a room participant by id.
 *
 * @param {object} room Room entity.
 * @param {string} playerId Player id.
 * @returns {object|null} Player or spectator entity.
 */
function getParticipant(room, playerId) {
  return room?.getPlayer?.(playerId) ?? room?.spectators?.find((entry) => entry.id === playerId) ?? null;
}

/**
 * Determines whether a participant is a non-bot client connection owner.
 *
 * @param {object} participant Player-like participant.
 * @returns {boolean} True for human/spectator clients.
 */
function isClientParticipant(participant) {
  return participant?.type !== "BOT";
}

/**
 * Returns true when a room has at least one connected non-bot participant.
 *
 * @param {object} room Room entity.
 * @returns {boolean} True when at least one client remains connected.
 */
function hasConnectedClientParticipant(room) {
  const participants = [...(room?.players ?? []), ...(room?.spectators ?? [])];

  return participants.some((participant) => {
    if (!isClientParticipant(participant) || !participant.socketId) {
      return false;
    }

    return connections.has(participant.socketId);
  });
}

/**
 * Returns true when a socket id currently resolves to an active connection.
 *
 * @param {string|null|undefined} socketId Socket.IO id.
 * @returns {boolean} True when the socket is still tracked as connected.
 */
function isSocketConnected(socketId) {
  return Boolean(socketId) && connections.has(socketId);
}

/**
 * Removes persisted player sessions for a room to avoid leaking memory.
 *
 * @param {string} roomCode Room code.
 */
function clearRoomSessions(roomCode) {
  const normalizedRoomCode = String(roomCode).toUpperCase();

  for (const [sessionKey, session] of playerSessions.entries()) {
    if (session?.roomCode === normalizedRoomCode) {
      playerSessions.delete(sessionKey);
    }
  }
}

/**
 * Cancels scheduled cleanup for a room.
 *
 * @param {string} roomCode Room code.
 */
function cancelRoomCleanup(roomCode) {
  const normalizedRoomCode = String(roomCode).toUpperCase();
  const timer = cleanupTimers.get(normalizedRoomCode);

  if (timer) {
    clearTimeout(timer);
    cleanupTimers.delete(normalizedRoomCode);
  }
}

/**
 * Deletes a room and its match/game runtime if no connected clients remain.
 *
 * @param {string} roomCode Room code.
 */
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

/**
 * Schedules room cleanup after a reconnect grace window.
 *
 * @param {string} roomCode Room code.
 */
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

/**
 * Stores temporary connection state for a connected socket.
 *
 * @param {import("socket.io").Socket} socket Connected client socket.
 * @returns {{socketId: string, connectedAt: string}} Stored connection state.
 */
function addConnection(socket) {
  const connection = {
    socketId: socket.id,
    connectedAt: new Date().toISOString(),
    roomCode: null,
    playerId: null,
  };

  connections.set(socket.id, connection);

  return connection;
}

/**
 * Removes temporary connection state for a disconnected socket.
 *
 * @param {string} socketId Socket.IO socket id.
 * @returns {{socketId: string, connectedAt: string, roomCode: string|null, playerId: string|null}|null} Removed state.
 */
function removeConnection(socketId) {
  const connection = connections.get(socketId) ?? null;
  connections.delete(socketId);

  return connection;
}

/**
 * Binds a connected socket to a room participant and updates Player.socketId.
 *
 * @param {import("socket.io").Socket} socket Connected client socket.
 * @param {object} params Binding parameters.
 * @param {string} params.roomCode Room code.
 * @param {string} params.playerId Player id.
 * @returns {object} Standard success/error response.
 */
function bindPlayer(socket, { roomCode, playerId } = {}) {
  if (!roomCode || !playerId) {
    return {
      success: false,
      data: null,
      error: {
        code: "SOCKET_BINDING_INVALID",
        message: "roomCode and playerId are required to bind a socket.",
      },
    };
  }

  const room = getRoom(roomCode);

  if (!room) {
    return {
      success: false,
      data: null,
      error: {
        code: "ROOM_NOT_FOUND",
        message: "Room not found.",
      },
    };
  }

  const participant = getParticipant(room, playerId);

  if (!participant || !isClientParticipant(participant)) {
    return {
      success: false,
      data: null,
      error: {
        code: "PLAYER_NOT_FOUND",
        message: "Player not found in room.",
      },
    };
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
  connection.boundAt = new Date().toISOString();
  socket.data = {
    ...(socket.data ?? {}),
    roomCode: normalizedRoomCode,
    playerId,
  };

  participant.setSocketId(socket.id);
  participant.setStatus(room.currentMatch ? Player.STATUS.PLAYING : Player.STATUS.ONLINE);
  playerSessions.set(sessionKey, {
    roomCode: normalizedRoomCode,
    playerId,
    socketId: socket.id,
    connected: true,
    connectedAt: connection.connectedAt,
    lastSeenAt: new Date().toISOString(),
  });
  cancelRoomCleanup(normalizedRoomCode);

  return {
    success: true,
    data: {
      roomCode: normalizedRoomCode,
      playerId,
      socketId: socket.id,
    },
    error: null,
  };
}

/**
 * Marks a bound player disconnected and schedules room cleanup if needed.
 *
 * @param {object} connection Removed connection state.
 */
function markPlayerDisconnected(connection) {
  if (!connection?.roomCode || !connection?.playerId) {
    return;
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
}

/**
 * Returns temporary connection state by socket id.
 *
 * @param {string} socketId Socket.IO socket id.
 * @returns {object|null} Connection state.
 */
function getConnection(socketId) {
  return connections.get(socketId) ?? null;
}

/**
 * Returns all tracked connection states.
 *
 * @returns {Array<object>} Active connections.
 */
function getConnections() {
  return Array.from(connections.values());
}

/**
 * Returns a player session by room and player id.
 *
 * @param {string} roomCode Room code.
 * @param {string} playerId Player id.
 * @returns {object|null} Player session state.
 */
function getPlayerSession(roomCode, playerId) {
  if (!roomCode || !playerId) {
    return null;
  }

  return playerSessions.get(getSessionKey(roomCode, playerId)) ?? null;
}

/**
 * Registers base connection lifecycle tracking and logging.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Connected client socket.
 */
function registerConnectionEvents(io, socket) {
  const connection = addConnection(socket);

  console.log(`Socket connected: ${connection.socketId}`);

  socket.on("disconnect", (reason) => {
    const removedConnection = removeConnection(socket.id);
    markPlayerDisconnected(removedConnection);
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

module.exports = registerConnectionEvents;

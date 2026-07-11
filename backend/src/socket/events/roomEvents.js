import RoomManager from "../../managers/RoomManager.js";
import connectionEvents from "./connectionEvents.js";

const ROOM_UPDATE_EVENT = "room-updated";
const ROOM_ERROR_EVENT = "room-error";

/**
 * Safely invokes an acknowledgement callback when the client supplied one.
 *
 * @param {Function|undefined} acknowledge Optional Socket.IO acknowledgement callback.
 * @param {object} response Standard response payload.
 */
function acknowledgeResponse(acknowledge, response) {
  if (typeof acknowledge === "function") {
    acknowledge(response);
  }
}

/**
 * Returns the room code from supported socket payload shapes.
 *
 * @param {object} payload Client event payload.
 * @returns {string|undefined} Room code.
 */
function getRoomCode(payload = {}) {
  return payload.roomCode ?? payload.roomId ?? payload.code;
}

/**
 * Converts a manager room result into a serializable standard response.
 *
 * @param {object} result Standard manager response.
 * @returns {object} Standard response with room state data when available.
 */
function toRoomResponse(result) {
  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: typeof result.data?.getState === "function" ? result.data.getState() : result.data,
    error: null,
  };
}

/**
 * Emits an event error only to the requesting socket.
 *
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {string} eventName Source event name.
 * @param {object} response Standard error response.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
function emitEventError(socket, eventName, response, acknowledge) {
  const payload = {
    event: eventName,
    ...response,
  };

  socket.emit(ROOM_ERROR_EVENT, payload);
  acknowledgeResponse(acknowledge, response);
}

/**
 * Broadcasts the latest room state to every socket in the Socket.IO room.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {string} roomCode Socket.IO room code.
 * @param {object} response Standard room response.
 */
function emitRoomUpdate(io, roomCode, response) {
  io.to(roomCode).emit(ROOM_UPDATE_EVENT, response);
}

/**
 * Retrieves a room state response through RoomManager.
 *
 * @param {string} roomCode Room code.
 * @returns {object} Standard room response.
 */
function getRoomStateResponse(roomCode) {
  return toRoomResponse(RoomManager.getRoom(roomCode));
}

/**
 * Handles creating a multiplayer room.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
function handleCreateRoom(io, socket, payload = {}, acknowledge) {
  const roomOptions = payload.roomOptions ?? payload;
  const result = RoomManager.createRoom(roomOptions);
  const response = toRoomResponse(result);

  if (!response.success) {
    emitEventError(socket, "create-room", response, acknowledge);
    return;
  }

  socket.join(response.data.code);
  acknowledgeResponse(acknowledge, response);
  emitRoomUpdate(io, response.data.code, response);
}

/**
 * Handles joining a multiplayer room.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
function handleJoinRoom(io, socket, payload = {}, acknowledge) {
  const roomCode = getRoomCode(payload);
  const player = payload.playerInfo ?? payload.player;
  const options = payload.options ?? { asSpectator: Boolean(payload.asSpectator) };
  const reconnectPlayerId = payload.reconnectPlayerId ?? payload.playerId;
  const result = RoomManager.joinRoom(roomCode, player, options);

  if (!result.success) {
    if (reconnectPlayerId && roomCode) {
      const bindingResult = connectionEvents.bindPlayer(socket, { roomCode, playerId: reconnectPlayerId });

      if (bindingResult.success) {
        const response = getRoomStateResponse(roomCode);
        acknowledgeResponse(acknowledge, response);
        emitRoomUpdate(io, roomCode, response);
        return;
      }
    }

    emitEventError(socket, "join-room", result, acknowledge);
    return;
  }

  const response = getRoomStateResponse(roomCode);

  if (!response.success) {
    emitEventError(socket, "join-room", response, acknowledge);
    return;
  }

  socket.join(response.data.code);
  acknowledgeResponse(acknowledge, response);
  emitRoomUpdate(io, response.data.code, response);
}

/**
 * Handles leaving a multiplayer room.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
function handleLeaveRoom(io, socket, payload = {}, acknowledge) {
  const roomCode = getRoomCode(payload);
  const participant = payload.playerId ?? payload.participantId ?? payload.player;
  const result = RoomManager.leaveRoom(roomCode, participant);

  if (!result.success) {
    emitEventError(socket, "leave-room", result, acknowledge);
    return;
  }

  const response = getRoomStateResponse(roomCode);

  if (!response.success) {
    emitEventError(socket, "leave-room", response, acknowledge);
    return;
  }

  acknowledgeResponse(acknowledge, response);
  emitRoomUpdate(io, response.data.code, response);
  socket.leave(response.data.code);
}

/**
 * Handles closing a multiplayer room.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
function handleCloseRoom(io, socket, payload = {}, acknowledge) {
  const roomCode = getRoomCode(payload);
  const result = RoomManager.closeRoom(roomCode);
  const response = toRoomResponse(result);

  if (!response.success) {
    emitEventError(socket, "close-room", response, acknowledge);
    return;
  }

  acknowledgeResponse(acknowledge, response);
  emitRoomUpdate(io, response.data.code, response);

  if (typeof io.in(response.data.code).socketsLeave === "function") {
    io.in(response.data.code).socketsLeave(response.data.code);
  }
}

/**
 * Registers multiplayer room socket events.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Connected client socket.
 */
function registerRoomEvents(io, socket) {
  socket.on("create-room", (payload, acknowledge) => {
    handleCreateRoom(io, socket, payload, acknowledge);
  });

  socket.on("join-room", (payload, acknowledge) => {
    handleJoinRoom(io, socket, payload, acknowledge);
  });

  socket.on("leave-room", (payload, acknowledge) => {
    handleLeaveRoom(io, socket, payload, acknowledge);
  });

  socket.on("close-room", (payload, acknowledge) => {
    handleCloseRoom(io, socket, payload, acknowledge);
  });
}

export default registerRoomEvents;

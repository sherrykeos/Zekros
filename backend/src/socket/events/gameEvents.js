import MatchManager from "../../managers/MatchManager.js";
import RoomManager from "../../managers/RoomManager.js";

const GAME_STATE_EVENT = "game-state";
const GAME_ERROR_EVENT = "game-error";
const GAME_OVER_EVENT = "game-over";

/**
 * Safely invokes an acknowledgement callback when supplied by the client.
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
 * Emits a gameplay error only to the requesting socket.
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

  socket.emit(GAME_ERROR_EVENT, payload);
  acknowledgeResponse(acknowledge, response);
}

/**
 * Finds the room that currently owns a match id.
 *
 * @param {string} matchId Match id.
 * @returns {object|null} Room instance or null.
 */
function findRoomByMatchId(matchId) {
  if (typeof RoomManager.findRoomByMatchId === "function") {
    return RoomManager.findRoomByMatchId(matchId);
  }

  return null;
}

/**
 * Converts a Match instance or move result into complete synchronized game state.
 *
 * @param {object} params State parameters.
 * @param {object} [params.match] Match entity.
 * @param {object} [params.moveData] MatchManager move response data.
 * @param {string} [params.roomCode] Room code.
 * @returns {object} Complete game synchronization payload.
 */
function createGameState({ match = null, moveData = null, roomCode = null } = {}) {
  const matchState = match?.getState?.() ?? moveData?.match ?? null;
  const gameState = matchState?.game ?? moveData ?? null;

  return {
    roomCode: roomCode ?? matchState?.metadata?.roomCode ?? null,
    matchId: matchState?.id ?? moveData?.matchId ?? null,
    matchStatus: matchState?.status ?? moveData?.matchStatus ?? null,
    board: gameState?.board ?? [],
    currentTurn: gameState?.currentTurn ?? null,
    winner: gameState?.winner ?? null,
    draw: gameState?.draw ?? false,
    gameOver: Boolean(gameState?.gameOver),
    players: gameState?.players ?? {},
    activePieces: {
      X: gameState?.players?.X?.activePieces ?? [],
      O: gameState?.players?.O?.activePieces ?? [],
    },
    reclaimTokens: {
      X: gameState?.players?.X?.reclaimTokens ?? null,
      O: gameState?.players?.O?.reclaimTokens ?? null,
    },
    expiringPiece: gameState?.expiringPiece ?? null,
    validMoves: gameState?.validMoves ?? [],
    moveHistory: matchState?.moveHistory ?? [],
    appliedMoves: moveData?.appliedMoves ?? [],
    match: matchState,
  };
}

/**
 * Wraps game state in the project's standard response shape.
 *
 * @param {object} state Complete game synchronization payload.
 * @returns {{success: true, data: object, error: null}} Standard success response.
 */
function successResponse(state) {
  return {
    success: true,
    data: state,
    error: null,
  };
}

/**
 * Broadcasts complete game state to every socket in the room.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {string} roomCode Socket.IO room code.
 * @param {object} response Standard game state response.
 */
function broadcastGameState(io, roomCode, response) {
  io.to(roomCode).emit(GAME_STATE_EVENT, response);

  if (response.data?.gameOver) {
    io.to(roomCode).emit(GAME_OVER_EVENT, response);
  }
}

function handleAsyncEvent(socket, eventName, acknowledge, operation) {
  operation().catch((error) => {
    emitEventError(
      socket,
      eventName,
      {
        success: false,
        data: null,
        error: {
          code: "GAME_EVENT_FAILED",
          message: error.message,
        },
      },
      acknowledge,
    );
  });
}

/**
 * Handles starting a match for a room.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
async function handleStartMatch(io, socket, payload = {}, acknowledge) {
  const roomCode = getRoomCode(payload);
  const result = await RoomManager.startMatch(roomCode, payload.config, payload.metadata);

  if (!result.success) {
    emitEventError(socket, "start-match", result, acknowledge);
    return;
  }

  socket.join(result.data.metadata?.roomCode ?? roomCode);

  const response = successResponse(
    createGameState({
      match: result.data,
      roomCode: result.data.metadata?.roomCode ?? roomCode,
    }),
  );

  acknowledgeResponse(acknowledge, response);
  broadcastGameState(io, response.data.roomCode, response);
}

/**
 * Handles making a move through the existing room and match managers.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
async function handleMakeMove(io, socket, payload = {}, acknowledge) {
  const result = await RoomManager.makeMove({
    roomCode: getRoomCode(payload),
    matchId: payload.matchId,
    playerId: payload.playerId,
    move: payload.move,
  });

  if (!result.success) {
    emitEventError(socket, "make-move", result, acknowledge);
    return;
  }

  const roomCode = result.data.match?.metadata?.roomCode ?? getRoomCode(payload);
  const response = successResponse(
    createGameState({
      moveData: result.data,
      roomCode,
    }),
  );

  acknowledgeResponse(acknowledge, response);
  broadcastGameState(io, response.data.roomCode, response);
}

/**
 * Handles requesting the complete current game state.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
function handleGameState(io, socket, payload = {}, acknowledge) {
  const result = MatchManager.getMatch(payload.matchId);

  if (!result.success) {
    emitEventError(socket, GAME_STATE_EVENT, result, acknowledge);
    return;
  }

  const roomCode = getRoomCode(payload) ?? result.data.metadata?.roomCode ?? findRoomByMatchId(payload.matchId)?.code;
  const response = successResponse(
    createGameState({
      match: result.data,
      roomCode,
    }),
  );

  acknowledgeResponse(acknowledge, response);

  if (roomCode) {
    socket.join(roomCode);
    broadcastGameState(io, roomCode, response);
  }
}

/**
 * Handles game-over synchronization requests without changing game rules.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
function handleGameOver(io, socket, payload = {}, acknowledge) {
  const result = MatchManager.getMatch(payload.matchId);

  if (!result.success) {
    emitEventError(socket, GAME_OVER_EVENT, result, acknowledge);
    return;
  }

  const roomCode = getRoomCode(payload) ?? result.data.metadata?.roomCode ?? findRoomByMatchId(payload.matchId)?.code;
  const response = successResponse(
    createGameState({
      match: result.data,
      roomCode,
    }),
  );

  acknowledgeResponse(acknowledge, response);

  if (roomCode) {
    io.to(roomCode).emit(GAME_OVER_EVENT, response);
  }
}

/**
 * Handles resetting an existing match for a rematch.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Requesting socket.
 * @param {object} payload Client event payload.
 * @param {Function|undefined} acknowledge Optional acknowledgement callback.
 */
async function handleRematch(io, socket, payload = {}, acknowledge) {
  const result = MatchManager.restartMatch(payload.matchId, payload.config, payload.metadata);

  if (!result.success) {
    emitEventError(socket, "rematch", result, acknowledge);
    return;
  }

  const roomCode = getRoomCode(payload) ?? result.data.metadata?.roomCode ?? findRoomByMatchId(payload.matchId)?.code;
  const response = successResponse(
    createGameState({
      match: result.data,
      roomCode,
    }),
  );

  acknowledgeResponse(acknowledge, response);

  if (roomCode) {
    broadcastGameState(io, roomCode, response);
  }
}

/**
 * Registers real-time gameplay synchronization events.
 *
 * @param {import("socket.io").Server} io Socket.IO server instance.
 * @param {import("socket.io").Socket} socket Connected client socket.
 */
function registerGameEvents(io, socket) {
  socket.on("start-match", (payload, acknowledge) => {
    handleAsyncEvent(socket, "start-match", acknowledge, () =>
      handleStartMatch(io, socket, payload, acknowledge),
    );
  });

  socket.on("make-move", (payload, acknowledge) => {
    handleAsyncEvent(socket, "make-move", acknowledge, () =>
      handleMakeMove(io, socket, payload, acknowledge),
    );
  });

  socket.on(GAME_STATE_EVENT, (payload, acknowledge) => {
    handleGameState(io, socket, payload, acknowledge);
  });

  socket.on(GAME_OVER_EVENT, (payload, acknowledge) => {
    handleGameOver(io, socket, payload, acknowledge);
  });

  socket.on("rematch", (payload, acknowledge) => {
    handleAsyncEvent(socket, "rematch", acknowledge, () =>
      handleRematch(io, socket, payload, acknowledge),
    );
  });
}

export default registerGameEvents;

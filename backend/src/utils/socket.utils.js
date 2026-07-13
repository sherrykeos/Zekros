function success(data = null) {
  return {
    success: true,
    data,
    error: null,
  };
}

function failure(code, message) {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  };
}

function acknowledge(acknowledgeCallback, response) {
  if (typeof acknowledgeCallback === "function") {
    acknowledgeCallback(response);
  }
}

function getRoomCode(payload = {}) {
  const roomCode = payload.roomCode ?? payload.roomId ?? payload.code;
  return typeof roomCode === "string" ? roomCode.toUpperCase() : roomCode;
}

function serializeRoom(roomOrState) {
  if (!roomOrState) {
    return null;
  }

  return typeof roomOrState.getState === "function" ? roomOrState.getState() : roomOrState;
}

function serializeMatch(match) {
  if (!match) {
    return null;
  }

  return typeof match.getState === "function" ? match.getState() : match;
}

function createRoomResponse(result) {
  if (!result.success) {
    return result;
  }

  return success(serializeRoom(result.data));
}

function createMatchState({ match = null, moveData = null, roomCode = null } = {}) {
  const matchState = serializeMatch(match) ?? moveData?.match ?? null;
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

function createMatchResponse({ match = null, moveData = null, roomCode = null } = {}) {
  return success(createMatchState({ match, moveData, roomCode }));
}

function emitError(socket, eventName, response, acknowledgeCallback, errorEventName = "socket:error") {
  const payload = {
    event: eventName,
    ...response,
  };

  socket.emit(errorEventName, payload);
  acknowledge(acknowledgeCallback, response);
}

function handleAsync(socket, eventName, acknowledgeCallback, operation, errorEventName = "socket:error") {
  Promise.resolve()
    .then(operation)
    .catch((error) => {
      emitError(
        socket,
        eventName,
        failure("SOCKET_EVENT_FAILED", error.message),
        acknowledgeCallback,
        errorEventName,
      );
    });
}

export {
  acknowledge,
  createMatchResponse,
  createMatchState,
  createRoomResponse,
  emitError,
  failure,
  getRoomCode,
  handleAsync,
  serializeRoom,
  success,
};
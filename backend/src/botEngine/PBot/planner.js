const config = require("./config");

function getOpponentSymbol(game, botSymbol) {
  return Object.keys(game.players).find((symbol) => symbol !== botSymbol) ?? null;
}

function isImmediateWinningMove(game, moveId, symbol) {
  const simulatedGame = game.clone();
  const result = simulatedGame.makeMove(moveId);

  if (!result.success) {
    return false;
  }

  return simulatedGame.getWinner() === symbol;
}

function getImmediateOpponentWins(game, opponentSymbol) {
  if (!opponentSymbol) {
    return new Set();
  }

  const opponentTurnGame = game.clone();
  opponentTurnGame.currentTurn = opponentSymbol;

  return new Set(
    opponentTurnGame
      .getValidMoves()
      .filter((move) => isImmediateWinningMove(opponentTurnGame, move.id, opponentSymbol))
      .map((move) => move.id),
  );
}

function isReclaimMove(game, moveId) {
  if (typeof game.isReclaimMove === "function") {
    return game.isReclaimMove(moveId);
  }

  return game.getState().expiringPiece?.id === moveId;
}

function getCenterScore(move, boardSize) {
  const center = (boardSize - 1) / 2;
  const distance = Math.abs(move.row - center) + Math.abs(move.col - center);
  const maxDistance = boardSize - 1;

  return config.MOVE_PRIORITY.CENTER + (maxDistance - distance);
}

function isCorner(move, boardSize) {
  const lastIndex = boardSize - 1;

  return (
    (move.row === 0 || move.row === lastIndex) &&
    (move.col === 0 || move.col === lastIndex)
  );
}

function scoreMove({ game, move, botSymbol, opponentWinningMoves }) {
  if (isImmediateWinningMove(game, move.id, botSymbol)) {
    return config.MOVE_PRIORITY.IMMEDIATE_WIN;
  }

  if (opponentWinningMoves.has(move.id)) {
    return config.MOVE_PRIORITY.IMMEDIATE_BLOCK;
  }

  if (isReclaimMove(game, move.id)) {
    return config.MOVE_PRIORITY.RECLAIM;
  }

  const boardSize = game.config.boardSize;

  if (isCorner(move, boardSize)) {
    return config.MOVE_PRIORITY.CORNER;
  }

  return getCenterScore(move, boardSize);
}

function planMoves(game, botSymbol) {
  const legalMoves = game.getValidMoves();
  const opponentSymbol = getOpponentSymbol(game, botSymbol);
  const opponentWinningMoves = getImmediateOpponentWins(game, opponentSymbol);

  return legalMoves
    .map((move, index) => ({
      move,
      index,
      priority: scoreMove({ game, move, botSymbol, opponentWinningMoves }),
    }))
    .sort((left, right) => {
      if (right.priority !== left.priority) {
        return right.priority - left.priority;
      }

      return left.index - right.index;
    })
    .map(({ move }) => move);
}

module.exports = planMoves;

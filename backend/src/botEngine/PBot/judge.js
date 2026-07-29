function evaluateLineThreats(board, boardSize, winLength, botSymbol, opponentSymbol) {
  let score = 0;
  const directions = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal \
    [1, -1], // Diagonal /
  ];

  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      for (const [dr, dc] of directions) {
        let botCount = 0;
        let oppCount = 0;
        let validLine = true;

        for (let i = 0; i < winLength; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;

          if (nr < 0 || nr >= boardSize || nc < 0 || nc >= boardSize) {
            validLine = false;
            break;
          }

          const cell = board[nr * boardSize + nc];
          const owner = cell?.owner;
          if (owner === botSymbol) botCount++;
          else if (owner === opponentSymbol) oppCount++;
        }

        if (validLine) {
          if (botCount > 0 && oppCount === 0) {
            if (botCount === winLength - 1) score += 150;
            else if (botCount === winLength - 2) score += 20;
            else score += 5;
          } else if (oppCount > 0 && botCount === 0) {
            if (oppCount === winLength - 1) score -= 180;
            else if (oppCount === winLength - 2) score -= 25;
            else score -= 5;
          }
        }
      }
    }
  }

  return score;
}

/**
 * Evaluates the current game state.
 *
 * Positive score  -> Good for Bot
 * Negative score  -> Good for Opponent
 * Zero            -> Draw
 */
function judge(game, botSymbol) {
  const winner = game.getWinner();
  const opponentSymbol = botSymbol === "X" ? "O" : "X";

  if (winner === botSymbol) {
    return 10000;
  }

  if (winner === opponentSymbol) {
    return -10000;
  }

  if (game.draw) {
    return 0;
  }

  const board = game.board.getBoard();
  const boardSize = game.config.boardSize;
  const winLength = game.config.winLength ?? (boardSize > 3 ? 4 : 3);

  let score = evaluateLineThreats(board, boardSize, winLength, botSymbol, opponentSymbol);

  // Center control
  const center = Math.floor(boardSize / 2);
  const centerCell = board.find((c) => c.row === center && c.col === center);
  if (centerCell?.owner === botSymbol) score += 25;
  else if (centerCell?.owner === opponentSymbol) score -= 25;

  // Reclaim tokens
  const botPlayer = game.players[botSymbol];
  const oppPlayer = game.players[opponentSymbol];
  if (botPlayer && oppPlayer) {
    score += (botPlayer.reclaimTokens - oppPlayer.reclaimTokens) * 15;
  }

  return score;
}

export default judge;
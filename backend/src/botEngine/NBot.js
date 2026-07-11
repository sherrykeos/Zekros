class NBot {
  getMove(game, symbol) {
    if (!game || game.isGameOver()) {
      return null;
    }

    const validMoves = game.getValidMoves();

    if (validMoves.length === 0) {
      return null;
    }

    const opponent = symbol === "X" ? "O" : "X";

    for (const move of validMoves) {
      const simulatedGame = game.clone();
      const result = simulatedGame.makeMove(move.id);

      if (result.success && simulatedGame.getWinner() === symbol) {
        return move.id;
      }
    }

    for (const move of validMoves) {
      const simulatedGame = game.clone();
      simulatedGame.currentTurn = opponent;
      const result = simulatedGame.makeMove(move.id);

      if (result.success && simulatedGame.getWinner() === opponent) {
        return move.id;
      }
    }

    const boardSize = game.config.boardSize;
    const center = Math.floor(boardSize / 2);
    const centerCell = validMoves.find(
      (cell) => cell.row === center && cell.col === center,
    );

    if (centerCell) {
      return centerCell.id;
    }

    const corners = [
      `0-0`,
      `0-${boardSize - 1}`,
      `${boardSize - 1}-0`,
      `${boardSize - 1}-${boardSize - 1}`,
    ];

    const cornerMove = validMoves.find((move) => corners.includes(move.id));

    if (cornerMove) {
      return cornerMove.id;
    }

    return validMoves[0].id;
  }
}

export default NBot;

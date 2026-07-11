class Rules {
  static getCell(board, row, col) {
    return board.find((cell) => cell.row === row && cell.col === col);
  }

  static isValidMove(board, cellId, options = {}) {
    const cell = board.find((cell) => cell.id === cellId);

    if (!cell) {
      return false;
    }

    // The current player's expiring cell is a valid target only when the
    // engine passes it in after checking reclaim-token availability.
    if (options.reclaimCellId === cellId) {
      return true;
    }

    return cell.owner === null;
  }

  static getValidMoves(board, options = {}) {
    return board.filter(
      (cell) => cell.owner === null || options.reclaimCellId === cell.id,
    );
  }

  static isBoardFull(board) {
    return board.every((cell) => cell.owner !== null);
  }

  static checkWinner(board, boardSize, winLength) {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal
      [1, -1], // anti-diagonal
    ];

    for (const cell of board) {
      if (!cell.owner) {
        continue;
      }

      for (const [rowStep, colStep] of directions) {
        let count = 1;

        let row = cell.row;
        let col = cell.col;

        while (true) {
          row += rowStep;
          col += colStep;

          const nextCell = this.getCell(board, row, col);

          if (!nextCell || nextCell.owner !== cell.owner) {
            break;
          }

          count++;

          if (count >= winLength) {
            return cell.owner;
          }
        }
      }
    }

    return null;
  }

  static getCellById(board, cellId) {
    return board.find((cell) => cell.id === cellId);
  }
}

export default Rules;

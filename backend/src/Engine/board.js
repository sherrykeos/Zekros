class Board {
  constructor(size) {
    this.size = size;
    this.cells = this.createBoard();
  }

  createBoard() {
    const cells = [];

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        cells.push({
          id: `${row}-${col}`,
          row,
          col,
          owner: null,
        });
      }
    }

    return cells;
  }

  getCell(cellId) {
    return this.cells.find(
      cell => cell.id === cellId
    );
  }

  setCell(cellId, playerSymbol) {
    const cell = this.getCell(cellId);

    if (!cell) {
      return false;
    }

    cell.owner = playerSymbol;

    return true;
  }

  clearCell(cellId) {
    const cell = this.getCell(cellId);

    if (!cell) {
      return false;
    }

    cell.owner = null;

    return true;
  }

  getBoard() {
    return this.cells;
  }

  clone() {
  return JSON.parse(
    JSON.stringify(this.cells)
  );
}
}

module.exports = Board;
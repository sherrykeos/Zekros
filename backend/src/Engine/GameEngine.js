import Board from "./board.js";
import Rules from "./rules.js";

class GameEngine {
  static normalizeConfig(config) {
    return {
      ...config,
      reclaimTokens: config.reclaimTokens ?? config.maxActivePieces,
    };
  }

  createPlayers() {
    return {
      X: {
        symbol: "X",
        activePieces: [],
        reclaimTokens: this.config.reclaimTokens,
      },
      O: {
        symbol: "O",
        activePieces: [],
        reclaimTokens: this.config.reclaimTokens,
      },
    };
  }

  constructor(config) {
    this.config = GameEngine.normalizeConfig(config);
    this.board = new Board(this.config.boardSize);
    this.players = this.createPlayers();
    this.currentTurn = "X";
    this.winner = null;
    this.gameOver = false;
    this.draw = false;
  }

  static fromState(gameState) {
    const game = new GameEngine(gameState.config);

    game.board.cells = JSON.parse(JSON.stringify(gameState.board));
    game.players = game.normalizePlayers(gameState.players);
    game.currentTurn = gameState.currentTurn;
    game.winner = gameState.winner;
    game.gameOver = gameState.gameOver;
    game.draw = gameState.draw ?? (gameState.gameOver && !gameState.winner);

    return game;
  }

  normalizePlayers(players) {
    const sourcePlayers = players ?? {};
    const normalized = {};

    for (const symbol of Object.keys(this.players)) {
      normalized[symbol] = {
        symbol,
        activePieces: [...(sourcePlayers[symbol]?.activePieces ?? [])],
        reclaimTokens: sourcePlayers[symbol]?.reclaimTokens ?? this.config.reclaimTokens,
      };
    }

    return normalized;
  }

  getState() {
    return {
      config: this.config,
      board: this.board.getBoard(),
      currentTurn: this.currentTurn,
      winner: this.winner,
      draw: this.draw,
      gameOver: this.gameOver,
      players: this.players,
      expiringPiece: this.getExpiringPiece(),
      validMoves: this.getValidMoves(),
    };
  }

  switchTurn() {
    this.currentTurn = this.currentTurn === "X" ? "O" : "X";
  }

  getCurrentPlayer() {
    return this.players[this.currentTurn];
  }

  getExpiringPiece(symbol = this.currentTurn) {
    const player = this.players[symbol];

    if (!player || player.activePieces.length < this.config.maxActivePieces) {
      return null;
    }

    const cell = this.board.getCell(player.activePieces[0]);

    if (!cell) {
      return null;
    }

    return {
      id: cell.id,
      row: cell.row,
      col: cell.col,
      owner: cell.owner,
    };
  }

  isReclaimMove(cellId, player = this.getCurrentPlayer()) {
    if (!player) {
      return false;
    }

    const expiringPiece = this.getExpiringPiece(player.symbol);
    return expiringPiece?.id === cellId && expiringPiece.owner === player.symbol;
  }

  reset() {
    this.board = new Board(this.config.boardSize);
    this.players = this.createPlayers();
    this.currentTurn = "X";
    this.winner = null;
    this.gameOver = false;
    this.draw = false;
  }

  clone() {
    const clonedGame = new GameEngine({ ...this.config });

    clonedGame.board.cells = JSON.parse(JSON.stringify(this.board.getBoard()));
    clonedGame.players = JSON.parse(JSON.stringify(this.players));
    clonedGame.currentTurn = this.currentTurn;
    clonedGame.winner = this.winner;
    clonedGame.gameOver = this.gameOver;
    clonedGame.draw = this.draw;

    return clonedGame;
  }

  getValidMoves() {
    if (this.gameOver) {
      return [];
    }

    const currentPlayer = this.getCurrentPlayer();
    const expiringPiece = this.getExpiringPiece();

    return Rules.getValidMoves(this.board.getBoard(), {
      reclaimCellId: currentPlayer?.reclaimTokens > 0 ? expiringPiece?.id : null,
    });
  }

  makeMove(cellId) {
    if (this.gameOver) {
      return { success: false, message: "Game is over." };
    }

    const board = this.board.getBoard();
    const currentPlayer = this.getCurrentPlayer();
    const isReclaimMove = this.isReclaimMove(cellId, currentPlayer);

    const isValid = Rules.isValidMove(board, cellId, {
      reclaimCellId: isReclaimMove ? cellId : null,
    });

    if (!isValid) {
      return { success: false, message: "Invalid move." };
    }

    if (isReclaimMove && currentPlayer.reclaimTokens <= 0) {
      return { success: false, message: "No reclaim tokens left." };
    }

    if (isReclaimMove) {
      currentPlayer.reclaimTokens--;
    }

    this.board.setCell(cellId, this.currentTurn);
    currentPlayer.activePieces.push(cellId);

    const winner = Rules.checkWinner(
      this.board.getBoard(),
      this.config.boardSize,
      this.config.winLength,
    );

    if (winner) {
      this.winner = winner;
      this.gameOver = true;
      this.draw = false;
      return { success: true };
    }

    if (currentPlayer.activePieces.length > this.config.maxActivePieces) {
      const oldestMove = currentPlayer.activePieces.shift();

      if (!isReclaimMove) {
        this.board.clearCell(oldestMove);
      }
    }

    this.switchTurn();

    if (this.getValidMoves().length === 0) {
      this.gameOver = true;
      this.draw = true;
    }

    return { success: true };
  }

  getGameStatus() {
    return {
      gameOver: this.gameOver,
      winner: this.winner,
      draw: this.draw,
      currentTurn: this.currentTurn,
    };
  }

  isGameOver() {
    return this.gameOver;
  }

  isDraw() {
    return this.draw;
  }

  getWinner() {
    return this.winner;
  }
}

export default GameEngine;

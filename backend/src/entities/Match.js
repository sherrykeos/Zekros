import generateId from "../utils/id.js";

const MATCH_STATUS = Object.freeze({
  WAITING: "WAITING",
  PLAYING: "PLAYING",
  FINISHED: "FINISHED",
});

class Match {
  constructor({
    id = generateId("match"),
    game,
    status = MATCH_STATUS.PLAYING,
    startedAt = new Date(),
    endedAt = null,
    winner = null,
    moveHistory = [],
    metadata = {},
  } = {}) {
    if (!game) {
      throw new Error("Match requires a GameEngine instance created by GameManager.");
    }

    this.id = id;
    this.game = game;
    this.config = { ...this.game.config };
    this.moveHistory = moveHistory.map((entry) => this.clone(entry));
    this.winner = winner;
    this.status = status;
    this.startedAt = this.toIsoString(startedAt);
    this.endedAt = endedAt ? this.toIsoString(endedAt) : null;
    this.metadata = this.clone(metadata);
  }

  makeMove(cellId, metadata = {}) {
    if (this.status === MATCH_STATUS.FINISHED) {
      return { success: false, message: "Match is finished." };
    }

    const before = this.captureMoveContext(cellId);
    const moveResult = this.game.makeMove(cellId);

    if (!moveResult.success) {
      return moveResult;
    }

    const after = this.capturePostMoveContext(before.player);

    this.moveHistory.push(
      this.createMoveHistoryEntry({
        before,
        after,
        metadata,
      }),
    );

    if (this.game.isGameOver()) {
      this.finish(this.game.getWinner());
    }

    return { success: true };
  }

  finish(winner = null) {
    this.status = MATCH_STATUS.FINISHED;
    this.winner = winner;
    this.endedAt = new Date().toISOString();
  }


  getState() {
    return {
      id: this.id,
      status: this.status,
      winner: this.winner,
      draw: this.game.isDraw(),
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      metadata: this.clone(this.metadata),
      game: this.game.getState(),
      moveHistory: this.getMoveHistory(),
    };
  }

  getReplayData() {
    return {
      matchId: this.id,
      config: { ...this.config },
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      winner: this.winner,
      draw: this.game.isDraw(),
      moves: this.getMoveHistory(),
    };
  }

  getMoveHistory() {
    return this.moveHistory.map((entry) => this.clone(entry));
  }

  getHistory() {
    return this.getMoveHistory();
  }

  captureMoveContext(cellId) {
    const player = this.game.currentTurn;
    const cell = this.game.board.getCell(cellId);
    const playerState = this.game.players[player];
    const expiringPiece = this.game.getExpiringPiece(player);

    return {
      turn: this.moveHistory.length + 1,
      player,
      cell,
      expiringPiece,
      isReclaimMove: this.game.isReclaimMove(cellId, playerState),
      reclaimTokensBefore: playerState?.reclaimTokens ?? null,
    };
  }

  capturePostMoveContext(player) {
    return {
      reclaimTokensAfter: this.game.players[player]?.reclaimTokens ?? null,
      winner: this.game.getWinner(),
      draw: this.game.isDraw(),
      status: this.game.isGameOver() ? MATCH_STATUS.FINISHED : MATCH_STATUS.PLAYING,
    };
  }

  createMoveHistoryEntry({ before, after, metadata }) {
    return {
      id: generateId("move"),
      turn: before.turn,
      player: before.player,
      move: {
        cellId: before.cell?.id ?? null,
        row: before.cell?.row ?? null,
        col: before.cell?.col ?? null,
      },
      timestamp: new Date().toISOString(),
      metadata: {
        ...this.clone(metadata),
        isReclaimMove: before.isReclaimMove,
        expiringCellId: before.expiringPiece?.id ?? null,
        reclaimTokensBefore: before.reclaimTokensBefore,
        reclaimTokensAfter: after.reclaimTokensAfter,
        winnerAfterMove: after.winner,
        drawAfterMove: after.draw,
        statusAfterMove: after.status,
      },
    };
  }

  toIsoString(value) {
    return value instanceof Date ? value.toISOString() : value;
  }

  clone(value) {
    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value));
  }
}

Match.STATUS = MATCH_STATUS;

export default Match;

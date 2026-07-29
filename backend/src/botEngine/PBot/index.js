import brain from "./brain.js";
import planMoves from "./planner.js";
import config from "./config.js";

class PBot {
  constructor(options = {}) {
    this.depth = options.depth ?? config.DEFAULT_DEPTH;
  }

  getMove(game, botSymbol) {
    if (!game || game.isGameOver()) {
      return null;
    }

    const legalMoves = game.getValidMoves();

    if (legalMoves.length === 0) {
      return null;
    }

    const opponentSymbol = botSymbol === "X" ? "O" : "X";

    // 1. Immediate Win check: If bot can win right now, ALWAYS take it!
    for (const move of legalMoves) {
      const sim = game.clone();
      const res = sim.makeMove(move.id);
      if (res.success && (sim.getWinner() === botSymbol || sim.winner === botSymbol)) {
        return move.id;
      }
    }

    // 2. Immediate Block check: If opponent can win next turn, ALWAYS block it!
    for (const move of legalMoves) {
      const sim = game.clone();
      sim.currentTurn = opponentSymbol;
      const res = sim.makeMove(move.id);
      if (res.success && (sim.getWinner() === opponentSymbol || sim.winner === opponentSymbol)) {
        return move.id;
      }
    }

    // 3. Minimax search with ordered moves and heuristic evaluation
    const orderedMoves = planMoves(game, botSymbol);
    let bestMove = orderedMoves[0]?.id ?? legalMoves[0].id;
    let bestScore = Number.NEGATIVE_INFINITY;
    let alpha = config.INITIAL_ALPHA;
    const beta = config.INITIAL_BETA;

    for (const move of orderedMoves) {
      const simulatedGame = game.clone();
      const result = simulatedGame.makeMove(move.id);

      if (!result.success) {
        continue;
      }

      if (simulatedGame.getWinner() === botSymbol) {
        return move.id;
      }

      const score = brain({
        game: simulatedGame,
        depth: this.depth - 1,
        alpha,
        beta,
        maximizing: false,
        botSymbol,
      });

      if (score > bestScore) {
        bestScore = score;
        bestMove = move.id;
      }

      alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
  }
}

export default PBot;

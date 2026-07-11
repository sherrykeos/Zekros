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

    const orderedMoves = planMoves(game, botSymbol);

    if (orderedMoves.length === 0) {
      return null;
    }

    let bestMove = null;
    let bestScore = Number.NEGATIVE_INFINITY;
    let alpha = config.INITIAL_ALPHA;
    const beta = config.INITIAL_BETA;

    for (const move of orderedMoves) {
      const simulatedGame = game.clone();
      const result = simulatedGame.makeMove(move.id);

      if (!result.success) {
        continue;
      }

      const score = brain({
        game: simulatedGame,
        depth: this.depth - 1,
        alpha,
        beta,
        maximizing: false,
        botSymbol,
      });

      if (bestMove === null || score > bestScore) {
        bestScore = score;
        bestMove = move.id;
      }

      alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
  }
}

export default PBot;

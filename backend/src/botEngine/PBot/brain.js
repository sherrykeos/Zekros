import judge from "./judge.js";
import config from "./config.js";

function scoreWithDepth(score, depth) {
  if (score > config.DRAW_SCORE) {
    return score + depth * config.DEPTH_SCORE_FACTOR;
  }

  if (score < config.DRAW_SCORE) {
    return score - depth * config.DEPTH_SCORE_FACTOR;
  }

  return score;
}

function brain({ game, depth, alpha, beta, maximizing, botSymbol }) {
  if (depth <= 0 || game.isGameOver()) {
    return scoreWithDepth(judge(game, botSymbol), depth);
  }

  const legalMoves = game.getValidMoves();

  if (legalMoves.length === 0) {
    return judge(game, botSymbol);
  }

  if (maximizing) {
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const move of legalMoves) {
      const simulatedGame = game.clone();
      const result = simulatedGame.makeMove(move.id);

      if (!result.success) {
        continue;
      }

      const score = brain({
        game: simulatedGame,
        depth: depth - 1,
        alpha,
        beta,
        maximizing: false,
        botSymbol,
      });

      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);

      if (beta <= alpha) {
        break;
      }
    }

    return bestScore;
  }

  let bestScore = Number.POSITIVE_INFINITY;

  for (const move of legalMoves) {
    const simulatedGame = game.clone();
    const result = simulatedGame.makeMove(move.id);

    if (!result.success) {
      continue;
    }

    const score = brain({
      game: simulatedGame,
      depth: depth - 1,
      alpha,
      beta,
      maximizing: true,
      botSymbol,
    });

    bestScore = Math.min(bestScore, score);
    beta = Math.min(beta, bestScore);

    if (beta <= alpha) {
      break;
    }
  }

  return bestScore;
}

export default brain;

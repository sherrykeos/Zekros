const GameEngine = require("../Engine/GameEngine");

class RandomBot {
  getMove(gameState) {
    // Use the engine-owned move list so reclaim moves are available to bots too.
    const validMoves = GameEngine.fromState(gameState).getValidMoves();

    if (validMoves.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * validMoves.length);

    return validMoves[randomIndex].id;
  }
}

module.exports = RandomBot;

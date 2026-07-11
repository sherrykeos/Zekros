/**
 * Evaluates the current game state.
 *
 * Positive score  -> Good for Bot
 * Negative score  -> Good for Opponent
 * Zero            -> Draw or Game Still Running
 */

function judge(game, botSymbol) {

    const winner = game.getWinner();

    // No winner yet
    if (!winner) {
        return 0;
    }

    // Bot wins
    if (winner === botSymbol) {
        return 10;
    }

    // Opponent wins
    return -10;
}

export default judge;
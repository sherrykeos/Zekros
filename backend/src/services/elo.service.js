import * as ratingRepository from "../repositories/rating.repository.js";
import { getRatingType } from "../utils/rating.js";

const DEFAULT_RATING = 1000;
const K_FACTOR = 32;

/**
 * Converts board size into the corresponding RatingType.
 */
const ratingType = getRatingType(boardSize);

/**
 * Returns the expected probability of winning.
 */
function getExpectedScore(playerRating, opponentRating) {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Returns the new Elo rating.
 */
function calculateRating(currentRating, expectedScore, actualScore) {
  return Math.round(
    currentRating + K_FACTOR * (actualScore - expectedScore)
  );
}

/**
 * Updates ratings for both players after a ranked match.
 */
export async function updateRatings({
  winnerUserId,
  loserUserId,
  boardSize,
  db,
}) {
  const ratingType = getRatingType(boardSize);

  // Ensure rating rows exist.
  const winner = await ratingRepository.upsert(
    winnerUserId,
    ratingType,
    db
  );

  const loser = await ratingRepository.upsert(
    loserUserId,
    ratingType,
    db
  );

  const winnerExpected = getExpectedScore(
    winner.rating,
    loser.rating
  );

  const loserExpected = getExpectedScore(
    loser.rating,
    winner.rating
  );

  const winnerRating = calculateRating(
    winner.rating,
    winnerExpected,
    1
  );

  const loserRating = calculateRating(
    loser.rating,
    loserExpected,
    0
  );

  await ratingRepository.update(
    winner.id,
    {
      rating: winnerRating,
      peakRating: Math.max(winner.peakRating, winnerRating),
      gamesPlayed: winner.gamesPlayed + 1,
      wins: winner.wins + 1,
      lastPlayedAt: new Date(),
    },
    db
  );

  await ratingRepository.update(
    loser.id,
    {
      rating: loserRating,
      peakRating: Math.max(loser.peakRating, loserRating),
      gamesPlayed: loser.gamesPlayed + 1,
      losses: loser.losses + 1,
      lastPlayedAt: new Date(),
    },
    db
  );

  return {
    winner: {
      before: winner.rating,
      after: winnerRating,
      change: winnerRating - winner.rating,
    },
    loser: {
      before: loser.rating,
      after: loserRating,
      change: loserRating - loser.rating,
    },
  };
}

export default {
  updateRatings,
};
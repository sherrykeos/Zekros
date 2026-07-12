import * as matchRepository from "../repositories/match.repository.js";

/**
 * Create a new match.
 *
 * This only persists match metadata.
 * Participants are created separately.
 */
export async function createMatch(matchData) {
  return matchRepository.create(matchData);
}

/**
 * Return complete match details.
 */
export async function getMatch(matchId) {
  return matchRepository.findWithParticipantsAndMoves(matchId);
}

/**
 * Update match metadata.
 *
 * Example:
 * - status
 * - winner
 * - totalMoves
 */
export async function updateMatch(matchId, data) {
  return matchRepository.update(matchId, data);
}
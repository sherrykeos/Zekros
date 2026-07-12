import * as matchRepository from "../repositories/match.repository.js";

/**
 * Return complete match history.
 *
 * The repository loads:
 * - match information
 * - participants
 * - chronological moves
 */
export async function getMatchHistory(matchId) {
  return matchRepository.findWithParticipantsAndMoves(matchId);
}
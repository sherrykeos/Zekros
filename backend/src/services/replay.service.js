import * as moveRepository from "../repositories/move.repository.js";

/**
 * Return replay data.
 *
 * A replay is simply an ordered list of moves.
 * The frontend (or GameEngine) can reconstruct
 * every board state from these moves.
 */
export async function getReplay(matchId) {
  return moveRepository.findByMatch(matchId);
}
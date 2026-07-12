import * as moveRepository from "../repositories/move.repository.js";

/**
 * Persist a move.
 *
 * Validation should already be performed
 * by the GameEngine before reaching here.
 */
export async function createMove(moveData) {
  return moveRepository.create(moveData);
}

/**
 * Return every move of a match.
 */
export async function getMoves(matchId) {
  return moveRepository.findByMatch(matchId);
}

/**
 * Return the latest move.
 */
export async function getLastMove(matchId) {
  return moveRepository.findLast(matchId);
}
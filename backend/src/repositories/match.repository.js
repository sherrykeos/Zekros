import prisma from "../lib/prisma.js";

/**
 * Create a new match.
 */
export function create(data) {
  return prisma.match.create({
    data,
  });
}

/**
 * Find a match by id.
 */
export function findById(matchId) {
  return prisma.match.findUnique({
    where: { id: matchId },
  });
}

/**
 * Fetch a match with everything needed for replay/history.
 */
export function findWithParticipantsAndMoves(matchId) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: true,
      moves: {
        orderBy: {
          moveNumber: "asc",
        },
      },
    },
  });
}

/**
 * Persist changes to a match.
 */
export function update(matchId, data) {
  return prisma.match.update({
    where: { id: matchId },
    data,
  });
}
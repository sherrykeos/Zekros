import prisma from "../lib/prisma.js";

/**
 * Create a new match.
 */
export function create(data, db=prisma) {
  return db.match.create({
    data,
  });
}

/**
 * Find a match by id.
 */
export function findById(matchId, db=prisma) {
  return db.match.findUnique({
    where: { id: matchId },
  });
}

/**
 * Fetch a match with everything needed for replay/history.
 */
export function findWithParticipantsAndMoves(matchId, db=prisma) {
  return db.match.findUnique({
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
export function update(matchId, data, db=prisma) {
  return db.match.update({
    where: { id: matchId },
    data,
  });
}
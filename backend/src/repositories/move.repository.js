import prisma from "../lib/prisma.js";


/**
 * Save a move.
 */
export function create(data, db=prisma) {
  return db.move.create({
    data,
  });
}

/**
 * Fetch every move in chronological order.
 */
export function findByMatch(matchId, db=prisma) {
  return db.move.findMany({
    where: {
      matchId,
    },
    orderBy: {
      moveNumber: "asc",
    },
  });
}

/**
 * Return the latest move.
 */
export function findLast(matchId, db=prisma) {
  return db.move.findFirst({
    where: {
      matchId,
    },
    orderBy: {
      moveNumber: "desc",
    },
  });
}
import prisma from "../lib/prisma.js";


/**
 * Save a move.
 */
export function create(data) {
  return prisma.move.create({
    data,
  });
}

/**
 * Fetch every move in chronological order.
 */
export function findByMatch(matchId) {
  return prisma.move.findMany({
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
export function findLast(matchId) {
  return prisma.move.findFirst({
    where: {
      matchId,
    },
    orderBy: {
      moveNumber: "desc",
    },
  });
}
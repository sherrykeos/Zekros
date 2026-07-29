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
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      },
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

/**
 * Find list of matches with participants and moves.
 */
export function findMany(where = {}, limit = 50, db = prisma) {
  return db.match.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      },
      moves: {
        orderBy: {
          moveNumber: "asc",
        },
      },
    },
  });
}

/**
 * Permanently delete a match from DB.
 */
export function remove(matchId, db = prisma) {
  return db.match.delete({
    where: { id: matchId },
  });
}

/**
 * Delete all matches where result is null.
 */
export function deleteUnfinishedMatches(db = prisma) {
  return db.match.deleteMany({
    where: {
      result: null,
    },
  });
}
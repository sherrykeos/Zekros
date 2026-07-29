import prisma from "../lib/prisma.js";

/**
 * Add a participant to a match.
 */
export function create(data, db=prisma) {
  return db.participant.create({
    data,
  });
}

/**
 * Find a participant.
 */
export function findById(participantId, db=prisma) {
  return db.participant.findUnique({
    where: {
      id: participantId,
    },
  });
}

/**
 * Fetch every participant of a match.
 */
export function findByMatch(matchId, db=prisma) {
  return db.participant.findMany({
    where: {
      matchId,
    },
    orderBy: {
      joinedAt: "asc",
    },
  });
}

/**
 * Fetch one participant in a match by engine symbol.
 */
export function findByMatchAndSymbol(matchId, symbol, db=prisma) {
  return db.participant.findUnique({
    where: {
      matchId_symbol: {
        matchId,
        symbol,
      },
    },
  });
}
/**
 * Update participant fields.
 */
export function update(participantId, data, db=prisma) {
  return db.participant.update({
    where: {
      id: participantId,
    },
    data,
  });
}

/**
 * Find participant by matchId and userId.
 */
export function findByMatchAndUser(matchId, userId, db=prisma) {
  return db.participant.findFirst({
    where: {
      matchId,
      userId,
    },
  });
}

/**
 * Soft delete participant by setting isDeleted to true.
 */
export function markDeleted(participantId, db=prisma) {
  return db.participant.update({
    where: {
      id: participantId,
    },
    data: {
      isDeleted: true,
    },
  });
}
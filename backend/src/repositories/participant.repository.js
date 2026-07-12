import prisma from "../lib/prisma.js";

/**
 * Add a participant to a match.
 */
export function create(data) {
  return prisma.participant.create({
    data,
  });
}

/**
 * Find a participant.
 */
export function findById(participantId) {
  return prisma.participant.findUnique({
    where: {
      id: participantId,
    },
  });
}

/**
 * Fetch every participant of a match.
 */
export function findByMatch(matchId) {
  return prisma.participant.findMany({
    where: {
      matchId,
    },
    orderBy: {
      joinedAt: "asc",
    },
  });
}

/**
 * Update participant fields.
 */
export function update(participantId, data) {
  return prisma.participant.update({
    where: {
      id: participantId,
    },
    data,
  });
}
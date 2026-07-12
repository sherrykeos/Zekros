import prisma from "../lib/prisma.js";


/**
 * Create default statistics for a user.
 */
export function create(userId) {
  return prisma.userStats.create({
    data: {
      userId,
    },
  });
}

/**
 * Fetch a user's statistics.
 */
export function findByUser(userId) {
  return prisma.userStats.findUnique({
    where: {
      userId,
    },
  });
}

/**
 * Update statistics.
 */
export function update(userId, data) {
  return prisma.userStats.update({
    where: {
      userId,
    },
    data,
  });
}
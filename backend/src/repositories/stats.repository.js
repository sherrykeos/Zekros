import prisma from "../lib/prisma.js";


/**
 * Create default statistics for a user.
 */
export function create(userId, db=prisma) {
  return db.userStats.create({
    data: {
      userId,
    },
  });
}

/**
 * Fetch a user's statistics.
 */
export function findByUser(userId, db=prisma) {
  return db.userStats.findUnique({
    where: {
      userId,
    },
  });
}

/**
 * Update statistics.
 */
export function update(userId, data, db=prisma) {
  return db.userStats.update({
    where: {
      userId,
    },
    data,
  });
}
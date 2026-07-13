import prisma from "../config/prisma.js";

/**
 * Finds a rating entry for a user and rating type.
 *
 * @param {string} userId
 * @param {string} type
 * @param {import("@prisma/client").PrismaClient} db
 */
export async function findByUserAndType(userId, type, db = prisma) {
  return db.userRating.findUnique({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
  });
}

/**
 * Creates a new rating record.
 *
 * @param {object} data
 * @param {import("@prisma/client").PrismaClient} db
 */
export async function create(data, db = prisma) {
  return db.userRating.create({
    data,
  });
}

/**
 * Updates an existing rating record.
 *
 * @param {string} id
 * @param {object} data
 * @param {import("@prisma/client").PrismaClient} db
 */
export async function update(id, data, db = prisma) {
  return db.userRating.update({
    where: { id },
    data,
  });
}

/**
 * Returns an existing rating or creates the initial one.
 *
 * Every ranked player always has exactly one rating
 * per RatingType.
 *
 * @param {string} userId
 * @param {string} type
 * @param {import("@prisma/client").PrismaClient} db
 */
export async function upsert(userId, type, db = prisma) {
  return db.userRating.upsert({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
    create: {
      userId,
      type,
    },
    update: {},
  });
}

/**
 * Returns all ratings for a user.
 *
 * Useful for profile pages.
 *
 * @param {string} userId
 * @param {import("@prisma/client").PrismaClient} db
 */
export async function findAllByUser(userId, db = prisma) {
  return db.userRating.findMany({
    where: { userId },
    orderBy: {
      type: "asc",
    },
  });
}

/**
 * Returns leaderboard for a rating type.
 *
 * @param {string} type
 * @param {number} limit
 * @param {import("@prisma/client").PrismaClient} db
 */
export async function getLeaderboard(type, limit = 100, db = prisma) {
  return db.userRating.findMany({
    where: {
      type,
    },
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
    orderBy: {
      rating: "desc",
    },
    take: limit,
  });
}
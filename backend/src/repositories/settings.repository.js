import prisma from "../lib/prisma.js";

/**
 * Create default settings.
 */
export function create(userId, db=prisma) {
  return db.userSettings.create({
    data: {
      userId,
    },
  });
}

/**
 * Fetch user settings.
 */
export function findByUser(userId, db=prisma) {
  return db.userSettings.findUnique({
    where: {
      userId,
    },
  });
}

/**
 * Update settings.
 */
export function update(userId, data, db=prisma) {
  return db.userSettings.update({
    where: {
      userId,
    },
    data,
  });
}
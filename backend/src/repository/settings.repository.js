import prisma from "../../config/prisma.js";

/**
 * Create default settings.
 */
export function create(userId) {
  return prisma.userSettings.create({
    data: {
      userId,
    },
  });
}

/**
 * Fetch user settings.
 */
export function findByUser(userId) {
  return prisma.userSettings.findUnique({
    where: {
      userId,
    },
  });
}

/**
 * Update settings.
 */
export function update(userId, data) {
  return prisma.userSettings.update({
    where: {
      userId,
    },
    data,
  });
}
import {
  create,
  findByUser,
  update,
} from "../repositories/stats.repository.js";

/**
 * Create an empty stats record for a new user.
 */
export async function initializeUserStats(userId) {
  return create(userId);
}

/**
 * Return a user's statistics.
 */
export async function getUserStats(userId) {
  return findByUser(userId);
}

/**
 * Update statistics.
 *
 * Rating updates and match completion
 * will eventually use this service.
 */
export async function updateUserStats(userId, data) {
  return update(userId, data);
}
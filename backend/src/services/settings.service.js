import {
  create,
  findByUser,
  update,
} from "../repositories/settings.repository.js";

/**
 * Create default settings for a newly registered user.
 */
export async function initializeUserSettings(userId) {
  return create(userId);
}

/**
 * Return a user's settings.
 */
export async function getUserSettings(userId) {
  return findByUser(userId);
}

/**
 * Update user settings.
 */
export async function updateUserSettings(userId, data) {
  return update(userId, data);
}
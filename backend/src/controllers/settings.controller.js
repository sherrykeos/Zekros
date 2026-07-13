import * as settingsService from "../services/settings.service.js";

/**
 * GET /users/:userId/settings
 */
export async function getUserSettings(req, res, next) {
  try {
    const { userId } = req.params;

    const settings = await settingsService.getUserSettings(userId);

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /users/:userId/settings
 */
export async function updateUserSettings(req, res, next) {
  try {
    const { userId } = req.params;

    const settings = await settingsService.updateUserSettings(
      userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}
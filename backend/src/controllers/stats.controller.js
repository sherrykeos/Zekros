import * as statsService from "../services/stats.service.js";

/**
 * GET /users/:userId/stats
 */
export async function getUserStats(req, res, next) {
  try {
    const { userId } = req.params;

    const stats = await statsService.getUserStats(userId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Stats not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
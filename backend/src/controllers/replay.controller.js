import * as matchService from "../services/match.service.js";

/**
 * GET /matches/:matchId/replay
 */
export async function getReplay(req, res, next) {
  try {
    const { matchId } = req.params;

    const replay = await matchService.getReplay(matchId);

    if (!replay) {
      return res.status(404).json({
        success: false,
        message: "Match not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: replay,
    });
  } catch (error) {
    next(error);
  }
}
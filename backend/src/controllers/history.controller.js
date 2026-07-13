import * as matchService from "../services/match.service.js";

/**
 * GET /matches/:matchId/history
 */
export async function getMatchHistory(req, res, next) {
  try {
    const { matchId } = req.params;

    const history = await matchService.getHistory(matchId);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Match not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
}
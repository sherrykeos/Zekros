import MatchManager from "../managers/MatchManager.js";
import RoomManager from "../managers/RoomManager.js";

/**
 * Handles match-related requests.
 */
class MatchController {
    /**
     * Gets a match by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async getMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = MatchManager.getMatch(matchId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Creates a new match in the same room without mutating prior history.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async createRematch(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = await RoomManager.createRematch(matchId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error.code === 'ROOM_NOT_FOUND' || result.error.code === 'MATCH_NOT_FOUND' ? 404 : 400;
                res.status(statusCode).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gets the history of a match.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async getHistory(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = await MatchManager.getHistory(matchId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Deletes a match by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async deleteMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const userId = req.user?.id || req.query.userId || req.body?.userId || null;
            const result = await MatchManager.deleteMatch(matchId, userId ? String(userId) : null);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Purges all matches with result = null from the database.
     */
    static async cleanupUnfinishedMatches(req, res, next) {
        try {
            const result = await MatchManager.cleanupUnfinishedMatches();
            res.status(200).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Lists stored match history from DB.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async listMatches(req, res, next) {
        try {
            const { userId, limit } = req.query;
            const result = await MatchManager.listMatches({ userId: userId ? String(userId) : undefined, limit: limit ? Number(limit) : 50 });
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gets the replay data for a match.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async getReplayData(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = await MatchManager.getReplayData(matchId);
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            next(error);
        }
    }
}

export default MatchController;
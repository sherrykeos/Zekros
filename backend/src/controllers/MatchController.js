import MatchManager from "../managers/MatchManager.js";

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
     * Restarts a match.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async restartMatch(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = await MatchManager.restartMatch(matchId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error.code === 'NOT_FOUND' ? 404 : 400;
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
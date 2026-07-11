const GameManager = require('../managers/GameManager');
const MatchManager = require('../managers/MatchManager');
const RoomManager = require('../managers/RoomManager');

class GameController {
    static async makeMove(req, res, next) {
        try {
            const { matchId } = req.params;
            const { playerId, move, roomCode } = req.body;
            const result = RoomManager.makeMove({ matchId, playerId, move, roomCode });

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = GameController.getMoveStatusCode(result.error.code);
                res.status(statusCode).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    static async getGameState(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = GameManager.getGame(matchId);

            if (result.success) {
                res.status(200).json({ ...result, data: result.data.getState() });
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    static async resetGame(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = MatchManager.restartMatch(matchId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error.code === 'MATCH_NOT_FOUND' || result.error.code === 'GAME_NOT_FOUND' ? 404 : 400;
                res.status(statusCode).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    static getMoveStatusCode(code) {
        if (code === 'ROOM_NOT_FOUND' || code === 'MATCH_NOT_FOUND' || code === 'GAME_NOT_FOUND') {
            return 404;
        }

        if (code === 'NOT_PLAYER_TURN' || code === 'PLAYER_NOT_IN_MATCH') {
            return 403;
        }

        if (code === 'MATCH_FINISHED') {
            return 409;
        }

        return 400;
    }
}

module.exports = GameController;

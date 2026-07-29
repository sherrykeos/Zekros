import GameManager from "../managers/GameManager.js";
import RoomManager from "../managers/RoomManager.js";
import MatchManager from "../managers/MatchManager.js";

class GameController {
    static async makeMove(req, res, next) {
        try {
            const { matchId } = req.params;
            const { playerId, move, roomCode } = req.body;
            const result = await RoomManager.makeMove({ matchId, playerId, move, roomCode });

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
            const matchResult = MatchManager.getMatch(matchId);

            if (matchResult.success) {
                const match = matchResult.data;
                const matchState = match.getState();
                const responseData = {
                    ...matchState.game,
                    match: matchState
                };
                res.status(200).json({ success: true, data: responseData });
            } else {
                res.status(404).json(matchResult);
            }
        } catch (error) {
            next(error);
        }
    }

    static async resetGame(req, res, next) {
        try {
            const { matchId } = req.params;
            const result = await RoomManager.createRematch(matchId);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error.code === 'MATCH_NOT_FOUND' || result.error.code === 'ROOM_NOT_FOUND' ? 404 : 400;
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

export default GameController;

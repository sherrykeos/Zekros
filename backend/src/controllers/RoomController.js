const RoomManager = require('../managers/RoomManager');

/**
 * Handles room-related requests.
 */
class RoomController {
    /**
     * Creates a new room.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async createRoom(req, res, next) {
        try {
            const { roomOptions } = req.body;
            const result = await RoomManager.createRoom(roomOptions);

            if (result.success) {
                res.status(201).json(result);
            } else {
                // Assuming validation errors or other creation issues result in 400
                res.status(400).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Gets a room by its ID.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async getRoom(req, res, next) {
        try {
            const { roomId } = req.params;
            const result = await RoomManager.getRoom(roomId);

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
     * Joins a player to a room.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async joinRoom(req, res, next) {
        try {
            const { roomId } = req.params;
            const { playerInfo } = req.body;
            const result = await RoomManager.joinRoom(roomId, playerInfo);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error.code === 'ROOM_FULL' || result.error.code === 'PLAYER_ALREADY_JOINED'
                    ? 409
                    : result.error.code === 'NOT_FOUND'
                    ? 404
                    : 400;
                res.status(statusCode).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Removes a player from a room.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async leaveRoom(req, res, next) {
        try {
            const { roomId } = req.params;
            const { playerId } = req.body;
            const result = await RoomManager.leaveRoom(roomId, playerId);

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
     * Closes a room.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async closeRoom(req, res, next) {
        try {
            const { roomId } = req.params;
            const result = await RoomManager.closeRoom(roomId);

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
     * Starts a match in a room.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async startMatch(req, res, next) {
        try {
            const { roomId } = req.params;
            const { config, metadata } = req.body; // Extract config from the body
            const result = await RoomManager.startMatch(roomId, config, metadata);

            if (result.success) {
                res.status(200).json(result);
            } else {
                const statusCode = result.error.code === 'NOT_ENOUGH_PLAYERS' || result.error.code === 'MATCH_ALREADY_RUNNING'
                    ? 409
                    : result.error.code === 'NOT_FOUND'
                    ? 404
                    : 400;
                res.status(statusCode).json(result);
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * Ends a match in a room.
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @param {import('express').NextFunction} next - The Express next middleware function.
     */
    static async endMatch(req, res, next) {
        try {
            const { roomId } = req.params;
            const result = await RoomManager.endMatch(roomId);

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

module.exports = RoomController;

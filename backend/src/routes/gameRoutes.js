import express from "express";
import GameController from "../controllers/GameController.js";

const router = express.Router();

// POST /games/:matchId/move
router.post('/:matchId/move', GameController.makeMove);

// GET /games/:matchId/state
router.get('/:matchId/state', GameController.getGameState);

// POST /games/:matchId/reset
router.post('/:matchId/reset', GameController.resetGame);

export default router;
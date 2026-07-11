import express from "express";
import MatchController from "../controllers/MatchController.js";

const router = express.Router();

// GET /matches/:matchId
router.get('/:matchId', MatchController.getMatch);

// POST /matches/:matchId/restart
router.post('/:matchId/restart', MatchController.restartMatch);

// GET /matches/:matchId/history
router.get('/:matchId/history', MatchController.getHistory);

// GET /matches/:matchId/replay
router.get('/:matchId/replay', MatchController.getReplayData);

export default router;
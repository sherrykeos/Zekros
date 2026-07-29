import express from "express";
import MatchController from "../controllers/MatchController.js";
import { optionalAuthenticate } from "../auth/auth.middleware.js";

const router = express.Router();

// GET /matches
router.get('/', MatchController.listMatches);

// GET /matches/:matchId
router.get('/:matchId', MatchController.getMatch);

// POST /matches/:matchId/rematch
router.post('/:matchId/rematch', MatchController.createRematch);

// Compatibility alias: restart now creates a rematch instead of reusing a Match.
router.post('/:matchId/restart', MatchController.createRematch);

// GET /matches/:matchId/history
router.get('/:matchId/history', MatchController.getHistory);

// GET /matches/:matchId/replay
router.get('/:matchId/replay', MatchController.getReplayData);

// DELETE /matches/cleanup/unfinished
router.delete('/cleanup/unfinished', MatchController.cleanupUnfinishedMatches);

// DELETE /matches/:matchId
router.delete('/:matchId', optionalAuthenticate, MatchController.deleteMatch);

export default router;
const express = require('express');
const GameController = require('../controllers/GameController');

const router = express.Router();

// POST /games/:matchId/move
router.post('/:matchId/move', GameController.makeMove);

// GET /games/:matchId/state
router.get('/:matchId/state', GameController.getGameState);

// POST /games/:matchId/reset
router.post('/:matchId/reset', GameController.resetGame);

module.exports = router;
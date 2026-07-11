const express = require('express');
const roomRoutes = require('./roomRoutes');
const matchRoutes = require('./matchRoutes');
const gameRoutes = require('./gameRoutes');

const router = express.Router();

// Mount resource-specific routes
router.use('/rooms', roomRoutes);
router.use('/matches', matchRoutes);
router.use('/games', gameRoutes);

module.exports = router;
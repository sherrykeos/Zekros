import express from "express";
import roomRoutes from "../routes/roomRoutes.js";
import matchRoutes from "../routes/matchRoutes.js";
import gameRoutes from "../routes/gameRoutes.js";

const router = express.Router();

// Mount resource-specific routes
router.use('/rooms', roomRoutes);
router.use('/matches', matchRoutes);
router.use('/games', gameRoutes);

export default router;
import prisma from "../lib/prisma.js";
import express from "express";

import roomRoutes from "./roomRoutes.js";
import matchRoutes from "./matchRoutes.js";
import gameRoutes from "./gameRoutes.js";

import authRoutes from "../auth/auth.route.js";

const router = express.Router();

/**
 * ---------------------------------------------------------
 * API Health Check
 * ---------------------------------------------------------
 * Used to verify that the backend is running.
 *
 * GET /api/health
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
    uptime: process.uptime()/60, // Uptime in minutes
    timestamp: new Date().toISOString(),
  });
});

/**
 * ---------------------------------------------------------
 * Room Routes
 * ---------------------------------------------------------
 * Handles room creation, joining, leaving,
 * starting matches and closing rooms.
 *
 * Base URL:
 * /api/rooms
 */
router.use("/rooms", roomRoutes);

/**
 * ---------------------------------------------------------
 * Match Routes
 * ---------------------------------------------------------
 * Handles match information,
 * replay and move history.
 *
 * Base URL:
 * /api/matches
 */
router.use("/matches", matchRoutes);

/**
 * ---------------------------------------------------------
 * Game Routes
 * ---------------------------------------------------------
 * Handles gameplay actions.
 *
 * Base URL:
 * /api/games
 */
router.use("/games", gameRoutes);


//auth routes
router.use("/auth", authRoutes);



export default router;




router.get("/db-test", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      success: true,
      users,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
import express from "express";
import RoomController from "../controllers/RoomController.js";

const router = express.Router();

// POST /rooms
router.post('/', RoomController.createRoom);

// GET /rooms/:roomId
router.get('/:roomId', RoomController.getRoom);

// POST /rooms/:roomId/join
router.post('/:roomId/join', RoomController.joinRoom);

// POST /rooms/:roomId/leave
router.post('/:roomId/leave', RoomController.leaveRoom);

// POST /rooms/:roomId/start
router.post('/:roomId/start', RoomController.startMatch);

// POST /rooms/:roomId/end
router.post('/:roomId/end', RoomController.endMatch);

// DELETE /rooms/:roomId
router.delete('/:roomId', RoomController.closeRoom);

export default router;
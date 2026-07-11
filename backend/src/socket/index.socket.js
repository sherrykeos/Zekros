import { Server } from "socket.io";
import registerConnectionEvents from "./events/connectionEvents.js";
import registerRoomEvents from "./events/roomEvents.js";
import registerGameEvents from "./events/gameEvents.js";
import socketAuth from "./middleware/socketAuth.js";

/**
 * Initializes Socket.IO alongside the existing HTTP server.
 *
 * @param {import("http").Server} httpServer Existing Node HTTP server.
 * @returns {import("socket.io").Server} Configured Socket.IO server instance.
 */
function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    registerConnectionEvents(io, socket);
    registerRoomEvents(io, socket);
    registerGameEvents(io, socket);
  });

  return io;
}

export default initializeSocket;

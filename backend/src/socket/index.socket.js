const registerConnectionEvents = require("./events/connectionEvents");
const registerRoomEvents = require("./events/roomEvents");
const registerGameEvents = require("./events/gameEvents");
const socketAuth = require("./middleware/socketAuth");

/**
 * Initializes Socket.IO alongside the existing HTTP server.
 *
 * @param {import("http").Server} httpServer Existing Node HTTP server.
 * @returns {import("socket.io").Server} Configured Socket.IO server instance.
 */
function initializeSocket(httpServer) {
  const { Server } = require("socket.io");
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

module.exports = initializeSocket;

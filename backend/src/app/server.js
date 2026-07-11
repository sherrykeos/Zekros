const http = require("http");
const app = require("./app");
const initializeSocket = require("../socket/index.socket");

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);



try {
  initializeSocket(httpServer);
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") {
    throw error;
  }

  console.warn("Socket.IO not initialized. Install the socket.io package to enable sockets.");
}

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import http from "http";
import app from "./app.js";
import initializeSocket from "../socket/index.socket.js";
import { cleanupUnfinishedMatches } from "../services/match.service.js";

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
  cleanupUnfinishedMatches()
    .then((res) => {
      if (res?.count) {
        console.log(`Cleaned up ${res.count} unfinished match(es) with null result from DB.`);
      }
    })
    .catch((err) => console.error("Unfinished match cleanup failed:", err));
});

import { verifyAccessToken } from "../../services/jwt.service.js";
import { findUserById } from "../../auth/auth.repository.js";

function getToken(socket) {
  const authToken = socket.handshake?.auth?.token ?? socket.handshake?.query?.token;
  const authorization = socket.handshake?.headers?.authorization;

  if (authToken) {
    return authToken;
  }

  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length);
  }

  return null;
}

/**
 * Optional Socket.IO authentication middleware.
 * Authenticated sockets carry user context; anonymous sockets continue as guests.
 *
 * @param {import("socket.io").Socket} socket Connected client socket.
 * @param {(err?: Error) => void} next Middleware continuation callback.
 */
async function socketAuth(socket, next) {
  try {
    const token = getToken(socket);

    socket.data = {
      ...(socket.data ?? {}),
      isAuthenticated: false,
      user: null,
    };

    if (!token) {
      next();
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.userId);

    if (user) {
      socket.data.isAuthenticated = true;
      socket.data.user = user;
      socket.data.userId = user.id;
    }

    next();
  } catch {
    socket.data = {
      ...(socket.data ?? {}),
      isAuthenticated: false,
      user: null,
    };
    next();
  }
}

export default socketAuth;
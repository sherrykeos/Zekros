/**
 * Placeholder Socket.IO authentication middleware.
 *
 * @param {import("socket.io").Socket} socket Connected client socket.
 * @param {(err?: Error) => void} next Middleware continuation callback.
 */
function socketAuth(socket, next) {
  next();
}

module.exports = socketAuth;

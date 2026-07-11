import { verifyAccessToken } from "../services/jwt.service.js";
import { findUserById } from "../auth/auth.repository.js";

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authorization.split(" ")[1];

    const payload = verifyAccessToken(token);

    const user = await findUserById(payload.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    req.user = user;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }
}

export default authenticate;
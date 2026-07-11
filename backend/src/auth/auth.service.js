import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  createVerificationToken,
  findVerificationToken,
  deleteVerificationToken,
  verifyUserEmail,
  createSession,
  findSessionById,
  deleteSession,
  updateSession,
  createPasswordResetToken,
  findPasswordResetToken,
  deletePasswordResetToken,
  updateUserPassword,
  deleteAllUserSessions,
  findUserByProviderId,
  createGoogleUser,
  linkGoogleAccount,
  findUserById,
} from "./auth.repository.js";

import { createId } from "@paralleldrive/cuid2";

import {
  hashPassword,
  comparePassword,
} from "../services/password.service.js";
import { generateToken, hashToken } from "../services/token.service.js";
import { sendEmail } from "../services/email.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/jwt.service.js";
import { setRefreshTokenCookie } from "../services/cookie.service.js";
import { app } from "../config/app.config.js";
import auth from "../config/auth.config.js";

import createVerificationEmail from "../templates/email/verify-email.js";
import createResetPasswordEmail from "../templates/email/reset-password.js";




function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function register(data) {
  const { username, email, password } = data;

  /* ------------------------------------------------------- */
  /* Check Email */
  /* ------------------------------------------------------- */

  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw createError("Email already exists.", 409);
  }

  /* ------------------------------------------------------- */
  /* Check Username */
  /* ------------------------------------------------------- */

  const existingUsername = await findUserByUsername(username);

  if (existingUsername) {
    throw createError("Username already exists.", 409);
  }

  /* ------------------------------------------------------- */
  /* Hash Password */
  /* ------------------------------------------------------- */

  const passwordHash = await hashPassword(password);

  /* ------------------------------------------------------- */
  /* Create User */
  /* ------------------------------------------------------- */

  const user = await createUser({
    username,
    email,
    passwordHash,
  });

  /* ------------------------------------------------------- */
  /* Verification Token */
  /* ------------------------------------------------------- */

  const verificationToken = generateToken(auth.verificationToken.bytes);

  const verificationTokenHash = hashToken(verificationToken);

  const expiresAt = new Date(
    Date.now() + auth.verificationToken.expiresInMinutes * 60 * 1000,
  );

  await createVerificationToken(user.id, verificationTokenHash, expiresAt);

  /* ------------------------------------------------------- */
  /* Verification Link */
  /* ------------------------------------------------------- */

  const verificationUrl = `${app.frontendUrl}/auth/verify?token=${verificationToken}`;

  /* ------------------------------------------------------- */
  /* Send Email */
  /* ------------------------------------------------------- */

  await sendEmail({
    to: user.email,
    subject: `Verify your ${app.name} account`,
    html: createVerificationEmail({
      username: user.username,
      verificationUrl,
    }),
  });

  /* ------------------------------------------------------- */

  return {
    success: true,
    message: "Registration successful. Please verify your email.",
  };
}

async function verifyEmail(token) {
  if (!token) {
    throw createError("Verification token is required.", 400);
  }

  const tokenHash = hashToken(token);

  const verification = await findVerificationToken(tokenHash);

  if (!verification) {
    throw createError("Invalid verification link.", 400);
  }

  if (verification.expiresAt < new Date()) {
    await deleteVerificationToken(verification.id);

    throw createError("Verification link has expired.", 400);
  }

  await verifyUserEmail(verification.user.id);

  await deleteVerificationToken(verification.id);

  return {
    success: true,
    message: "Email verified successfully.",
  };
}

async function createUserSession(user, res) {
  const sessionExpiresAt = new Date(
    Date.now() + auth.session.expiresInDays * 24 * 60 * 60 * 1000,
  );

  const sessionId = createId();

  const accessToken = generateAccessToken({
    userId: user.id,
    sessionId,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    sessionId,
  });

  const refreshTokenHash = hashToken(refreshToken);

  await createSession({
    id: sessionId,
    userId: user.id,
    refreshTokenHash,
    expiresAt: sessionExpiresAt,
  });

  setRefreshTokenCookie(res, refreshToken);

  return {
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  };
}

async function login(data, res) {
  const { email, password } = data;

  /* -------------------------------------------------------------------------- */
  /* Find User                                                                   */
  /* -------------------------------------------------------------------------- */

  const user = await findUserByEmail(email);
  // console.log(user);

  if (!user) {
    throw createError("Invalid email or password.", 401);
  }

  /* -------------------------------------------------------------------------- */
  /* Compare Password                                                            */
  /* -------------------------------------------------------------------------- */

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createError("Invalid email or password.", 401);
  }

  /* -------------------------------------------------------------------------- */
  /* Email Verification                                                          */
  /* -------------------------------------------------------------------------- */

  if (!user.isEmailVerified) {
    throw createError("Please verify your email before logging in.", 403);
  }

  /* -------------------------------------------------------------------------- */
  /* Session Expiry                                                              */
  /* -------------------------------------------------------------------------- */

  const sessionExpiresAt = new Date(
    Date.now() + auth.session.expiresInDays * 24 * 60 * 60 * 1000,
  );
  const sessionId = createId();

  /* -------------------------------------------------------------------------- */
  /* Generate JWTs                                                               */
  /* -------------------------------------------------------------------------- */

  const accessToken = generateAccessToken({
    userId: user.id,
    sessionId,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    sessionId,
  });

  /* -------------------------------------------------------------------------- */
  /* Create Session                                                              */
  /* -------------------------------------------------------------------------- */
  const refreshTokenHash = hashToken(refreshToken);

  await createSession({
    id: sessionId,
    userId: user.id,
    refreshTokenHash,
    expiresAt: sessionExpiresAt,
  });

  /* -------------------------------------------------------------------------- */
  /* Set Refresh Cookie                                                          */
  /* -------------------------------------------------------------------------- */

  setRefreshTokenCookie(res, refreshToken);

  /* -------------------------------------------------------------------------- */
  /* Response                                                                    */
  /* -------------------------------------------------------------------------- */

  return {
    success: true,
    message: "Logged in successfully.",
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
  };
}

async function refresh(refreshToken, res) {
  /* -------------------------------------------------------------------------- */
  /* Cookie Exists                                                               */
  /* -------------------------------------------------------------------------- */

  if (!refreshToken) {
    throw createError("Refresh token is missing.", 401);
  }

  /* -------------------------------------------------------------------------- */
  /* Verify JWT                                                                  */
  /* -------------------------------------------------------------------------- */

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw createError("Invalid refresh token.", 401);
  }

  /* -------------------------------------------------------------------------- */
  /* Find Session                                                                */
  /* -------------------------------------------------------------------------- */

  const session = await findSessionById(payload.sessionId);

  if (!session) {
    throw createError("Session not found.", 401);
  }

  /* -------------------------------------------------------------------------- */
  /* Session Expired                                                             */
  /* -------------------------------------------------------------------------- */

  if (session.expiresAt < new Date()) {
    throw createError("Session expired.", 401);
  }

  /* -------------------------------------------------------------------------- */
  /* Verify Refresh Token Hash                                                   */
  /* -------------------------------------------------------------------------- */

  const incomingRefreshTokenHash = hashToken(refreshToken);

  if (incomingRefreshTokenHash !== session.refreshTokenHash) {
    throw createError("Invalid refresh token.", 401);
  }

  /* -------------------------------------------------------------------------- */
  /* Generate New Tokens                                                         */
  /* -------------------------------------------------------------------------- */

  const accessToken = generateAccessToken({
    userId: payload.userId,
    sessionId: session.id,
  });

  const newRefreshToken = generateRefreshToken({
    userId: payload.userId,
    sessionId: session.id,
  });

  /* -------------------------------------------------------------------------- */
  /* Rotate Refresh Token                                                        */
  /* -------------------------------------------------------------------------- */

  const newRefreshTokenHash = hashToken(newRefreshToken);

  await updateSession(session.id, {
    refreshTokenHash: newRefreshTokenHash,
    lastUsedAt: new Date(),
  });

  /* -------------------------------------------------------------------------- */
  /* Update Cookie                                                               */
  /* -------------------------------------------------------------------------- */

  setRefreshTokenCookie(res, newRefreshToken);

  /* -------------------------------------------------------------------------- */

  return {
    success: true,
    accessToken,
  };
}

async function logout(refreshToken) {
  if (!refreshToken) {
    return {
      success: true,
      message: "Logged out successfully.",
    };
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const session = await findSessionById(payload.sessionId);

    if (session) {
      await deleteSession(session.id);
    }
  } catch (error) {
    // Ignore invalid or expired refresh token.
  }

  return {
    success: true,
    message: "Logged out successfully.",
  };
}

async function forgotPassword(data) {
  const { email } = data;

  const user = await findUserByEmail(email);

  // Never reveal whether the email exists
  if (!user) {
    return {
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
  }

  const resetToken = generateToken(auth.passwordResetToken.bytes);

  const resetTokenHash = hashToken(resetToken);

  const expiresAt = new Date(
    Date.now() + auth.passwordResetToken.expiresInMinutes * 60 * 1000,
  );

  await createPasswordResetToken(user.id, resetTokenHash, expiresAt);

  const resetUrl = `${app.frontendUrl}/auth/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: `Reset your ${app.name} password`,
    html: createResetPasswordEmail({
      username: user.username,
      resetUrl,
    }),
  });

  return {
    success: true,
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };
}

async function resetPassword(data) {
  const { token, password } = data;

  const tokenHash = hashToken(token);

  const resetToken = await findPasswordResetToken(tokenHash);

  if (!resetToken) {
    throw createError("Invalid password reset link.", 400);
  }

  if (resetToken.expiresAt < new Date()) {
    await deletePasswordResetToken(resetToken.id);

    throw createError("Password reset link has expired.", 400);
  }

  const passwordHash = await hashPassword(password);

  await updateUserPassword(resetToken.user.id, passwordHash);

  await deletePasswordResetToken(resetToken.id);

  await deleteAllUserSessions(resetToken.user.id);

  return {
    success: true,
    message: "Password reset successfully. Please sign in again.",
  };
}

async function googleLogin(profile, res) {
  let user = await findUserByProviderId(profile.id);

  if (!user) {
    user = await findUserByEmail(profile.emails[0].value.toLowerCase());
  }

  if (!user) {
    user = await createGoogleUser({
      username: profile.displayName.replace(/\s+/g, "").toLowerCase(),

      email: profile.emails[0].value.toLowerCase(),

      avatar: profile.photos?.[0]?.value,

      provider: "google",

      providerId: profile.id,

      isEmailVerified: true,

      emailVerifiedAt: new Date(),
    });
  } else if (!user.providerId) {
    user = await linkGoogleAccount(
      user.id,
      profile.id,
      profile.photos?.[0]?.value,
    );
  }

  return createUserSession(user, res);
}

async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw createError("User not found.", 404);
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    provider: user.provider,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

export {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  getCurrentUser,

};

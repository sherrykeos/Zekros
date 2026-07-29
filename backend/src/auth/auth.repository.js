import prisma from "../lib/prisma.js";

/* -------------------------------------------------------------------------- */
/*                                   Users                                    */
/* -------------------------------------------------------------------------- */

async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
}

async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
  });
}

async function createUser(userData) {
  return prisma.user.create({
    data: userData,
  });
}

async function verifyUserEmail(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                          Verification Tokens                               */
/* -------------------------------------------------------------------------- */

async function createVerificationToken(userId, tokenHash, expiresAt) {
  return prisma.verificationToken.upsert({
    where: {
      userId,
    },
    update: {
      tokenHash,
      expiresAt,
    },
    create: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}

async function findVerificationToken(tokenHash) {
  return prisma.verificationToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
}

async function deleteVerificationToken(id) {
  return prisma.verificationToken.delete({
    where: {
      id,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                                  Sessions                                  */
/* -------------------------------------------------------------------------- */

async function createSession(sessionData) {
  return prisma.session.create({
    data: sessionData,
  });
}

async function findSessionByRefreshTokenHash(refreshTokenHash) {
  return prisma.session.findUnique({
    where: {
      refreshTokenHash,
    },
    include: {
      user: true,
    },
  });
}

async function updateSession(id, data) {
  return prisma.session.update({
    where: {
      id,
    },
    data,
  });
}

async function deleteSession(id) {
  return prisma.session.delete({
    where: {
      id,
    },
  });
}

async function deleteAllUserSessions(userId) {
  return prisma.session.deleteMany({
    where: {
      userId,
    },
  });
}

async function deleteExpiredSessions() {
  return prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

async function findSessionById(id) {
  return prisma.session.findUnique({
    where: {
      id,
    },
  });
}

async function createPasswordResetToken(userId, tokenHash, expiresAt) {
  return prisma.passwordResetToken.upsert({
    where: {
      userId,
    },
    update: {
      tokenHash,
      expiresAt,
    },
    create: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}

async function findPasswordResetToken(tokenHash) {
  return prisma.passwordResetToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });
}

async function deletePasswordResetToken(id) {
  return prisma.passwordResetToken.delete({
    where: {
      id,
    },
  });
}

async function updateUserPassword(userId, passwordHash) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
    },
  });
}

async function findUserByProviderId(providerId) {
  return prisma.user.findFirst({
    where: {
      providerId,
    },
  });
}

async function deleteVerificationTokenByUserId(userId) {
  return prisma.verificationToken.deleteMany({
    where: {
      userId,
    },
  });
}

async function createGoogleUser(userData) {
  return prisma.user.create({
    data: userData,
  });
}

async function linkGoogleAccount(userId, providerId, avatar) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      provider: "GOOGLE",
      providerId,
      avatar,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
}

async function updateUser(userId, data) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
}

async function deleteUser(userId) {
  return prisma.$transaction(async (tx) => {
    // Nullify participant references to avoid foreign key violations
    await tx.participant.updateMany({
      where: {
        userId: userId,
      },
      data: {
        userId: null,
      },
    });

    // Delete associated settings, stats, ratings, and tokens
    await tx.userSettings.deleteMany({ where: { userId } });
    await tx.userStats.deleteMany({ where: { userId } });
    await tx.userRating.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.verificationToken.deleteMany({ where: { userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });

    // Finally delete the user
    return tx.user.delete({
      where: {
        id: userId,
      },
    });
  });
}
/* -------------------------------------------------------------------------- */

export {
  // Users
  findUserById,
  findUserByEmail,
  findUserByUsername,
  createUser,
  verifyUserEmail,
  updateUser,
  deleteUser,

  // Verification
  createVerificationToken,
  findVerificationToken,
  deleteVerificationToken,

  // Sessions
  createSession,
  findSessionByRefreshTokenHash,
  updateSession,
  deleteSession,
  deleteAllUserSessions,


  deleteExpiredSessions,
  findSessionById,

  createPasswordResetToken,
  findPasswordResetToken,
  deletePasswordResetToken,

  updateUserPassword,

  deleteVerificationTokenByUserId,

  findUserByProviderId,
  createGoogleUser,
  linkGoogleAccount,
};

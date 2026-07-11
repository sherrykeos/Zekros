module.exports = {
  verificationToken: {
    expiresInMinutes: 30,
    bytes: 32,
  },

  passwordResetToken: {
    expiresInMinutes: 30,
    bytes: 32,
  },

  session: {
    expiresInDays: 30,
  },

  accessToken: {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  },

  refreshToken: {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
};
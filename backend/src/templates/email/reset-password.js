const emailLayout = require("./layout");
const { app } = require("../../config/app.config");
const auth = require("../../config/auth.config");

function createResetPasswordEmail({
  username,
  resetUrl,
}) {
  return emailLayout({
    title: "Reset your password",

    heading: "Reset your password",

    content: `
      <p style="margin:0;">
        Hi <strong>${username}</strong>,
      </p>

      <p>
        We received a request to reset your password for your
        <strong>${app.name}</strong> account.
      </p>

      <p>
        Click the button below to choose a new password.
      </p>

      <p>
        This password reset link will expire in <strong>${auth.passwordResetToken.expiresInMinutes} minutes</strong>.
      </p>

      <p>
        If you didn't request a password reset, you can safely ignore this email.
        Your account will remain secure.
      </p>
    `,

    buttonText: "Reset Password",

    buttonUrl: resetUrl,

    footerText:
      `For security reasons, this link can only be used once and expires after ${auth.passwordResetToken.expiresInMinutes} minutes.`,
  });
}

module.exports = createResetPasswordEmail;
const emailLayout = require("./layout");
const { app } = require("../../config/app.config");
const auth = require("../../config/auth.config");

function createVerificationEmail({
  username,
  verificationUrl,
}) {
  return emailLayout({
    title: "Verify your email",
    heading: "Verify your email",

    content: `
      <p style="margin:0;">
        Hi <strong>${username}</strong>,
      </p>

      <p>
        Welcome to <strong>${app.name}</strong>.
      </p>

      <p>
        Please verify your email address to activate your account and start playing.
      </p>

      <p>
        This verification link will expire in <strong>${auth.verificationToken.expiresInMinutes} minutes</strong>.
      </p>
    `,

    buttonText: "Verify Email",

    buttonUrl: verificationUrl,

    footerText:
      `If you didn't create a ${app.name} account, you can safely ignore this email.`,
  });
}

module.exports = createVerificationEmail;
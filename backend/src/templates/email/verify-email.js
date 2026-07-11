import emailLayout from "./layout.js";
import { app } from "../../config/app.config.js";
import auth from "../../config/auth.config.js";

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

export default createVerificationEmail;
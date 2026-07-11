import { BrevoClient } from "@getbrevo/brevo";
import { app } from "../config/app.config.js";
import auth from "../config/auth.config.js";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function frontendUrl(path) {
  const baseUrl = (app.frontendUrl || "").replace(/\/$/, "");
  return `${baseUrl}${path}`;
}

async function sendVerificationEmail(email, username, token) {
  const verificationUrl = frontendUrl(`/auth/verify?token=${encodeURIComponent(token)}`);
  const safeUsername = escapeHtml(username);

  // Keep verification in the frontend so the backend only returns JSON for API clients.
  return brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: app.company,
      email: app.supportEmail,
    },
    to: [
      {
        email,
        name: username,
      },
    ],
    subject: `Verify your ${app.name} account`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Welcome to ${app.name}</h2>
        <p>Hi ${safeUsername},</p>
        <p>Please verify your email address to finish setting up your account.</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;background:#111827;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none">
            Verify Email
          </a>
        </p>
        <p>This link expires in ${auth.verificationToken.expiresInMinutes} minutes. If you did not create a ${app.name} account, you can ignore this email.</p>
      </div>
    `,
  });
}

export {
  sendVerificationEmail,
};

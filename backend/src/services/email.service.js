const { BrevoClient } = require("@getbrevo/brevo");
const { app } = require("../config/app.config");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

/**
 * Send Email
 */
async function sendEmail({ to, subject, html }) {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: app.name,
        email: app.supportEmail,
      },

      to: [
        {
          email: to,
        },
      ],

      subject,

      htmlContent: html,
    });
  } catch (error) {
    console.error("Brevo Email Error:", error);

    throw new Error("Failed to send email.");
  }
}

module.exports = {
  sendEmail,
};
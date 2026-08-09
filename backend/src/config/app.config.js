const configuredFrontend = process.env.FRONTEND_URL || "http://localhost:8080";
const primaryFrontendUrl = configuredFrontend
  .split(",")[0]
  .trim()
  .replace(/\/+$/, "");

const app = {
  name: "ZEKROS",
  company: "KEOS Labs",
  supportEmail: process.env.EMAIL_FROM,
  frontendUrl: primaryFrontendUrl,
};

/**
 * Returns environment-aware CORS options shared by Express and Socket.IO.
 */
function getCorsOptions() {
  const isDev = process.env.NODE_ENV === "development";
  const configuredOrigin = process.env.FRONTEND_URL || "http://localhost:8080";

  const allowedOrigins = configuredOrigin
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return {
    origin: isDev
      ? true
      : (origin, callback) => {
          if (!origin) {
            return callback(null, true);
          }
          const normalizedOrigin = origin.replace(/\/+$/, "");
          if (allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
          } else {
            callback(new Error("CORS policy violation: Origin not allowed"));
          }
        },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  };
}

export { app, getCorsOptions };
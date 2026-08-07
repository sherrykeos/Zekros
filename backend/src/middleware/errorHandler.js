/**
 * Global error handling middleware for Express.
 * Catches unexpected errors and formats them into a standardized JSON response.
 *
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Check if Zod validation error
  if (
    err?.name === "ZodError" ||
    Array.isArray(err?.issues) ||
    Array.isArray(err?.errors)
  ) {
    const issues = err.issues || err.errors || [];
    const firstIssueMsg = issues[0]?.message || "Validation failed.";
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: firstIssueMsg,
      },
    });
  }

  const statusCode = err?.statusCode || err?.status || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  if (!isClientError) {
    console.error(err?.stack || err);
  }

  let message = err?.message || "An unexpected error occurred on the server.";

  // If message is a raw JSON stringified array, extract the first message
  if (typeof message === "string" && message.startsWith("[")) {
    try {
      const parsed = JSON.parse(message);
      if (Array.isArray(parsed) && parsed[0]?.message) {
        message = parsed[0].message;
      }
    } catch (_) {}
  }

  const errorResponse = {
    success: false,
    error: {
      code:
        err?.code ||
        (statusCode === 401
          ? "UNAUTHORIZED"
          : statusCode === 404
          ? "NOT_FOUND"
          : "INTERNAL_SERVER_ERROR"),
      message,
    },
  };

  if (process.env.NODE_ENV === "development" && !isClientError) {
    errorResponse.error.stack = err.stack;
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
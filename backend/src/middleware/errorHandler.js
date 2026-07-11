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
    // Log the error for debugging purposes.
    // In a real application, this would use a proper logger (like Winston).
    console.error(err.stack);

    const errorResponse = {
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred on the server.',
        },
    };

    // In a development environment, include the stack trace for easier debugging.
    // Do NOT expose stack traces in production.
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = err.stack;
    }

    // If headers are already sent, delegate to the default Express error handler.
    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json(errorResponse);
};

export default errorHandler;
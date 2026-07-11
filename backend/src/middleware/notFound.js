/**
 * Middleware to handle requests for routes that do not exist.
 * Responds with a standardized 404 JSON error.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'The requested route does not exist.',
        },
    });
};

module.exports = notFound;
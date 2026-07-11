/**
 * @typedef {Object} ValidationError
 * @property {string} message - A human-readable error message.
 * @property {string} [field] - The field that failed validation.
 * @property {string} [location] - The location of the field (e.g., 'body', 'params', 'query').
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - True if validation passed, false otherwise.
 * @property {ValidationError[]} [errors] - An array of validation errors if isValid is false.
 */

/**
 * A function that validates an Express request.
 * @callback RequestValidator
 * @param {import('express').Request} req - The Express request object.
 * @returns {ValidationResult} The result of the validation.
 */

/**
 * Creates an Express middleware for request validation.
 * It takes a validator function which is responsible for checking the request
 * and returning a structured validation result.
 *
 * @param {RequestValidator} validator - The function that performs the validation logic.
 * @returns {import('express').RequestHandler} An Express middleware function.
 */
const validateRequest = (validator) => {
    return (req, res, next) => {
        const { isValid, errors } = validator(req);

        if (isValid) {
            return next();
        }

        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'The request did not pass validation.',
                details: errors || [],
            },
        });
    };
};

module.exports = validateRequest;
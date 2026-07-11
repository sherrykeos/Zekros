/**
 * Wraps successful manager results in one shape for future REST and sockets.
 *
 * @param {*} data Manager return payload.
 * @returns {{success: true, data: *, error: null}} Standard success response.
 */
function success(data = null) {
  return {
    success: true,
    data,
    error: null,
  };
}

/**
 * Wraps expected business failures without throwing runtime exceptions.
 *
 * @param {string} code Stable machine-readable error code.
 * @param {string} message Human-readable error message.
 * @returns {{success: false, data: null, error: {code: string, message: string}}} Standard failure response.
 */
function failure(code, message) {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  };
}

export {
  success,
  failure,
};

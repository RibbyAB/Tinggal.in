const { error } = require("../utils/apiResponse");

// 404 handler for unmatched routes.
function notFound(req, res, next) {
  error(res, { message: `Route not found: ${req.method} ${req.originalUrl}`, statusCode: 404 });
}

// Central error handler. Keeps stack traces and internals out of API
// responses (only logs them server-side) - never leak DB/JWT internals.
function errorHandler(err, req, res, next) {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? "Internal server error." : err.message || "Something went wrong.";

  return error(res, { message, statusCode, errors: err.errors || null });
}

module.exports = { notFound, errorHandler };

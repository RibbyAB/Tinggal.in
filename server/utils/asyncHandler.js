// Wraps an async controller so thrown errors are forwarded to Express's
// error-handling middleware instead of crashing the process or needing
// a try/catch in every single controller function.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

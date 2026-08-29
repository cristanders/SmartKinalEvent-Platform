/**
 * Centralized Security Error Handler Middleware
 * Intercepts uncaught operational and system errors, sanitizes error output,
 * and responds with uniform structured JSON payloads.
 */

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error details for server diagnostics
  console.error(`[Error ${statusCode}] ${req.method} ${req.originalUrl}:`, err.message);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected server error occurred",
    ...(isProduction ? {} : { stack: err.stack })
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};

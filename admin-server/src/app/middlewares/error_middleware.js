// Error handling middleware module - processes and formats error responses

const ERROR_ID_MAP = {
  ValidationError: "ERR_VALIDATION_001",
  NotFoundError: "ERR_NOT_FOUND_002",
  DuplicateError: "ERR_DUPLICATE_003",
  ServiceError: "ERR_SERVICE_004",
  AppError: "ERR_APP_005",
};

// Maps the error class name to a standardized error ID for client identification
const getErrorId = (err) => {
  const errorType = err.constructor.name;
  return ERROR_ID_MAP[errorType] || "ERR_UNKNOWN_999";
};

// Global Express error handler (requires exactly 4 parameters to be recognized)
// Ensures every error response follows the project requirements (id and message)
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const errorId = getErrorId(err);

  // Attach error to response object so the Pino logger middleware can record it
  res.err = err;

  res.status(status).json({
    id: errorId,
    message: message,
  });
};

module.exports = errorHandler;
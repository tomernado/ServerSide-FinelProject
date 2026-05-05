// Base application error class - foundation for all custom error types
// Provides consistent error handling with HTTP status codes

class AppError extends Error {
  constructor(message, status) {
    // Call the parent Error constructor to keep stack trace and native features
    super(message);
    this.status = status;
  }
}

module.exports = { AppError };
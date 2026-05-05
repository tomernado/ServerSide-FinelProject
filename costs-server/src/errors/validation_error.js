// Validation error module - handles request validation failures (HTTP 400)
// Used when input data fails schema validation or constraint checks

const { AppError } = require("./app_error");


class ValidationError extends AppError {
 
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

module.exports = { ValidationError };

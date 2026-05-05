// Duplicate error (409)
const { AppError } = require("./app_error");

class DuplicateError extends AppError {
  constructor(message) {
    super(message, 409);
    this.name = "DuplicateError";
  }
}

module.exports = { DuplicateError };

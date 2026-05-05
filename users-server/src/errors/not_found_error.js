// Not found error module - handles resource not found scenarios (HTTP 404)
// Used when a requested user, cost, log, or other resource does not exist

const { AppError } = require("./app_error");

class NotFoundError extends AppError {

  constructor(message) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

module.exports = { NotFoundError };

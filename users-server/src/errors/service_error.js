// Service error module - handles inter-service communication failures (HTTP 502/503)
// Used when dependent microservices are unavailable, timeout, or return errors

const { AppError } = require("./app_error");


class ServiceError extends AppError {
 
  constructor(message, status = 502) {
    super(message, status);
    this.name = "ServiceError";
  }
}

module.exports = { ServiceError };

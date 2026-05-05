// Environment configuration module for users-service
// Loads configuration from .env file and provides fallback defaults
// All microservices use this pattern for consistent configuration management

require("dotenv").config();


const env = {
  // Controls logging verbosity and error handling behavior
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: process.env.PORT || 3000,

  // Log level for Pino logger (debug, info, warn, error)
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/app",

  COSTS_SERVICE_URL:
    process.env.COSTS_SERVICE_URL || "http://localhost:4000/api",

  // Prevents hanging requests if costs-service is slow or unresponsive
  COSTS_SERVICE_TIMEOUT: process.env.COSTS_SERVICE_TIMEOUT || 3000,

  // Base URL for logging-service API calls
  LOGGING_SERVICE_URL:
    process.env.LOGGING_SERVICE_URL || "http://localhost:5000/api",

  LOGGING_SERVICE_TIMEOUT: process.env.LOGGING_SERVICE_TIMEOUT || 3000,
};

module.exports = env;

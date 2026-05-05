// Configuration module - loads and exports all environment settings
require("dotenv").config();

// Centralized environment configuration with safe defaults
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 4000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/app",
  
  // Users microservice communication settings
  USERS_SERVICE_URL: process.env.USERS_SERVICE_URL || "http://localhost:3000/api",
  USERS_SERVICE_TIMEOUT: Number(process.env.USERS_SERVICE_TIMEOUT) || 3000,
  
  // Logging microservice communication settings
  LOGGING_SERVICE_URL: process.env.LOGGING_SERVICE_URL || "http://localhost:5000/api",
  LOGGING_SERVICE_TIMEOUT: Number(process.env.LOGGING_SERVICE_TIMEOUT) || 3000,
};

module.exports = env;
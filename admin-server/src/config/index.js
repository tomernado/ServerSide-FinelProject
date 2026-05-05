// Environment configuration module - loads and exports application settings

require("dotenv").config();

// Centralized configuration for the Admin Aggregator Service
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 6000, // Admin usually runs on a different port
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/admin_db", // In case it has its own DB
  
  // Downstream Microservices URLs
  USERS_SERVICE_URL: process.env.USERS_SERVICE_URL || "http://localhost:3000/api",
  COSTS_SERVICE_URL: process.env.COSTS_SERVICE_URL || "http://localhost:4000/api",
  LOGGING_SERVICE_URL: process.env.LOGGING_SERVICE_URL || "http://localhost:5000/api",
  
  // Timeout for downstream requests
  SERVICE_TIMEOUT: Number(process.env.SERVICE_TIMEOUT) || 5000,
};

module.exports = env;
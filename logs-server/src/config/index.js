require("dotenv").config();

// Centralized environment configuration for the Logs Service
// Provides safe defaults for port 5000 and the MongoDB connection
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5000,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/app",
};

module.exports = env;
// Database connection module - manages MongoDB connection

// Import Mongoose ODM library
const mongoose = require("mongoose");
// Import database URI from configuration
const config = require("../config");
// Import logger for connection events
const { logger } = require("../logging");

/**
 * Establishes connection to MongoDB database
 * Logs success or exits on failure
 * @returns {Promise<void>} Resolves on connection, exits on error
 */
const connectDB = async function () {
  try {
    // Connect to MongoDB using URI from config
    await mongoose.connect(config.MONGO_URI);
    // Log successful connection
    logger.info("MongoDB connected");
  } catch (err) {
    // Log connection error
    logger.error("MongoDB connection error", err);
    // Exit process on failure
    process.exit(1);
  }
};

// Export connection function
module.exports = { connectDB };

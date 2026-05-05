// Database connection module - establishes MongoDB connection
const mongoose = require("mongoose");
const config = require("../config");
const { logger } = require("../logging");

const connectDB = async function () {
  try {
    await mongoose.connect(config.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error", err);
    process.exit(1);
  }
};

// Export database connection function for server startup
module.exports = { connectDB };

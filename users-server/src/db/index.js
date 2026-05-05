// Database connection module - manages MongoDB connections

const mongoose = require("mongoose");
const config = require("../config");
const { logger } = require("../logging");


const connectDB = async function () {
  try {
    // Connect to MongoDB using configured URI
    await mongoose.connect(config.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection error", err);
    process.exit(1);
  }
};

module.exports = { connectDB };

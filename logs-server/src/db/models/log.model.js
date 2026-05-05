// Log model module - Mongoose schema for application logs
// Defines structure for storing centralized logs from all services
const mongoose = require("mongoose");

// Schema for centralized application logs
const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: [true, "Field 'level' is required"],
      trim: true,
      enum: {
        values: ["info", "warn", "error", "debug"],
        message: "Field 'level' must be one of: info, warn, error, debug",
      },
    },
    message: {
      type: String,
      required: [true, "Field 'message' is required"],
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true, // Crucial for querying logs by date range efficiently
    },
    method: { type: String, trim: true },
    url: { type: String, trim: true },
    statusCode: { type: Number },
    responseTime: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", logSchema);
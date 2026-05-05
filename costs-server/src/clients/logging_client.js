// Logging service client module - handles communication with external logging service

const axios = require("axios");
const config = require("../config");

/**
 * Sends log data to external logging service via HTTP POST
 * Handles network errors gracefully without throwing
 */
const sendLogToService = async function (logData) {
  if (!config.LOGGING_SERVICE_URL) {
    return;
  }

  try {
    await axios.post(`${config.LOGGING_SERVICE_URL}/logs`, logData, {
      timeout: config.LOGGING_SERVICE_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to send log to logging service:", error.message);
  }
};

/**
 * Creates and sends a log entry to the logging service
 * Wraps log data and sends asynchronously
 */
const createLog = function (logData) {
  sendLogToService({
    ...logData,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  createLog,
};

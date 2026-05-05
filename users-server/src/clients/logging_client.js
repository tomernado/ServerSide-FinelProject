// Logging service client module - handles communication with external logging service
const axios = require("axios");
const config = require("../config");

const sendLogToService = async function (logData) {
  // Check if logging service URL is configured
  if (!config.LOGGING_SERVICE_URL) {
    return;
  }

  try {
    // Send POST request to logging service endpoint
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
  // Invoke async send function without awaiting to avoid blocking
  sendLogToService({
    ...logData,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  createLog,
};

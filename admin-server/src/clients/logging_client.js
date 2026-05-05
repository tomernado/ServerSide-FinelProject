// Logging service client module - handles communication with external logging service
const axios = require("axios");
const config = require("../config");

// Asynchronously sends log data to the centralized logging microservice
const sendLogToService = async (logData) => {
  if (!config.LOGGING_SERVICE_URL) return;

  try {
    await axios.post(`${config.LOGGING_SERVICE_URL}/logs`, logData, {
      timeout: config.LOGGING_SERVICE_TIMEOUT || 3000,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Silent failure (Graceful Degradation): We don't crash the host service if logging fails
    console.error("Failed to send log to logging service:", error.message);
  }
};

// Wrapper implementing the "Fire and Forget" pattern
const createLog = (logData) => {
  // Intentionally NOT awaiting to prevent blocking the Event Loop
  sendLogToService({
    ...logData,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  createLog,
};
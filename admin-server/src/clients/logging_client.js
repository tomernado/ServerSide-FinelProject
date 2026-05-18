// Logging service client module - handles communication with external logging service
const axios = require("axios");
const pino = require("pino");
const config = require("../config");

/*
 * Dedicated minimal logger for this client only — avoids circular dependency.
 * logging/index.js → logging_client.js, so we cannot import from ../logging here.
 * This instance writes directly to stderr with no custom stream.
 */
const internalLogger = pino({ level: "error" }, process.stderr);

// Graceful degradation: logging failure must never crash the host service
const sendLogToService = async (logData) => {
  if (!config.LOGGING_SERVICE_URL) return;

  try {
    await axios.post(`${config.LOGGING_SERVICE_URL}/logs`, logData, {
      timeout: config.LOGGING_SERVICE_TIMEOUT || 3000,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    internalLogger.error({ error: error.message }, "Failed to send log to logging service");
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
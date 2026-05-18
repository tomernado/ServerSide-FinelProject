const axios = require("axios");
const pino = require("pino");
const config = require("../config");

/*
 * Dedicated minimal logger for this client only — avoids circular dependency.
 * logging/index.js → logging_client.js, so we cannot import from ../logging here.
 */
const internalLogger = pino({ level: "error" }, process.stderr);

const sendLogToService = async (logData) => {
  if (!config.LOGGING_SERVICE_URL) {
    return;
  }

  try {
    await axios.post(`${config.LOGGING_SERVICE_URL}/logs`, logData, {
      timeout: config.LOGGING_SERVICE_TIMEOUT,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    internalLogger.error({ error: error.message }, "Failed to send log to logging service");
  }
};

const createLog = (logData) => {
  sendLogToService({
    ...logData,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  createLog,
};

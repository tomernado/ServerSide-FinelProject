// Pino logger configuration with MongoDB stream
const pino = require("pino");
const loggingClient = require("../clients/logging_client");
// Import configuration for LOG_LEVEL setting
const config = require("../config");

// Map Pino numeric levels to string levels for database storage
const pinoLevelToString = {
  10: "debug", // trace
  20: "debug", // debug
  30: "info", // info
  40: "warn", // warn
  50: "error", // error
  60: "error", // fatal
};

// Custom stream to send logs to REST API via loggingClient
const customStream = {
  write: (msg) => {
    try {
      // Parse log message from pino (JSON string)
      const logObj = JSON.parse(msg);
      const level = pinoLevelToString[logObj.level] || "info";

      // Send to logging service with valid level
      loggingClient.createLog({
        level,
        message: logObj.msg,
        timestamp: new Date(logObj.time),
        method: logObj.req?.method,
        url: logObj.req?.url,
        statusCode: logObj.res?.statusCode,
        responseTime: logObj.responseTime,
      });
    } catch (err) {
      // Fallback: log error to console
      console.error("Failed to send log:", err.message);
    }
  },
};

const logger = pino(
  { level: config.LOG_LEVEL },
  pino.multistream([
    { level: config.LOG_LEVEL, stream: process.stdout },
    { level: config.LOG_LEVEL, stream: customStream },
  ])
);

module.exports = { logger };

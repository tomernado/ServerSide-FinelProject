// Logger configuration module - sets up Pino logging with custom streams
const pino = require("pino");
const loggingClient = require("../clients/logging_client");
const config = require("../config");

const pinoLevelToString = {
  10: "debug", // trace level (Pino 10)
  20: "debug", // debug level (Pino 20)
  30: "info", // info level (Pino 30)
  40: "warn", // warn level (Pino 40)
  50: "error", // error level (Pino 50)
  60: "error", // fatal level (Pino 60)
};

//Custom stream object for writing logs to external service
//Implements write(msg) interface for Pino streams
const customStream = {

  write: (msg) => {
    try {
      const logObj = JSON.parse(msg);
      const level = pinoLevelToString[logObj.level] || "info";

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

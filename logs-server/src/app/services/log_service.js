// Logs service - business logic layer
// Handles log validation, creation, and retrieval from database
const logsRepository = require("../repositories/logs_repository");
const { ValidationError } = require("../../errors/validation_error");
const Log = require("../../db/models/log.model");

// Validates incoming log data strictly against the Mongoose schema
const validateLogData = (data) => {
  const tempLog = new Log(data);
  const validationError = tempLog.validateSync();

  if (validationError) {
    const firstErrorKey = Object.keys(validationError.errors)[0];
    throw new ValidationError(validationError.errors[firstErrorKey].message);
  }

  return tempLog;
};

// Validates and persists a new log entry
const createLog = async (logData) => {
  const validatedLog = validateLogData(logData);

  // Directly pass to repository; errors bubble up naturally
  const log = await logsRepository.createLog({
    level: validatedLog.level,
    message: validatedLog.message,
    timestamp: validatedLog.timestamp || new Date(),
    method: validatedLog.method,
    url: validatedLog.url,
    statusCode: validatedLog.statusCode,
    responseTime: validatedLog.responseTime,
  });

  return {
    _id: log._id,
    level: log.level,
    message: log.message,
    timestamp: log.timestamp,
    method: log.method,
    url: log.url,
    statusCode: log.statusCode,
    responseTime: log.responseTime,
  };
};

// Retrieves and formats all logs (Consider pagination for production)
const getAllLogs = async () => {
  const logs = await logsRepository.findAllLogs();

  return logs.map((log) => ({
    _id: log._id,
    level: log.level,
    message: log.message,
    timestamp: log.timestamp,
    method: log.method,
    url: log.url,
    statusCode: log.statusCode,
    responseTime: log.responseTime,
  }));
};

module.exports = {
  createLog,
  getAllLogs,
};
// Logs service - business logic layer
const logsRepository = require("../repositories/logs_repository");

// Schema validation delegated to repository — service stays completely Mongoose-agnostic
const createLog = async (logData) => {
  const validatedLog = logsRepository.validateData(logData);

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
// Logs repository - database access layer for log management
// Handles all database operations for application logs
const Log = require("../../db/models/log.model");

/**
 * Creates a new log entry in the database
 * Stores log information including timestamp, level, and message
 */
const createLog = async function (logData) {
  const log = new Log(logData);
  return await log.save();
};

/**
 * Retrieves all logs from the database sorted by newest first
 */
const findAllLogs = async function () {
  return await Log.find().sort({ timestamp: -1 });
};

/**
 * Retrieves a specific log by its database ID
 */
const findLogById = async function (id) {
  return await Log.findById(id);
};

module.exports = {
  createLog,
  findAllLogs,
  findLogById,
};

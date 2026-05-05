// Logs controller module - handles HTTP requests for log retrieval and storage
const Log = require("../../db/models/log.model");

// Persists a new log entry to the database
const createLog = async (logData) => {
  const log = new Log(logData);
  return await log.save();
};

// Retrieves all logs sorted by newest first, using .lean() for high performance on large datasets
const findAllLogs = async () => {
  return await Log.find().sort({ timestamp: -1 }).lean();
};

// Retrieves a specific log by ID, using .lean() for read-only efficiency
const findLogById = async (id) => {
  return await Log.findById(id).lean();
};

module.exports = {
  createLog,
  findAllLogs,
  findLogById,
};
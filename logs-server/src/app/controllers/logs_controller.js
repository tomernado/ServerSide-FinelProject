// Logs controller - handles HTTP requests for log retrieval and creation
const logService = require("../services/log_service");

// Handles GET /api/logs - returns all stored log entries
const getLogs = async (req, res, next) => {
  try {
    const logs = await logService.getAllLogs();
    res.status(200).json(logs);
  } catch (err) {
    next(err);
  }
};

// Handles POST /api/logs - persists a new log entry from any microservice
const createLog = async (req, res, next) => {
  try {
    const log = await logService.createLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLogs,
  createLog,
};

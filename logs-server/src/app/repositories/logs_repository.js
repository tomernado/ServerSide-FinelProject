// Logs repository - database access layer for log management
const Log = require("../../db/models/log.model");
const { ValidationError } = require("../errors/validation_error");

// Validates log data against the Mongoose schema — keeps the service Mongoose-agnostic
const validateData = (data) => {
  const tempLog = new Log(data);
  const validationError = tempLog.validateSync();
  if (validationError) {
    const firstErrorKey = Object.keys(validationError.errors)[0];
    throw new ValidationError(validationError.errors[firstErrorKey].message);
  }
  return tempLog;
};

const createLog = async (logData) => {
  const log = new Log(logData);
  return await log.save();
};

const findAllLogs = async () => {
  return await Log.find().sort({ timestamp: -1 }).lean();
};

const findLogById = async (id) => {
  return await Log.findById(id).lean();
};

module.exports = {
  validateData,
  createLog,
  findAllLogs,
  findLogById,
};

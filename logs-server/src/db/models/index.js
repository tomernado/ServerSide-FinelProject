// Database models aggregation module - exports all Mongoose models for logs service
// Provides centralized access to Log model used throughout the application

const Log = require("./log.model");

module.exports = {
  Log,
};

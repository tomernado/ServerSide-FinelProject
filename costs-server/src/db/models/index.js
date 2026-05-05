// Database models aggregation module - exports all Mongoose models for costs service
// Provides centralized access to Cost and MonthlyReport models used throughout the application

const Cost = require("./cost.model");
const MonthlyReport = require("./monthlyReport.model");
const Log = require("./log.model");

module.exports = {
  Cost,
  MonthlyReport,
  Log,
};

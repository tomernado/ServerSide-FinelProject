// Database models aggregation module - exports all Mongoose models for costs service
const Cost = require("./cost.model");
const MonthlyReport = require("./monthlyReport.model");

module.exports = {
  Cost,
  MonthlyReport,
};

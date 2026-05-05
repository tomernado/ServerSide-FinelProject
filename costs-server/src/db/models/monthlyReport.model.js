// Monthly Report model module - Mongoose schema for cached monthly cost summaries
// Stores aggregated cost data by category for each month to improve query performance
const mongoose = require("mongoose");

// Schema for the Computed Pattern: Caches aggregated monthly reports
const monthlyReportSchema = new mongoose.Schema(
  {
    userid: { type: Number, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    costs: [
      {
        food: [{ sum: Number, description: String, day: Number }],
        education: [{ sum: Number, description: String, day: Number }],
        health: [{ sum: Number, description: String, day: Number }],
        housing: [{ sum: Number, description: String, day: Number }],
        sports: [{ sum: Number, description: String, day: Number }],
      },
    ],
  },
  { timestamps: true }
);

// Enforces uniqueness at the database level to prevent duplicate cached reports
monthlyReportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyReport", monthlyReportSchema);
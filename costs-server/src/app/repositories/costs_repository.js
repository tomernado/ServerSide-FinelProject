// Costs repository - database access layer for cost management
// Handles all database operations for costs and monthly reports
const Cost = require("../../db/models/cost.model");
const MonthlyReport = require("../../db/models/monthlyReport.model");

// Creates and persists a new cost entry to the database
const createCost = async (costData) => {
  const cost = new Cost(costData);
  return await cost.save();
};

// Retrieves all raw cost documents for a specific user
const findCostsByUserId = async (userid) => {
  return await Cost.find({ userid });
};

// Calculates the total sum of all costs for a user using MongoDB aggregation pipeline
const getCostsTotalByUserId = async (userid) => {
  const result = await Cost.aggregate([
    { $match: { userid: Number(userid) } },
    { $group: { _id: null, total: { $sum: "$sum" } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Attempts to retrieve a pre-calculated monthly report from the cache collection
const getMonthlyReportFromCache = async (userid, year, month) => {
  return await MonthlyReport.findOne({
    userid: Number(userid),
    year: Number(year),
    month: Number(month),
  });
};

// Fetches raw costs for a given month and groups them by category in memory
const getCostsByMonthAggregation = async (userid, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // Using .lean() for significant performance boost on read-only queries
  const costs = await Cost.find({
    userid: Number(userid),
    createdAt: { $gte: startDate, $lt: endDate },
  }).lean();

  const costsByCategory = { food: [], education: [], health: [], housing: [], sports: [] };

  // Group costs into their respective categories and extract the specific day
  costs.forEach((cost) => {
    const day = new Date(cost.createdAt).getDate();
    costsByCategory[cost.category].push({
      sum: cost.sum,
      description: cost.description,
      day,
    });
  });

  return [costsByCategory];
};

// Saves a calculated monthly report to the database for future O(1) retrieval
const cacheMonthlyReport = async (userid, year, month, data) => {
  return await MonthlyReport.create({
    userid: Number(userid),
    year: Number(year),
    month: Number(month),
    costs: data,
  });
};

module.exports = {
  createCost,
  findCostsByUserId,
  getCostsTotalByUserId,
  getMonthlyReportFromCache,
  getCostsByMonthAggregation,
  cacheMonthlyReport,
};
const Cost = require("../../db/models/cost.model");
const MonthlyReport = require("../../db/models/monthlyReport.model");
const { ValidationError } = require("../../errors/validation_error");
const { VALID_CATEGORIES } = require("../../config/cost_categories");

// Validates cost data against the Mongoose schema — keeps the service Mongoose-agnostic
const validateData = (data) => {
  const tempCost = new Cost(data);
  const validationError = tempCost.validateSync();
  if (validationError) {
    const firstErrorKey = Object.keys(validationError.errors)[0];
    throw new ValidationError(validationError.errors[firstErrorKey].message);
  }
  return tempCost;
};

const createCost = async (costData) => {
  const cost = new Cost(costData);
  return await cost.save();
};

const findCostsByUserId = async (userid) => {
  return await Cost.find({ userid });
};

const getCostsTotalByUserId = async (userid) => {
  const result = await Cost.aggregate([
    { $match: { userid: Number(userid) } },
    { $group: { _id: null, total: { $sum: "$sum" } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

const getMonthlyReportFromCache = async (userid, year, month) => {
  // .lean() avoids hydrating a full Mongoose document for what is a read-only cache retrieval
  return await MonthlyReport.findOne({
    userid: Number(userid),
    year: Number(year),
    month: Number(month),
  }).lean();
};

const getCostsByMonthAggregation = async (userid, year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // .lean() for significant performance boost — these documents are never mutated
  const costs = await Cost.find({
    userid: Number(userid),
    createdAt: { $gte: startDate, $lt: endDate },
  }).lean();

  // Seeded from the single source of truth so adding a category only requires updating COST_CATEGORIES
  const costsByCategory = Object.fromEntries(VALID_CATEGORIES.map((cat) => [cat, []]));

  costs.forEach((cost) => {
    const day = new Date(cost.createdAt).getDate();
    costsByCategory[cost.category].push({ sum: cost.sum, description: cost.description, day });
  });

  /*
   * Each category must be its own object in the array — not all inside one object.
   * Required shape: [{ food: [] }, { education: [] }, ...] per project spec.
   */
  return VALID_CATEGORIES.map((cat) => ({ [cat]: costsByCategory[cat] }));
};

const cacheMonthlyReport = async (userid, year, month, data) => {
  return await MonthlyReport.create({
    userid: Number(userid),
    year: Number(year),
    month: Number(month),
    costs: data,
  });
};

module.exports = {
  validateData,
  createCost,
  findCostsByUserId,
  getCostsTotalByUserId,
  getMonthlyReportFromCache,
  getCostsByMonthAggregation,
  cacheMonthlyReport,
};

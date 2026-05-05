// Costs controller module - handles HTTP requests for cost management endpoints
const costsService = require("../services/costs_service");

// Handles POST /api/add requests to create a new cost entry via req.body
const addCost = async (req, res, next) => {
  try {
    const cost = await costsService.createCost(req.body);
    res.status(201).json(cost);
  } catch (err) {
    next(err);
  }
};

// Handles GET /api/report requests using query parameters (id, year, month)
const getMonthlyReport = async (req, res, next) => {
  try {
    const report = await costsService.getMonthlyReport(req.query);
    res.status(200).json(report);
  } catch (err) {
    next(err);
  }
};

// Handles GET /api/user-total requests for inter-service communication
const getUserTotalCosts = async (req, res, next) => {
  try {
    const totalCosts = await costsService.getUserTotalCosts(req.query);
    res.status(200).json(totalCosts);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addCost,
  getMonthlyReport,
  getUserTotalCosts,
};
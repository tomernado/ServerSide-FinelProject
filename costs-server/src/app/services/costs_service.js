// Costs service - business logic layer
// Handles cost validation, processing, and monthly report generation with user verification
const costsRepository = require("../repositories/costs_repository");
const usersClient = require("../../clients/users_client");
const { logger } = require("../../logging");
const { ValidationError } = require("../../errors/validation_error");
const { NotFoundError } = require("../../errors/not_found_error");
const { ServiceError } = require("../../errors/service_error");
const Cost = require("../../db/models/cost.model");

// Validates cost schema and strictly verifies user existence via external service
const validateCostData = async (data) => {
  const tempCost = new Cost(data);
  const validationError = tempCost.validateSync();

  if (validationError) {
    const firstErrorKey = Object.keys(validationError.errors)[0];
    throw new ValidationError(validationError.errors[firstErrorKey].message);
  }

  try {
    const userExists = await usersClient.checkUserExists(data.userid);
    if (!userExists) {
      throw new ValidationError(`User with id ${data.userid} does not exist`);
    }
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    
    // Handle network/timeout errors from the Users microservice gracefully
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT" || error.response?.status >= 500) {
      logger.error({ userId: data.userid, error: error.message }, "Users service unavailable");
      throw new ServiceError("Users service unavailable", 503);
    } else if (error.response) {
      throw new ServiceError(`Users service error: ${error.response.statusText}`, 502);
    } else {
      throw new ServiceError("Failed to verify user existence", 502);
    }
  }

  return tempCost;
};

// Normalizes query parameters for the monthly report endpoint
const validateMonthlyReportParams = (params) => {
  const { id, year, month } = params;
  const userIdNum = Number(id);
  const yearNum = Number(year);
  const monthNum = Number(month);

  if (!id || isNaN(userIdNum)) throw new ValidationError("Field 'id' must be a valid number");
  if (!year || isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) throw new ValidationError("Field 'year' must be a valid year");
  if (!month || isNaN(monthNum) || monthNum < 1 || monthNum > 12) throw new ValidationError("Field 'month' must be between 1 and 12");

  return { userid: userIdNum, year: yearNum, month: monthNum };
};

// Persists a new cost entry after full validation and verification
const createCost = async (costData) => {
  const validatedCost = await validateCostData(costData);

  const cost = await costsRepository.createCost({
    description: validatedCost.description,
    category: validatedCost.category,
    userid: validatedCost.userid,
    sum: validatedCost.sum,
  });

  return {
    _id: cost._id,
    description: cost.description,
    category: cost.category,
    userid: cost.userid,
    sum: cost.sum,
    createdAt: cost.createdAt,
  };
};

// Orchestrates the Computed Pattern for monthly reports (Future/Current/Past caching)
const getMonthlyReport = async (params) => {
  const { userid, year, month } = validateMonthlyReportParams(params);

  try {
    const userExists = await usersClient.checkUserExists(userid);
    if (!userExists) throw new NotFoundError(`User with id ${userid} not found`);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new ServiceError("Failed to verify user existence or service unavailable", 502);
  }

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === (now.getMonth() + 1);
  const isInFuture = year > now.getFullYear() || (year === now.getFullYear() && month > (now.getMonth() + 1));
  const isInPast = year < now.getFullYear() || (year === now.getFullYear() && month < (now.getMonth() + 1));

  // Strategy 1: Future request - Return empty template structure
  if (isInFuture) {
    return { userid, year, month, costs: [{ food: [], education: [], health: [], housing: [], sports: [] }] };
  }

  // Strategy 2: Current month - Force real-time DB aggregation
  if (isCurrentMonth) {
    const report = await costsRepository.getCostsByMonthAggregation(userid, year, month);
    return { userid, year, month, costs: report };
  }

  // Strategy 3: Past month - Cache Aside implementation (Computed Pattern)
  if (isInPast) {
    const cachedReport = await costsRepository.getMonthlyReportFromCache(userid, year, month);
    if (cachedReport) return { userid, year, month, costs: cachedReport.costs };

    // Compute exactly once and cache it forever
    const report = await costsRepository.getCostsByMonthAggregation(userid, year, month);
    await costsRepository.cacheMonthlyReport(userid, year, month, report);
    
    return { userid, year, month, costs: report };
  }
};

// Calculates flat total costs across all times for the Users Service integration
const getUserTotalCosts = async (params) => {
  const userIdNum = Number(params.userId);
  if (!params.userId || isNaN(userIdNum)) throw new ValidationError("Field 'userId' must be a valid number");

  const total = await costsRepository.getCostsTotalByUserId(userIdNum);

  return {
    userid: userIdNum,
    total: total, // Fixed: Explicitly named 'total' to match costs_client.js
  };
};

module.exports = {
  createCost,
  getMonthlyReport,
  getUserTotalCosts,
};
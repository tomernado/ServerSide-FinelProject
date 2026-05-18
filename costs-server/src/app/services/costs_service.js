const costsRepository = require("../repositories/costs_repository");
const usersClient = require("../../clients/users_client");
const { logger } = require("../../logging");
const { ValidationError } = require("../../errors/validation_error");
const { NotFoundError } = require("../../errors/not_found_error");
const { ServiceError } = require("../../errors/service_error");
const { VALID_CATEGORIES } = require("../../config/cost_categories");

// Schema validation delegated to repository — service stays completely Mongoose-agnostic
const validateCostData = async (data) => {
  const validatedCost = costsRepository.validateData(data);

  try {
    const userExists = await usersClient.checkUserExists(validatedCost.userid);
    if (!userExists) {
      throw new ValidationError(`User with id ${validatedCost.userid} does not exist`);
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

  return validatedCost;
};

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

const createCost = async (costData) => {
  const validatedCost = await validateCostData(costData);

  const cost = await costsRepository.createCost({
    description: validatedCost.description,
    category: validatedCost.category,
    userid: validatedCost.userid,
    sum: validatedCost.sum,
    createdAt: validatedCost.createdAt, // Preserve the valid date passed by the client
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

  // Strategy 1: Future request — return empty template; no DB query needed
  if (isInFuture) {
    return {
      userid,
      year,
      month,
      costs: VALID_CATEGORIES.map((cat) => ({ [cat]: [] })),
    };
  }

  // Strategy 2: Current month — force real-time aggregation; no caching, data is still changing
  if (isCurrentMonth) {
    const report = await costsRepository.getCostsByMonthAggregation(userid, year, month);
    return { userid, year, month, costs: report };
  }

  // Strategy 3: Past month — Cache Aside implementation (Computed Pattern)
  if (isInPast) {
    const cachedReport = await costsRepository.getMonthlyReportFromCache(userid, year, month);
    if (cachedReport) return { userid, year, month, costs: cachedReport.costs };

    // Compute exactly once and cache it forever
    const report = await costsRepository.getCostsByMonthAggregation(userid, year, month);

    try {
      await costsRepository.cacheMonthlyReport(userid, year, month, report);
    } catch (cacheError) {
      // Duplicate key (11000) means a concurrent request already cached this month — safe to ignore
      if (cacheError.code !== 11000) throw cacheError;
    }

    return { userid, year, month, costs: report };
  }
};

const getUserTotalCosts = async (params) => {
  const userIdNum = Number(params.userId);
  if (!params.userId || isNaN(userIdNum)) throw new ValidationError("Field 'userId' must be a valid number");

  const total = await costsRepository.getCostsTotalByUserId(userIdNum);

  return { userid: userIdNum, total };
};

module.exports = {
  createCost,
  getMonthlyReport,
  getUserTotalCosts,
};

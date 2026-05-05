// Client for costs-service communication
const axios = require("axios");
const config = require("../config");
const { logger } = require("../logging");

// Client for inter-service communication with the Costs Service
// Fetches the aggregated total costs for a specific user
const getUserTotalCosts = async (userId) => {
  const url = `${config.COSTS_SERVICE_URL}/user-total`;

  try {
    // Axios GET request with a strict timeout to prevent cascading failures
    const response = await axios.get(url, {
      params: { userId },
      timeout: config.COSTS_SERVICE_TIMEOUT || 5000,
    });

    // Returns the 'total' field, defaulting to 0 if the user has no costs
    return response.data.total || 0;
  } catch (error) {
    // Log the failure to monitoring systems and bubble the error up to the service layer
    logger.error({ userId, error: error.message }, "Costs-service call failed");
    throw error;
  }
};

module.exports = {
  getUserTotalCosts,
};
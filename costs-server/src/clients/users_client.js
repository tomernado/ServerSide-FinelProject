// Client for users-service communication
// Provides HTTP client interface to verify user existence
const axios = require("axios");
const config = require("../config");
const { logger } = require("../logging");

// Interface for communicating with the Users microservice
// Used to verify user identity before performing cost operations
const checkUserExists = async (userId) => {
  const url = `${config.USERS_SERVICE_URL}/exists/${userId}`;

  try {
    // Executes a GET request with a configured timeout to prevent hanging
    const response = await axios.get(url, {
      timeout: config.USERS_SERVICE_TIMEOUT || 5000,
    });

    // Returns the boolean existence flag from the users-service response
    return response.data.exists;
  } catch (error) {
    // Logs the communication failure for system auditing
    logger.error({ userId, error: error.message }, "Users-service call failed");
    throw error;
  }
};

module.exports = {
  checkUserExists,
};
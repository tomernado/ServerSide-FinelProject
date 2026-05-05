// Users service - business logic layer
// Handles user validation, CRUD operations, and cost integration via external service
const usersRepository = require("../repositories/users_repository");
const costsClient = require("../../clients/costs_client");
const { logger } = require("../../logging");
const { ValidationError } = require("../../errors/validation_error");
const { NotFoundError } = require("../../errors/not_found_error");
const { DuplicateError } = require("../../errors/duplicate_error");
const { ServiceError } = require("../../errors/service_error");
const { User } = require("../../db/models");

// Validates user data synchronously using the Mongoose model schema
const validateUserData = (data) => {
  const tempUser = new User(data);
  const validationError = tempUser.validateSync();

  if (validationError) {
    const firstErrorKey = Object.keys(validationError.errors)[0];
    const firstError = validationError.errors[firstErrorKey];
    throw new ValidationError(firstError.message);
  }

  return tempUser;
};

// Handles business logic for adding a new user, including duplication checks
const addUser = async (userData) => {
  const validatedUser = validateUserData(userData);

  const exists = await usersRepository.checkUserExists(validatedUser.id);
  if (exists) {
    throw new DuplicateError(`User with id ${validatedUser.id} already exists`);
  }

  try {
    const user = await usersRepository.createUser({
      id: validatedUser.id,
      first_name: validatedUser.first_name,
      last_name: validatedUser.last_name,
      birthday: validatedUser.birthday,
    });

    logger.info({ userId: user.id }, "User created successfully");
    
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      birthday: user.birthday,
    };
  } catch (error) {
    // 11000 is the MongoDB error code for duplicate key violations
    if (error.code === 11000) {
      throw new DuplicateError(`User with id ${validatedUser.id} already exists`);
    }
    throw error;
  }
};

// Retrieves all users and formats them for the API response
const getAllUsers = async () => {
  const users = await usersRepository.findAllUsers();

  return users.map((user) => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    birthday: user.birthday,
  }));
};

// Retrieves a user by ID and fetches their total costs via external service call
const getUserById = async (id) => {
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    throw new ValidationError("Invalid user id");
  }

  const user = await usersRepository.findUserById(userId);

  if (!user) {
    throw new NotFoundError(`User with id ${userId} not found`);
  }

  let totalCosts = 0;
  
  try {
    totalCosts = await costsClient.getUserTotalCosts(userId);
  } catch (error) {
    // Handle specific networking errors when contacting the costs microservice
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT" ||
      error.response?.status >= 500
    ) {
      throw new ServiceError("Costs service unavailable", 503);
    } else if (error.response) {
      throw new ServiceError(`Costs service error: ${error.response.statusText}`, 502);
    } else {
      throw new ServiceError("Failed to fetch costs data", 502);
    }
  }

  return {
    first_name: user.first_name,
    last_name: user.last_name,
    id: user.id,
    total: totalCosts, // Renamed to 'total' to strictly match project guidelines
  };
};

// Fast internal check for user existence, used by other microservices
const checkUserExists = async (id) => {
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    throw new ValidationError("Invalid user id");
  }

  const exists = await usersRepository.checkUserExists(userId);

  return {
    exists,
    userId,
  };
};

module.exports = {
  addUser,
  getAllUsers,
  getUserById,
  checkUserExists,
};
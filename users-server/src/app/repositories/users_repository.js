// Users repository - database access layer for user management
// Handles all database operations for user profiles and authentication

// Handles direct database operations for the users collection
const { User } = require("../../db/models");

// Creates and saves a new user document to MongoDB
const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

// Retrieves a specific user based on the custom 'id' field (not Mongoose '_id')
const findUserById = async (id) => {
  return await User.findOne({ id });
};

// Fetches all user documents from the collection
const findAllUsers = async () => {
  return await User.find({});
};

// Efficiently checks if a user exists without fetching the entire document payload
const checkUserExists = async (id) => {
  const count = await User.countDocuments({ id });
  return count > 0;
};

module.exports = {
  createUser,
  findUserById,
  findAllUsers,
  checkUserExists,
};
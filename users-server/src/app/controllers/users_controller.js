const usersService = require("../services/users_service");

// Handles POST /api/add requests by delegating to the service layer
const addUser = async (req, res, next) => {
  try {
    const user = await usersService.addUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

// Handles GET /api/users requests to retrieve all user profiles
const getUsers = async (req, res, next) => {
  try {
    const users = await usersService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Handles GET /api/users/:id requests to fetch a specific user
const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Handles GET /api/exists/:id for internal inter-service validation
const checkUserExists = async (req, res, next) => {
  try {
    const result = await usersService.checkUserExists(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addUser,
  getUsers,
  getUserById,
  checkUserExists,
};
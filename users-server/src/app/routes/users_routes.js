// Users routes module - defines HTTP endpoints for user management
// Provides routes for creating users, retrieving profiles, and checking existence

const express = require("express");
const usersController = require("../controllers/users_controller");

const router = express.Router();

// Handler: Validates user data, checks for duplicates, and persists to database
router.post("/add", usersController.addUser);

// Handler: Fetches all user profiles from database
router.get("/users", usersController.getUsers);

// Handler: Returns user profile with total costs from costs service
router.get("/users/:id", usersController.getUserById);

// Handler: Validates user existence for inter-service communication
router.get("/exists/:id", usersController.checkUserExists);

module.exports = router;

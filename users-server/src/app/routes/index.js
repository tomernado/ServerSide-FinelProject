// Routes aggregation module - combines all API route modules for users service
// Provides centralized routing configuration for all user-related endpoints

const express = require("express");
const usersRoutes = require("./users_routes");
const router = express.Router();

router.use("/", usersRoutes);

module.exports = router;

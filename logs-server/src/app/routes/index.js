// Routes aggregation module - combines all API route modules for logs service
// Provides centralized routing configuration for all log-related endpoints

const express = require("express");
const logsRoutes = require("./log_routes");
const router = express.Router();

router.use("/", logsRoutes);

module.exports = router;

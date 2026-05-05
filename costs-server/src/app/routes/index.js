// Routes aggregation module - combines all API route modules for costs service
// Provides centralized routing configuration for all cost-related endpoints

const express = require("express");
const costsRoutes = require("./costs_routes");
const router = express.Router();

router.use("/", costsRoutes);

module.exports = router;

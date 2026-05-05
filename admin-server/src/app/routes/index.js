// Main routes aggregation module - combines all API route modules
const express = require("express");
const adminRoutes = require("./admin_routes");
const router = express.Router();

router.use("/", adminRoutes);

module.exports = router;

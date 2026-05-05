// Logs routes module - defines HTTP endpoints for log management
// Provides routes for retrieving and storing centralized logs from all services
const express = require("express");
const logsController = require("../controllers/logs_controller");

const router = express.Router();

// Routes for central logging management
router.get("/logs", logsController.getLogs);
router.post("/logs", logsController.createLog);

module.exports = router;
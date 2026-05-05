// Admin routes module - defines HTTP endpoints for admin service
const express = require("express");
const adminController = require("../controllers/admin_controller");

const router = express.Router();

// Returns team members information
router.get("/about", adminController.getAbout);

module.exports = router;
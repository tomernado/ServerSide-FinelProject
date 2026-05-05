const express = require("express");
const costsController = require("../controllers/costs_controller");

const router = express.Router();

// Router configuration: Mapping HTTP methods and URLs to cost management controllers
// Includes standard REST endpoints and internal inter-service endpoints (/user-total)
router.post("/add", costsController.addCost);
router.get("/report", costsController.getMonthlyReport);
router.get("/user-total", costsController.getUserTotalCosts);

module.exports = router;
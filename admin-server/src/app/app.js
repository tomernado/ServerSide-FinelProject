const express = require("express");
const adminRoutes = require("./routes/admin_routes");
const { errorHandler } = require("./middlewares/error_handler");

const app = express();

app.use(express.json());

// Main entry point for admin operations
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

module.exports = app;
// Express application factory module - creates users service app

const express = require("express");
const loggerMiddleware = require("./middlewares/logger_middleware");
const errorMiddleware = require("./middlewares/error_middleware");
const routes = require("./routes");

/**
 Sets up all middleware and routes
 */
const createApp = function () {
  // Create Express app instance
  const app = express();
  app.use(loggerMiddleware);
  app.use(express.json());
  app.use("/api", routes);
  app.use(errorMiddleware);

  return app;
};

module.exports = createApp;

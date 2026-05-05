// Express application factory module - creates logs service app
const express = require("express");
const loggerMiddleware = require("./middlewares/logger_middleware");
const errorMiddleware = require("./middlewares/error_middleware");
const routes = require("./routes");


// Factory function to create and configure Express application
 
const createApp = function () {
  const app = express();
  app.use(loggerMiddleware);
  app.use(express.json());
  app.use("/api", routes);
  app.use(errorMiddleware);

  return app;
};

module.exports = createApp;

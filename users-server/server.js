// Server entry point for the users microservice
// This file connects to the database and binds the Express app to a port

const createApp = require("./src/app/app");
const { connectDB } = require("./src/db");
const { logger } = require("./src/logging");
const config = require("./src/config");

// Initialize the Express application instance
const app = createApp();

// Attempt to connect to MongoDB before accepting any incoming requests
// This ensures the server does not process requests without a valid DB connection
connectDB()
  .then(() => {
    const port = config.PORT || 3000;

    // Start listening for HTTP requests on the specified port
    app.listen(port, () => {
      logger.info(`Server successfully running on port ${port}`);
    });
  })
  .catch((error) => {
    // If the database connection fails, log the critical error and exit
    logger.error("Failed to start server due to MongoDB connection error", error);
    process.exit(1);
  });
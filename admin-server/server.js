// Server entry point - initializes and starts the Express application

// Load application factory from app configuration
const createApp = require("./src/app/app");
// Import logger instance for logging server events
const { logger } = require("./src/logging");
// Load environment configuration variables
const config = require("./src/config");

// Create Express application with all middleware and routes configured
const app = createApp();

// Extract port number from config or use default port 2000
const port = config.PORT || 2000;
// Start listening for HTTP requests on specified port
app.listen(port, () => {
  // Log server startup confirmation with port number
  logger.info(`Server running on port ${port}`);
});

// Server entry point for logs service - initializes database and starts application
const createApp = require("./src/app/app");
const { connectDB } = require("./src/db");
const { logger } = require("./src/logging");
const config = require("./src/config");

const app = createApp();

connectDB().then(() => {
  const port = config.PORT || 5000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
});

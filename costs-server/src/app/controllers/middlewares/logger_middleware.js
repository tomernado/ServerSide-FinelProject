// HTTP request logging middleware using pino-http
const pinoHttp = require("pino-http");
const { logger } = require("../../logging");

// Configure the HTTP logger with conditional log levels and custom messages
const httpLogger = pinoHttp({
  logger,
  
  // Dynamically assign log levels based on the HTTP response status code
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return "warn"; 
    } else if (res.statusCode >= 500 || err || res.err) {
      return "error"; 
    }
    return "info"; 
  },
  
  // Format the success message to be concise and readable
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  
  // Format the error message to include the specific error details
  customErrorMessage: (req, res, err) => {
    const error = err || res.err;
    return `${req.method} ${req.url} ${res.statusCode} - ${error?.message}`;
  },
});

// Wrapper middleware to inject the configured pino logger into the Express pipeline
const loggingMiddleware = (req, res, next) => {
  httpLogger(req, res, next);
};

module.exports = loggingMiddleware;
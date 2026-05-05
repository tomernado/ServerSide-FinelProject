// Database models aggregation module - exports all Mongoose models for users service
// Provides centralized access to User model used throughout the application

// Import User model for user document schema and validation
const User = require("./user.model");

// Export all models as named exports for easy access in repositories and services
module.exports = {
  User,
};

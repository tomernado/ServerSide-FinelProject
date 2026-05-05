// Centralized cost categories to prevent magic strings and ensure data consistency
const COST_CATEGORIES = {
  FOOD: "food",
  HEALTH: "health",
  HOUSING: "housing",
  SPORTS: "sports",
  EDUCATION: "education",
};

// Derived array for Mongoose enum validation and filtering logic
const VALID_CATEGORIES = Object.values(COST_CATEGORIES);

module.exports = {
  COST_CATEGORIES,
  VALID_CATEGORIES,
};
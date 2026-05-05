// Cost model module - Mongoose schema and model for cost entries
// Defines structure for storing individual cost records with validation rules
const mongoose = require("mongoose");
const { VALID_CATEGORIES } = require("../../config/cost_categories");

// Schema for individual cost entries with strict validation rules
const costSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Field 'description' is required"],
      trim: true,
      minlength: [1, "Field 'description' must not be empty"],
    },
    category: {
      type: String,
      required: [true, "Field 'category' is required"],
      trim: true,
      // Dynamically load valid categories from centralized config
      enum: {
        values: VALID_CATEGORIES,
        message: `Field 'category' must be one of: ${VALID_CATEGORIES.join(", ")}`,
      },
    },
    userid: {
      type: Number,
      required: [true, "Field 'userid' is required"],
      index: true, // Crucial for performance: we frequently query costs by user
    },
    sum: {
      type: Number,
      required: [true, "Field 'sum' is required"],
      validate: {
        validator: (value) => value > 0,
        message: "Field 'sum' must be a positive number",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cost", costSchema);
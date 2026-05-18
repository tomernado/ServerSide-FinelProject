// Cost model - Mongoose schema and validation for individual cost entries
const mongoose = require("mongoose");
const { VALID_CATEGORIES } = require("../../config/cost_categories");

const costSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Field 'description' is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Field 'category' is required"],
    trim: true,
    enum: {
      values: VALID_CATEGORIES,
      message: `Field 'category' must be one of: ${VALID_CATEGORIES.join(", ")}`,
    },
  },
  userid: {
    type: Number,
    required: [true, "Field 'userid' is required and must be a number"],
  },
  // Requirements specify Double; Number in Mongoose maps to BSON Double in MongoDB
  sum: {
    type: Number,
    required: [true, "Field 'sum' is required and must be a number"],
    min: [0.01, "Field 'sum' must be greater than 0"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    validate: {
      /*
       * Past-date costs are rejected at the model level to preserve Computed
       * Pattern cache integrity: once a past month is cached, no new cost for
       * that period must ever be inserted, so the cached report stays valid.
       */
      validator: (value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(value) >= today;
      },
      message: "Field 'createdAt' cannot be a past date",
    },
  },
});

module.exports = mongoose.model("Cost", costSchema);



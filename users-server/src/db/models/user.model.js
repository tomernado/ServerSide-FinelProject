// User model module - Mongoose schema and model for user profiles
// Defines structure for storing user information with validation rules

const mongoose = require("mongoose");

// Defines the Mongoose schema and validation rules for the User collection
// Enforces the specific data types and requirements from the project document
const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, "Field 'id' is required and must be a number"],
      unique: true,
      index: true,
    },
    first_name: {
      type: String,
      required: [true, "Field 'first_name' is required"],
      trim: true,
    },
    last_name: {
      type: String,
      required: [true, "Field 'last_name' is required"],
      trim: true,
    },
    birthday: {
      type: Date,
      required: [true, "Field 'birthday' is required"],
      validate: {
        // Ensures the passed value is an actual Date object and not 'Invalid Date' (NaN)
        validator: (value) => value instanceof Date && !isNaN(value),
        message: "Field 'birthday' must be a valid date",
      },
    },
  },
  { 
    // Automatically manages createdAt and updatedAt properties
    timestamps: true 
  }
);

// Create and export the User model for use in the repository layer
const User = mongoose.model("User", userSchema);

module.exports = User;
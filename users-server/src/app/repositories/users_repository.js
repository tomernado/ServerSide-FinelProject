const { User } = require("../../db/models");
const { ValidationError } = require("../../errors/validation_error");

// Validates user data against the Mongoose schema — keeps the service Mongoose-agnostic
const validateData = (data) => {
  const tempUser = new User(data);
  const validationError = tempUser.validateSync();
  if (validationError) {
    const firstErrorKey = Object.keys(validationError.errors)[0];
    throw new ValidationError(validationError.errors[firstErrorKey].message);
  }
  return tempUser;
};

const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

// Uses the custom numeric 'id' field — not Mongoose's auto-generated '_id'
const findUserById = async (id) => {
  return await User.findOne({ id }).lean();
};

const findAllUsers = async () => {
  return await User.find({}).lean();
};

// Uses countDocuments rather than find to avoid loading full documents just for existence checks
const checkUserExists = async (id) => {
  const count = await User.countDocuments({ id });
  return count > 0;
};

module.exports = {
  validateData,
  createUser,
  findUserById,
  findAllUsers,
  checkUserExists,
};

// Admin controller module - handles HTTP requests for admin endpoints
const adminService = require("../services/admin_service");

const getAbout = (req, res, next) => {
  try {
    const teamMembers = adminService.getTeamMembers();
    res.status(200).json(teamMembers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAbout,
};
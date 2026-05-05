// Admin service module - contains business logic for admin operations

// Returns a hardcoded array of team members
const getTeamMembers = () => {
  return [
    { first_name: "Tomer", last_name: "Cohen" },
    { first_name: "Ofir", last_name: "Fichman" },
    { first_name: "Daniel", last_name: "Ben David" },
  ];
};

module.exports = {
  getTeamMembers,
};
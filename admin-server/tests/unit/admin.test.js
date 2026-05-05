// Unit test suite for admin service - tests team members retrieval
// Mock logging client to prevent external HTTP calls during testing
jest.mock("../../src/clients/logging_client", () => ({
  logRequest: jest.fn(),
  logResponse: jest.fn(),
  logCustom: jest.fn(),
}));

const adminService = require("../../src/app/services/admin_service");

 // Test suite for admin service functionality
 // Tests the getTeamMembers function behavior
 
describe("Admin Service", () => {

  describe("getTeamMembers", () => {
   
     // Test 1: Verify function returns an array with team members
     
    test("should return hardcoded team members", () => {
      const result = adminService.getTeamMembers();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("first_name");
      expect(result[0]).toHaveProperty("last_name");
    });

     // Test 2: Validate team member object structure
    test("should return team members with correct structure", () => {
      const result = adminService.getTeamMembers();

      result.forEach((member) => {
        expect(member).toEqual({
          first_name: expect.any(String),
          last_name: expect.any(String),
        });
      });
    });

    
     // Test 3: Ensure function returns consistent data
     // Multiple calls should return identical arrays
   
    test("should return consistent team members on multiple calls", () => {
      const result1 = adminService.getTeamMembers();
      const result2 = adminService.getTeamMembers();

      expect(result1).toEqual(result2);
    });
  });
});

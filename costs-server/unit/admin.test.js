// Unit test suite for admin service - tests team members retrieval

// Mock logging client to prevent external HTTP calls during testing
jest.mock("../../src/clients/logging_client", () => ({
  logRequest: jest.fn(),
  logResponse: jest.fn(),
  logCustom: jest.fn(),
}));

// Import the admin service module under test
const adminService = require("../../src/app/services/admin_service");

/**
 * Test suite for admin service functionality
 * Tests the getTeamMembers function behavior
 */
describe("Admin Service", () => {
  /**
   * Test suite for getTeamMembers function
   */
  describe("getTeamMembers", () => {
    /**
     * Test 1: Verify function returns an array with team members
     */
    test("should return hardcoded team members", () => {
      // Call getTeamMembers function
      const result = adminService.getTeamMembers();

      // Verify result is an array instance
      expect(result).toBeInstanceOf(Array);
      // Verify array contains at least one team member
      expect(result.length).toBeGreaterThan(0);
      // Verify first member has first_name property
      expect(result[0]).toHaveProperty("first_name");
      // Verify first member has last_name property
      expect(result[0]).toHaveProperty("last_name");
    });

    /**
     * Test 2: Validate team member object structure
     * Each member should have first_name and last_name strings
     */
    test("should return team members with correct structure", () => {
      // Get team members from service
      const result = adminService.getTeamMembers();

      // Iterate through each team member
      result.forEach((member) => {
        // Verify member has exactly two properties with string values
        expect(member).toEqual({
          first_name: expect.any(String),
          last_name: expect.any(String),
        });
      });
    });

    /**
     * Test 3: Ensure function returns consistent data
     * Multiple calls should return identical arrays
     */
    test("should return consistent team members on multiple calls", () => {
      // Call getTeamMembers first time
      const result1 = adminService.getTeamMembers();
      // Call getTeamMembers second time
      const result2 = adminService.getTeamMembers();

      // Verify both calls return identical data
      expect(result1).toEqual(result2);
    });
  });
});

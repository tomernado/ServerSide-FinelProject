// Users service unit tests
// Tests for all service methods: addUser, getAllUsers, getUserById
// Validates required fields, duplicate detection, and integration with costs-service
// Mocks repository and external service calls for isolated testing
// Uses Jest testing framework with mock functions for dependencies

// Mock the users repository to avoid database calls during tests
jest.mock("../../src/app/repositories/users_repository");
// Mock the costs client to avoid inter-service calls during tests
jest.mock("../../src/clients/costs_client");

// Import the service being tested
const usersService = require("../../src/app/services/users_service");
// Import mocked dependencies for setup and verification
const usersRepository = require("../../src/app/repositories/users_repository");
const costsClient = require("../../src/clients/costs_client");
// Import error classes to verify proper error handling
const { ValidationError } = require("../../src/errors/validation_error");
const { NotFoundError } = require("../../src/errors/not_found_error");
const { DuplicateError } = require("../../src/errors/duplicate_error");
const { ServiceError } = require("../../src/errors/service_error");

describe("Users Service", () => {
  // Reset all mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addUser", () => {
    // Tests for user creation with validation and duplicate checking
    // Required fields: id (unique), first_name, last_name, birthday
    // Converts birthday string to Date object automatically
    // Test 1: Verify user creation with valid data
    it("should create user successfully with valid data", async () => {
      // Arrange: Prepare test data with all required user fields
      const userData = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-01-01",
      };

      // Arrange: Prepare expected returned user object with Date conversion
      const savedUser = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-01-01"),
      };

      // Arrange: Mock duplicate check to return false (user doesn't exist)
      usersRepository.checkUserExists.mockResolvedValue(false);
      // Arrange: Mock repository to return created user
      usersRepository.createUser.mockResolvedValue(savedUser);

      // Act: Call the service method with test data
      const result = await usersService.addUser(userData);

      // Assert: Verify duplicate check was performed with user ID
      expect(usersRepository.checkUserExists).toHaveBeenCalledWith(1);
      // Assert: Verify repository was called with converted data
      expect(usersRepository.createUser).toHaveBeenCalledWith({
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: expect.any(Date),
      });
      // Assert: Verify the result matches the expected saved user
      expect(result).toEqual({
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: expect.any(Date),
      });
    });

    // Test 2: Verify id field is required
    // Ensures validation fails when id is missing
    it("should throw ValidationError when id is missing", async () => {
      // Arrange: Create user data without required id field
      const userData = {
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-01-01",
      };

      // Act & Assert: Verify that missing id throws ValidationError
      await expect(usersService.addUser(userData)).rejects.toThrow(
        ValidationError
      );

      // Assert: Verify the error message indicates the missing field
      await expect(usersService.addUser(userData)).rejects.toThrow(
        "Field 'id' is required and must be a number"
      );
    });

    // Test 3: Verify first_name field is required
    // Ensures validation fails when first_name is missing
    it("should throw ValidationError when first_name is missing", async () => {
      // Arrange: Create user data without required first_name field
      const userData = {
        id: 1,
        last_name: "Doe",
        birthday: "1990-01-01",
      };

      // Act & Assert: Verify that missing first_name throws ValidationError
      await expect(usersService.addUser(userData)).rejects.toThrow(
        ValidationError
      );

      // Assert: Verify the error message indicates the missing field
      await expect(usersService.addUser(userData)).rejects.toThrow(
        "Field 'first_name' is required and must be a string"
      );
    });

    // Test 4: Verify last_name field is required
    // Ensures validation fails when last_name is missing
    it("should throw ValidationError when last_name is missing", async () => {
      // Arrange: Create user data without required last_name field
      const userData = {
        id: 1,
        first_name: "John",
        birthday: "1990-01-01",
      };

      // Act & Assert: Verify that missing last_name throws ValidationError
      await expect(usersService.addUser(userData)).rejects.toThrow(
        ValidationError
      );

      // Assert: Verify the error message indicates the missing field
      await expect(usersService.addUser(userData)).rejects.toThrow(
        "Field 'last_name' is required and must be a string"
      );
    });

    // Test 5: Verify birthday field is required
    // Ensures validation fails when birthday is missing
    it("should throw ValidationError when birthday is missing", async () => {
      // Arrange: Create user data without required birthday field
      const userData = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
      };

      // Act & Assert: Verify that missing birthday throws ValidationError
      await expect(usersService.addUser(userData)).rejects.toThrow(
        ValidationError
      );

      // Assert: Verify the error message indicates the missing field
      await expect(usersService.addUser(userData)).rejects.toThrow(
        "Field 'birthday' is required"
      );
    });

    // Test 6: Verify birthday must be a valid date
    // Ensures birthday value can be parsed as a date
    it("should throw ValidationError when birthday is invalid", async () => {
      // Arrange: Create user data with invalid birthday format
      const userData = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: "invalid-date",
      };

      // Act & Assert: Verify that invalid birthday throws ValidationError
      await expect(usersService.addUser(userData)).rejects.toThrow(
        ValidationError
      );
    });

    // Test 7: Verify duplicate ID detection
    // Ensures duplicate user IDs are rejected before database insert
    it("should throw DuplicateError when user id already exists", async () => {
      // Arrange: Create user data with potentially duplicate ID
      const userData = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-01-01",
      };

      // Arrange: Mock duplicate check to return true (user exists)
      usersRepository.checkUserExists.mockResolvedValue(true);

      // Act & Assert: Verify that existing user ID throws DuplicateError
      await expect(usersService.addUser(userData)).rejects.toThrow(
        DuplicateError
      );
    });

    // Test 8: Verify MongoDB duplicate key error handling
    // Ensures duplicate key errors from database are converted to DuplicateError
    it("should throw DuplicateError when mongo returns duplicate key error", async () => {
      // Arrange: Create user data that will trigger duplicate error
      const userData = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-01-01",
      };

      // Arrange: Mock duplicate check to return false initially
      usersRepository.checkUserExists.mockResolvedValue(false);

      // Arrange: Create MongoDB duplicate key error (code 11000)
      const dbError = new Error("Duplicate key");
      dbError.code = 11000;
      // Arrange: Mock repository to reject with MongoDB duplicate error
      usersRepository.createUser.mockRejectedValue(dbError);

      // Act & Assert: Verify that MongoDB error is converted to DuplicateError
      await expect(usersService.addUser(userData)).rejects.toThrow(
        DuplicateError
      );
    });
  });

  describe("getAllUsers", () => {
    // Tests for retrieving all users from repository
    // Handles empty user list and returns array of user objects
    // Test 9: Verify users list retrieval
    // Test 9: Verify users list retrieval
    it("should return all users", async () => {
      // Arrange: Create test users array with sample data
      const users = [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          birthday: new Date("1990-01-01"),
        },
        {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
          birthday: new Date("1992-05-15"),
        },
      ];

      // Arrange: Mock repository to return all users
      usersRepository.findAllUsers.mockResolvedValue(users);

      // Act: Call the service method to retrieve all users
      const result = await usersService.getAllUsers();

      // Assert: Verify repository was called
      expect(usersRepository.findAllUsers).toHaveBeenCalled();
      // Assert: Verify all users are returned with correct data
      expect(result).toEqual([
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          birthday: new Date("1990-01-01"),
        },
        {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
          birthday: new Date("1992-05-15"),
        },
      ]);
    });

    // Test 10: Verify empty user list is handled correctly
    // Ensures no errors occur when no users exist in database
    it("should return empty array when no users exist", async () => {
      // Arrange: Mock repository to return empty array
      usersRepository.findAllUsers.mockResolvedValue([]);

      // Act: Call the service method when no users exist
      const result = await usersService.getAllUsers();

      // Assert: Verify empty array is returned
      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    // Tests for retrieving user by ID with costs integration
    // Fetches costs from costs-service and attaches total_costs to user
    // Handles service failures (503 unavailable, 502 bad gateway) and timeouts
    // Test 11: Verify user retrieval with costs integration
    it("should return user with total_costs when costs-service responds", async () => {
      // Arrange: Create test user object without costs
      const user = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-01-01"),
      };

      // Arrange: Mock repository to return the user
      usersRepository.findUserById.mockResolvedValue(user);
      // Arrange: Mock costs client to return user total costs
      costsClient.getUserTotalCosts.mockResolvedValue(150.5);

      // Act: Call the service method to get user with costs
      const result = await usersService.getUserById("1");

      // Assert: Verify repository was called with numeric ID
      expect(usersRepository.findUserById).toHaveBeenCalledWith(1);
      // Assert: Verify costs client was called with correct user ID
      expect(costsClient.getUserTotalCosts).toHaveBeenCalledWith(1);
      // Assert: Verify result includes user data with computed total_costs
      expect(result).toEqual({
        id: 1,
        first_name: "John",
        last_name: "Doe",
        total_costs: 150.5,
      });
    });

    // Test 12: Verify not found error when user doesn't exist
    // Ensures service rejects when user record is missing from database
    it("should throw NotFoundError when user does not exist", async () => {
      // Arrange: Mock repository to return null (user not found)
      usersRepository.findUserById.mockResolvedValue(null);

      // Act & Assert: Verify that missing user throws NotFoundError
      await expect(usersService.getUserById("999")).rejects.toThrow(
        NotFoundError
      );
    });

    // Test 13: Verify validation of numeric user ID
    // Ensures service rejects non-numeric ID values
    it("should throw ValidationError when id is not a number", async () => {
      // Arrange: Try to get user with non-numeric string ID
      // Act & Assert: Verify that non-numeric ID throws ValidationError
      await expect(usersService.getUserById("abc")).rejects.toThrow(
        ValidationError
      );
    });

    // Test 14: Verify service error when costs-service is unavailable
    // Ensures proper error handling for connection failures to upstream service
    it("should throw ServiceError with 503 when costs-service is unavailable", async () => {
      // Arrange: Create test user object
      const user = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-01-01"),
      };

      // Arrange: Mock repository to return the user
      usersRepository.findUserById.mockResolvedValue(user);

      // Arrange: Create connection error from costs service
      const error = new Error("connect ECONNREFUSED");
      error.code = "ECONNREFUSED";
      // Arrange: Mock costs client to reject with connection error
      costsClient.getUserTotalCosts.mockRejectedValue(error);

      // Act & Assert: Verify that connection error throws ServiceError
      await expect(usersService.getUserById("1")).rejects.toThrow(ServiceError);

      // Act & Assert: Verify the error has 503 Unavailable status
      try {
        await usersService.getUserById("1");
      } catch (err) {
        expect(err.status).toBe(503);
      }
    });

    // Test 15: Verify service error when costs-service times out
    // Ensures timeout errors are converted to 503 Service Unavailable
    it("should throw ServiceError with 503 when costs-service times out", async () => {
      // Arrange: Create test user object
      const user = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-01-01"),
      };

      // Arrange: Mock repository to return the user
      usersRepository.findUserById.mockResolvedValue(user);

      // Arrange: Create timeout error from costs service
      const error = new Error("timeout");
      error.code = "ETIMEDOUT";
      // Arrange: Mock costs client to reject with timeout error
      costsClient.getUserTotalCosts.mockRejectedValue(error);

      // Act & Assert: Verify that timeout error throws ServiceError
      await expect(usersService.getUserById("1")).rejects.toThrow(ServiceError);

      // Act & Assert: Verify the error has 503 Unavailable status
      try {
        await usersService.getUserById("1");
      } catch (err) {
        expect(err.status).toBe(503);
      }
    });

    // Test 16: Verify service error when costs-service returns error
    // Ensures invalid responses from costs service are handled as bad gateway errors
    it("should throw ServiceError with 502 when costs-service returns error response", async () => {
      // Arrange: Create test user object
      const user = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-01-01"),
      };

      // Arrange: Mock repository to return the user
      usersRepository.findUserById.mockResolvedValue(user);

      const error = new Error("Request failed");
      error.response = {
        status: 400,
        statusText: "Bad Request",
      };
      costsClient.getUserTotalCosts.mockRejectedValue(error);

      await expect(usersService.getUserById("1")).rejects.toThrow(ServiceError);

      try {
        await usersService.getUserById("1");
      } catch (err) {
        expect(err.status).toBe(502);
      }
    });
  });
});

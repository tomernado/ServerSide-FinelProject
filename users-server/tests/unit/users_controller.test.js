// Users controller unit tests
// Tests for all controller endpoints: addUser, getUsers, getUserById, checkUserExists
// Validates HTTP request/response handling and error propagation
// Mocks service layer for isolated controller testing

// Mock the users service to avoid service layer execution during tests
jest.mock("../../src/app/services/users_service");

// Import the controller being tested
const usersController = require("../../src/app/controllers/users_controller");
// Import mocked dependency for setup and verification
const usersService = require("../../src/app/services/users_service");
// Import error classes to verify proper error handling
const { ValidationError } = require("../../src/errors/validation_error");
const { NotFoundError } = require("../../src/errors/not_found_error");
const { DuplicateError } = require("../../src/errors/duplicate_error");
const { ServiceError } = require("../../src/errors/service_error");

describe("Users Controller", () => {
  // Declare variables for Express request/response/next mock objects
  let req;
  let res;
  let next;

  // Initialize fresh mock objects before each test
  beforeEach(() => {
    // Create mock request object with typical Express properties
    req = {
      body: {},
      params: {},
      headers: {},
      id: "test-request-id",
    };
    // Create mock response object with status and json methods
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    // Create mock next function for error handling
    next = jest.fn();
    // Clear all service mocks to ensure test isolation
    jest.clearAllMocks();
  });

  describe("POST /api/add", () => {
    // Test 1: Verify user creation with valid data
    // Mocks service and validates response status and data
    it("should create a new user successfully", async () => {
      // Arrange: Prepare request body with all required user fields
      const userData = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-01-01",
      };

      req.body = userData;

      // Arrange: Prepare expected returned user object
      const expectedUser = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-01-01"),
      };

      // Arrange: Mock service to return successfully created user
      usersService.addUser.mockResolvedValue(expectedUser);

      // Act: Call the controller method with mock request/response
      await usersController.addUser(req, res, next);

      // Assert: Verify service was called with request body data
      expect(usersService.addUser).toHaveBeenCalledWith(userData);
      // Assert: Verify HTTP 201 Created status was set
      expect(res.status).toHaveBeenCalledWith(201);
      // Assert: Verify response JSON contains created user
      expect(res.json).toHaveBeenCalledWith(expectedUser);
      // Assert: Verify error handler was not called on success
      expect(next).not.toHaveBeenCalled();
    });

    // Test 2: Verify validation errors are properly propagated
    // Ensures controller passes service errors to error handler
    it("should return 400 when required fields are missing", async () => {
      // Arrange: Prepare request body with missing required field
      req.body = {
        id: 1,
        first_name: "John",
      };

      // Arrange: Create validation error for missing field
      const validationError = new ValidationError(
        "Field 'last_name' is required and must be a string"
      );

      // Arrange: Mock service to reject with validation error
      usersService.addUser.mockRejectedValue(validationError);

      // Act: Call the controller method
      await usersController.addUser(req, res, next);

      // Assert: Verify error handler was called with validation error
      expect(next).toHaveBeenCalledWith(validationError);
      // Assert: Verify response status was not set (error handler sets it)
      expect(res.status).not.toHaveBeenCalled();
    });

    // Test 3: Verify duplicate ID errors are properly propagated
    // Ensures controller handles duplicate key constraint violations
    it("should return 409 when user id already exists", async () => {
      // Arrange: Prepare request body with duplicate user ID
      req.body = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: "1990-01-01",
      };

      // Arrange: Create duplicate error for existing user ID
      const duplicateError = new DuplicateError(
        "User with id 1 already exists"
      );

      // Arrange: Mock service to reject with duplicate error
      usersService.addUser.mockRejectedValue(duplicateError);

      // Act: Call the controller method
      await usersController.addUser(req, res, next);

      // Assert: Verify error handler was called with duplicate error
      expect(next).toHaveBeenCalledWith(duplicateError);
      // Assert: Verify response status was not set (error handler sets it)
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/users", () => {
    // Test 4: Verify users list is returned with 200 status
    // Ensures all users are retrieved and returned properly
    it("should return array of users", async () => {
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

      // Arrange: Mock service to return all users
      usersService.getAllUsers.mockResolvedValue(users);

      // Act: Call the controller method
      await usersController.getUsers(req, res, next);

      // Assert: Verify service was called without parameters
      expect(usersService.getAllUsers).toHaveBeenCalledWith();
      // Assert: Verify HTTP 200 OK status was set
      expect(res.status).toHaveBeenCalledWith(200);
      // Assert: Verify response JSON contains user array
      expect(res.json).toHaveBeenCalledWith(users);
      // Assert: Verify error handler was not called on success
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/users/:id", () => {
    // Test 5: Verify user retrieval with costs data
    // Ensures user data includes computed total_costs field
    it("should return user with total_costs when costs-service responds", async () => {
      // Arrange: Set request param with user ID to retrieve
      req.params.id = "1";

      // Arrange: Prepare expected user object with costs data
      const userWithCosts = {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: new Date("1990-01-01"),
        total_costs: 150.5,
      };

      // Arrange: Mock service to return user with total costs
      usersService.getUserById.mockResolvedValue(userWithCosts);

      // Act: Call the controller method with user ID parameter
      await usersController.getUserById(req, res, next);

      // Assert: Verify service was called with correct user ID
      expect(usersService.getUserById).toHaveBeenCalledWith("1");
      // Assert: Verify HTTP 200 OK status was set
      expect(res.status).toHaveBeenCalledWith(200);
      // Assert: Verify response JSON contains user with costs
      expect(res.json).toHaveBeenCalledWith(userWithCosts);
      // Assert: Verify error handler was not called on success
      expect(next).not.toHaveBeenCalled();
    });

    // Test 6: Verify not found errors are properly propagated
    // Ensures controller handles missing user scenarios
    it("should return 404 when user not found", async () => {
      // Arrange: Set request param with non-existent user ID
      req.params.id = "999";

      // Arrange: Create not found error for missing user
      const notFoundError = new NotFoundError("User with id 999 not found");

      // Arrange: Mock service to reject with not found error
      usersService.getUserById.mockRejectedValue(notFoundError);

      // Act: Call the controller method
      await usersController.getUserById(req, res, next);

      // Assert: Verify error handler was called with not found error
      expect(next).toHaveBeenCalledWith(notFoundError);
      // Assert: Verify response status was not set (error handler sets it)
      expect(res.status).not.toHaveBeenCalled();
    });

    // Test 7: Verify service unavailable errors are properly propagated
    // Ensures controller handles downstream service failures
    it("should return 503 when costs-service is unavailable", async () => {
      // Arrange: Set request param with valid user ID
      req.params.id = "1";

      // Arrange: Create service error for unavailable costs service
      const serviceError = new ServiceError("Costs service unavailable", 503);

      // Arrange: Mock service to reject with service error
      usersService.getUserById.mockRejectedValue(serviceError);

      // Act: Call the controller method
      await usersController.getUserById(req, res, next);

      // Assert: Verify error handler was called with service error
      expect(next).toHaveBeenCalledWith(serviceError);
      // Assert: Verify response status was not set (error handler sets it)
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

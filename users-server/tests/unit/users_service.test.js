jest.mock("../../src/app/repositories/users_repository");
jest.mock("../../src/clients/costs_client");

const usersService = require("../../src/app/services/users_service");
const usersRepository = require("../../src/app/repositories/users_repository");
const costsClient = require("../../src/clients/costs_client");
const { ValidationError } = require("../../src/errors/validation_error");
const { NotFoundError } = require("../../src/errors/not_found_error");
const { DuplicateError } = require("../../src/errors/duplicate_error");
const { ServiceError } = require("../../src/errors/service_error");

// Use the real validateData so Mongoose schema validation remains active in tests
// while all DB operations (createUser, findUserById, etc.) stay mocked
const { validateData: realValidateData } = jest.requireActual(
  "../../src/app/repositories/users_repository"
);

describe("Users Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usersRepository.validateData.mockImplementation(realValidateData);
  });

  describe("addUser", () => {
    it("should create user successfully with valid data", async () => {
      const userData = { id: 1, first_name: "John", last_name: "Doe", birthday: "1990-01-01" };
      const savedUser = { id: 1, first_name: "John", last_name: "Doe", birthday: new Date("1990-01-01") };

      usersRepository.checkUserExists.mockResolvedValue(false);
      usersRepository.createUser.mockResolvedValue(savedUser);

      const result = await usersService.addUser(userData);

      expect(usersRepository.checkUserExists).toHaveBeenCalledWith(1);
      expect(usersRepository.createUser).toHaveBeenCalledWith({
        id: 1,
        first_name: "John",
        last_name: "Doe",
        birthday: expect.any(Date),
      });
      expect(result).toEqual({ id: 1, first_name: "John", last_name: "Doe", birthday: expect.any(Date) });
    });

    it("should throw ValidationError when id is missing", async () => {
      const userData = { first_name: "John", last_name: "Doe", birthday: "1990-01-01" };

      await expect(usersService.addUser(userData)).rejects.toThrow(ValidationError);
      await expect(usersService.addUser(userData)).rejects.toThrow("Field 'id' is required and must be a number");
    });

    it("should throw ValidationError when first_name is missing", async () => {
      const userData = { id: 1, last_name: "Doe", birthday: "1990-01-01" };

      await expect(usersService.addUser(userData)).rejects.toThrow(ValidationError);
      await expect(usersService.addUser(userData)).rejects.toThrow("Field 'first_name' is required");
    });

    it("should throw ValidationError when last_name is missing", async () => {
      const userData = { id: 1, first_name: "John", birthday: "1990-01-01" };

      await expect(usersService.addUser(userData)).rejects.toThrow(ValidationError);
      await expect(usersService.addUser(userData)).rejects.toThrow("Field 'last_name' is required");
    });

    it("should throw ValidationError when birthday is missing", async () => {
      const userData = { id: 1, first_name: "John", last_name: "Doe" };

      await expect(usersService.addUser(userData)).rejects.toThrow(ValidationError);
      await expect(usersService.addUser(userData)).rejects.toThrow("Field 'birthday' is required");
    });

    it("should throw ValidationError when birthday is invalid", async () => {
      const userData = { id: 1, first_name: "John", last_name: "Doe", birthday: "invalid-date" };

      await expect(usersService.addUser(userData)).rejects.toThrow(ValidationError);
    });

    it("should throw DuplicateError when user id already exists", async () => {
      const userData = { id: 1, first_name: "John", last_name: "Doe", birthday: "1990-01-01" };

      usersRepository.checkUserExists.mockResolvedValue(true);

      await expect(usersService.addUser(userData)).rejects.toThrow(DuplicateError);
    });

    it("should throw DuplicateError when mongo returns duplicate key error", async () => {
      const userData = { id: 1, first_name: "John", last_name: "Doe", birthday: "1990-01-01" };

      usersRepository.checkUserExists.mockResolvedValue(false);

      // 11000 is the MongoDB error code for a duplicate key constraint violation
      const dbError = new Error("Duplicate key");
      dbError.code = 11000;
      usersRepository.createUser.mockRejectedValue(dbError);

      await expect(usersService.addUser(userData)).rejects.toThrow(DuplicateError);
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
      const users = [
        { id: 1, first_name: "John", last_name: "Doe", birthday: new Date("1990-01-01") },
        { id: 2, first_name: "Jane", last_name: "Smith", birthday: new Date("1992-05-15") },
      ];

      usersRepository.findAllUsers.mockResolvedValue(users);

      const result = await usersService.getAllUsers();

      expect(usersRepository.findAllUsers).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it("should return empty array when no users exist", async () => {
      usersRepository.findAllUsers.mockResolvedValue([]);

      const result = await usersService.getAllUsers();

      expect(result).toEqual([]);
    });
  });

  describe("getUserById", () => {
    it("should return user with total when costs-service responds", async () => {
      const user = { id: 1, first_name: "John", last_name: "Doe", birthday: new Date("1990-01-01") };

      usersRepository.findUserById.mockResolvedValue(user);
      costsClient.getUserTotalCosts.mockResolvedValue(150.5);

      const result = await usersService.getUserById("1");

      expect(usersRepository.findUserById).toHaveBeenCalledWith(1);
      expect(costsClient.getUserTotalCosts).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, first_name: "John", last_name: "Doe", total: 150.5 });
    });

    it("should throw NotFoundError when user does not exist", async () => {
      usersRepository.findUserById.mockResolvedValue(null);

      await expect(usersService.getUserById("999")).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError when id is not a number", async () => {
      await expect(usersService.getUserById("abc")).rejects.toThrow(ValidationError);
    });

    it("should throw ServiceError with 503 when costs-service is unavailable", async () => {
      const user = { id: 1, first_name: "John", last_name: "Doe", birthday: new Date("1990-01-01") };
      usersRepository.findUserById.mockResolvedValue(user);

      const error = new Error("connect ECONNREFUSED");
      error.code = "ECONNREFUSED";
      costsClient.getUserTotalCosts.mockRejectedValue(error);

      await expect(usersService.getUserById("1")).rejects.toThrow(ServiceError);
      try {
        await usersService.getUserById("1");
      } catch (err) {
        expect(err.status).toBe(503);
      }
    });

    it("should throw ServiceError with 503 when costs-service times out", async () => {
      const user = { id: 1, first_name: "John", last_name: "Doe", birthday: new Date("1990-01-01") };
      usersRepository.findUserById.mockResolvedValue(user);

      const error = new Error("timeout");
      error.code = "ETIMEDOUT";
      costsClient.getUserTotalCosts.mockRejectedValue(error);

      await expect(usersService.getUserById("1")).rejects.toThrow(ServiceError);
      try {
        await usersService.getUserById("1");
      } catch (err) {
        expect(err.status).toBe(503);
      }
    });

    it("should throw ServiceError with 502 when costs-service returns error response", async () => {
      const user = { id: 1, first_name: "John", last_name: "Doe", birthday: new Date("1990-01-01") };
      usersRepository.findUserById.mockResolvedValue(user);

      const error = new Error("Request failed");
      error.response = { status: 400, statusText: "Bad Request" };
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

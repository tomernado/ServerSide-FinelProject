// Logs service unit tests
// Tests for log creation and retrieval: createLog, getAllLogs
// Validates field requirements, data types, and optional field handling
// Mocks logs repository for isolated service layer testing

const logsService = require("../../src/app/services/log_service");
const logsRepository = require("../../src/app/repositories/logs_repository");
const { ValidationError } = require("../../src/errors/validation_error");

// Mocking the data access layer to isolate the service logic
jest.mock("../../src/app/repositories/logs_repository");

describe("Logs Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createLog", () => {
    it("should create a log successfully with valid data", async () => {
      const logData = { level: "info", message: "Test log message", timestamp: new Date() };
      const savedLog = { _id: "log123", ...logData };

      logsRepository.createLog.mockResolvedValue(savedLog);

      const result = await logsService.createLog(logData);

      expect(logsRepository.createLog).toHaveBeenCalledWith(expect.objectContaining({
        level: "info",
        message: "Test log message"
      }));
      expect(result).toEqual(expect.objectContaining({ _id: "log123", level: "info" }));
    });

    it("should throw ValidationError when level is missing", async () => {
      const logData = { message: "Test log message", timestamp: new Date() };
      await expect(logsService.createLog(logData)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when message is missing", async () => {
      const logData = { level: "info", timestamp: new Date() };
      await expect(logsService.createLog(logData)).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when level is invalid", async () => {
      const logData = { level: "invalid_level", message: "Test log", timestamp: new Date() };
      await expect(logsService.createLog(logData)).rejects.toThrow(/Field 'level' must be one of/);
    });

    it("should throw ValidationError when timestamp is invalid", async () => {
      const logData = { level: "info", message: "Test log", timestamp: "invalid-date" };
      await expect(logsService.createLog(logData)).rejects.toThrow(ValidationError);
    });

    it("should create log with all optional fields", async () => {
      const logData = {
        level: "error", message: "API error", timestamp: new Date(),
        method: "GET", url: "/api/users", statusCode: 500, responseTime: 150
      };
      const savedLog = { _id: "log456", ...logData };

      logsRepository.createLog.mockResolvedValue(savedLog);

      const result = await logsService.createLog(logData);

      expect(logsRepository.createLog).toHaveBeenCalledWith(expect.objectContaining(logData));
      expect(result.method).toBe("GET");
      expect(result.statusCode).toBe(500);
    });
  });

  describe("getAllLogs", () => {
    it("should return all logs", async () => {
      const logs = [
        { _id: "log1", level: "info", message: "Log 1", timestamp: new Date() },
        { _id: "log2", level: "error", message: "Log 2", timestamp: new Date() }
      ];

      logsRepository.findAllLogs.mockResolvedValue(logs);

      const result = await logsService.getAllLogs();

      expect(logsRepository.findAllLogs).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].level).toBe("info");
    });

    it("should return empty array when no logs exist", async () => {
      logsRepository.findAllLogs.mockResolvedValue([]);
      
      const result = await logsService.getAllLogs();
      
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should sort logs by timestamp newest first", async () => {
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);
      const latest = new Date(now.getTime() + 1000);

      const logs = [
        { _id: "log1", level: "info", message: "Latest", timestamp: latest },
        { _id: "log2", level: "error", message: "Earlier", timestamp: earlier }
      ];

      // Note: The actual sorting logic is handled in the Repository using .sort({ timestamp: -1 })
      // This test ensures the Service preserves the order returned by the mocked Repository.
      logsRepository.findAllLogs.mockResolvedValue(logs);

      const result = await logsService.getAllLogs();

      expect(result[0].timestamp).toEqual(latest);
      expect(result[1].timestamp).toEqual(earlier);
    });
  });
});
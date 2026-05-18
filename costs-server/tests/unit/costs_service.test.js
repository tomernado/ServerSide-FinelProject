jest.mock("../../src/app/repositories/costs_repository");
jest.mock("../../src/clients/users_client");

const costsService = require("../../src/app/services/costs_service");
const costsRepository = require("../../src/app/repositories/costs_repository");
const usersClient = require("../../src/clients/users_client");
const { ValidationError } = require("../../src/errors/validation_error");
const { NotFoundError } = require("../../src/errors/not_found_error");
const { ServiceError } = require("../../src/errors/service_error");

// Use the real validateData so Mongoose schema validation remains active in tests
// while all DB operations (createCost, find, etc.) stay mocked
const { validateData: realValidateData } = jest.requireActual(
  "../../src/app/repositories/costs_repository"
);

describe("Costs Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    costsRepository.validateData.mockImplementation(realValidateData);
  });

  describe("createCost", () => {
    it("should create cost successfully with valid data", async () => {
      const costData = {
        description: "Lunch",
        category: "food",
        userid: 1,
        sum: 50,
      };

      const savedCost = {
        _id: "507f1f77bcf86cd799439011",
        description: "Lunch",
        category: "food",
        userid: 1,
        sum: 50,
        createdAt: new Date(),
      };

      usersClient.checkUserExists.mockResolvedValue(true);
      costsRepository.createCost.mockResolvedValue(savedCost);

      const result = await costsService.createCost(costData, "req-123");

      expect(costsRepository.createCost).toHaveBeenCalledWith({
        description: "Lunch",
        category: "food",
        userid: 1,
        sum: 50,
        createdAt: expect.any(Date),
      });
      expect(result).toEqual(savedCost);
    });

    it("should throw ValidationError when description is missing", async () => {
      const costData = {
        category: "food",
        userid: 1,
        sum: 50,
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when description is not a string", async () => {
      const costData = {
        description: null,
        category: "food",
        userid: 1,
        sum: 50,
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when category is missing", async () => {
      const costData = {
        description: "Lunch",
        userid: 1,
        sum: 50,
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when category is not a string", async () => {
      const costData = {
        description: "Lunch",
        category: null,
        userid: 1,
        sum: 50,
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when userid is missing", async () => {
      const costData = {
        description: "Lunch",
        category: "food",
        sum: 50,
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when userid is not a number", async () => {
      const costData = {
        description: "Lunch",
        category: "food",
        userid: "not-a-number",
        sum: 50,
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when sum is missing", async () => {
      const costData = {
        description: "Lunch",
        category: "food",
        userid: 1,
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when sum is not a number", async () => {
      const costData = {
        description: "Lunch",
        category: "food",
        userid: 1,
        sum: "not-a-number",
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when sum is zero or negative", async () => {
      const costData = {
        description: "Lunch",
        category: "food",
        userid: 1,
        sum: 0,
      };

      await expect(
        costsService.createCost(costData, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should trim whitespace from description and category", async () => {
      const costData = {
        description: "  Lunch  ",
        category: "  food  ",
        userid: 1,
        sum: 50,
      };

      const savedCost = {
        _id: "507f1f77bcf86cd799439011",
        description: "Lunch",
        category: "food",
        userid: 1,
        sum: 50,
        createdAt: new Date(),
      };

      usersClient.checkUserExists.mockResolvedValue(true);
      costsRepository.createCost.mockResolvedValue(savedCost);

      await costsService.createCost(costData, "req-123");

      expect(costsRepository.createCost).toHaveBeenCalledWith({
        description: "Lunch",
        category: "food",
        userid: 1,
        sum: 50,
        createdAt: expect.any(Date),
      });
    });
  });

  describe("getMonthlyReport", () => {
    it("should throw NotFoundError when user does not exist", async () => {
      usersClient.checkUserExists.mockResolvedValue(false);

      await expect(
        costsService.getMonthlyReport({
          id: 999,
          year: 2025,
          month: 6,
        })
      ).rejects.toThrow(NotFoundError);

      await expect(
        costsService.getMonthlyReport({
          id: 999,
          year: 2025,
          month: 6,
        })
      ).rejects.toThrow("User with id 999 not found");

      expect(usersClient.checkUserExists).toHaveBeenCalledWith(999);
    });

    it("should throw ServiceError when users service is unavailable", async () => {
      const error = new Error("connect ECONNREFUSED");
      error.code = "ECONNREFUSED";
      usersClient.checkUserExists.mockRejectedValue(error);

      await expect(
        costsService.getMonthlyReport({
          id: 1,
          year: 2025,
          month: 6,
        })
      ).rejects.toThrow(ServiceError);
    });

    it("should return cached report when available and user exists", async () => {
      const mockCachedReport = {
        userid: 1,
        year: 2025,
        month: 1,
        costs: [
          {
            food: [
              { sum: 50, description: "lunch", day: 5 },
              { sum: 30, description: "snack", day: 10 },
            ],
            education: [],
            health: [],
            housing: [],
            sports: [],
          },
        ],
      };

      usersClient.checkUserExists.mockResolvedValue(true);
      costsRepository.getMonthlyReportFromCache.mockResolvedValue({
        costs: mockCachedReport.costs,
      });

      const result = await costsService.getMonthlyReport(
        {
          id: 1,
          year: 2025,
          month: 1,
        },
        "req-123"
      );

      expect(costsRepository.getMonthlyReportFromCache).toHaveBeenCalledWith(
        1,
        2025,
        1
      );
      expect(costsRepository.getCostsByMonthAggregation).not.toHaveBeenCalled();
      expect(result).toEqual({
        userid: 1,
        year: 2025,
        month: 1,
        costs: mockCachedReport.costs,
      });
    });

    it("should generate and cache report when not cached and user exists", async () => {
      const freshReport = [
        {
          food: [
            { sum: 100, description: "pizza", day: 3 },
            { sum: 50, description: "burger", day: 15 },
          ],
          education: [{ sum: 200, description: "book", day: 8 }],
          health: [],
          housing: [],
          sports: [],
        },
      ];

      usersClient.checkUserExists.mockResolvedValue(true);
      costsRepository.getMonthlyReportFromCache.mockResolvedValue(null);
      costsRepository.getCostsByMonthAggregation.mockResolvedValue(freshReport);
      costsRepository.cacheMonthlyReport.mockResolvedValue({
        costs: freshReport,
      });

      const result = await costsService.getMonthlyReport(
        {
          id: 2,
          year: 2024,
          month: 12,
        },
        "req-123"
      );

      expect(costsRepository.getCostsByMonthAggregation).toHaveBeenCalledWith(
        2,
        2024,
        12
      );
      expect(costsRepository.cacheMonthlyReport).toHaveBeenCalledWith(
        2,
        2024,
        12,
        freshReport
      );
      expect(result).toEqual({
        userid: 2,
        year: 2024,
        month: 12,
        costs: freshReport,
      });
    });

    it("should throw ValidationError when id is missing", async () => {
      await expect(
        costsService.getMonthlyReport(
          {
            year: 2025,
            month: 1,
          },
          "req-123"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when year is missing", async () => {
      await expect(
        costsService.getMonthlyReport(
          {
            id: 1,
            month: 1,
          },
          "req-123"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when month is missing", async () => {
      await expect(
        costsService.getMonthlyReport(
          {
            id: 1,
            year: 2025,
          },
          "req-123"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when year is invalid", async () => {
      await expect(
        costsService.getMonthlyReport(
          {
            id: 1,
            year: 1800,
            month: 1,
          },
          "req-123"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when month is out of range", async () => {
      await expect(
        costsService.getMonthlyReport(
          {
            id: 1,
            year: 2025,
            month: 13,
          },
          "req-123"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when month is zero", async () => {
      await expect(
        costsService.getMonthlyReport(
          {
            id: 1,
            year: 2025,
            month: 0,
          },
          "req-123"
        )
      ).rejects.toThrow(ValidationError);
    });

    it("should convert string parameters to numbers", async () => {
      const cachedData = [
        {
          food: [],
          education: [],
          health: [],
          housing: [],
          sports: [],
        },
      ];

      usersClient.checkUserExists.mockResolvedValue(true);
      costsRepository.getMonthlyReportFromCache.mockResolvedValue(null);
      costsRepository.getCostsByMonthAggregation.mockResolvedValue(cachedData);
      costsRepository.cacheMonthlyReport.mockResolvedValue({
        costs: cachedData,
      });

      const result = await costsService.getMonthlyReport(
        {
          id: "1",
          year: "2025",
          month: "6",
        },
        "req-123"
      );

      expect(costsRepository.getCostsByMonthAggregation).toHaveBeenCalledWith(
        1,
        2025,
        6
      );
      expect(result).toEqual({
        userid: 1,
        year: 2025,
        month: 6,
        costs: cachedData,
      });
    });
  });

  describe("getUserTotalCosts", () => {
    it("should return total costs for a user", async () => {
      costsRepository.getCostsTotalByUserId.mockResolvedValue(1500);

      const result = await costsService.getUserTotalCosts(
        { userId: 1 },
        "req-123"
      );

      expect(costsRepository.getCostsTotalByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        userid: 1,
        total: 1500,
      });
    });

    it("should return zero when user has no costs", async () => {
      costsRepository.getCostsTotalByUserId.mockResolvedValue(0);

      const result = await costsService.getUserTotalCosts(
        { userId: 5 },
        "req-123"
      );

      expect(result).toEqual({
        userid: 5,
        total: 0,
      });
    });

    it("should throw ValidationError when userId is missing", async () => {
      await expect(
        costsService.getUserTotalCosts({}, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when userId is not a number", async () => {
      await expect(
        costsService.getUserTotalCosts({ userId: "not-a-number" }, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when userId is null", async () => {
      await expect(
        costsService.getUserTotalCosts({ userId: null }, "req-123")
      ).rejects.toThrow(ValidationError);
    });

    it("should convert string userId to number", async () => {
      costsRepository.getCostsTotalByUserId.mockResolvedValue(800);

      const result = await costsService.getUserTotalCosts(
        { userId: "2" },
        "req-123"
      );

      expect(costsRepository.getCostsTotalByUserId).toHaveBeenCalledWith(2);
      expect(result).toEqual({
        userid: 2,
        total: 800,
      });
    });
  });
});

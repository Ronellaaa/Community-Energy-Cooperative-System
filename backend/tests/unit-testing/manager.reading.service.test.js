import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockMemberConsumption = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteMany: jest.fn(),
};

const mockPaymentSlip = {
  find: jest.fn(),
};

jest.unstable_mockModule("../../model/feature-3/MemberConsumption.js", () => ({
  default: mockMemberConsumption,
}));

jest.unstable_mockModule("../../model/feature-3/PaymentSlip.js", () => ({
  default: mockPaymentSlip,
}));

const {
  getPreviousBillingPeriod,
  getPreviousReading,
  getPreviousReadingDetails,
  saveReading,
  getReadingsByPeriod,
  getMemberHistory,
  getMemberHistoryByCommunity,
  getReadingById,
  getReadingByPeriod,
  updateReadingById,
  patchReadingById,
  patchReadingByPeriod,
  deleteReadingById,
  deleteReadingsByPeriod,
} = await import("../../service/feature-3/manager.reading.service.js");

describe("Manager Reading Service Unit Tests", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPreviousBillingPeriod", () => {
    
    test("should return previous month in same year for months > 1", () => {
      const result = getPreviousBillingPeriod(5, 2024);
      
      expect(result).toEqual({
        previousMonth: 4,
        previousYear: 2024
      });
    });

    test("should return December of previous year for January", () => {
      const result = getPreviousBillingPeriod(1, 2024);
      
      expect(result).toEqual({
        previousMonth: 12,
        previousYear: 2023
      });
    });

    test("should handle year transition correctly", () => {
      const result = getPreviousBillingPeriod(1, 2025);
      
      expect(result).toEqual({
        previousMonth: 12,
        previousYear: 2024
      });
    });

  });

  describe("getPreviousReading", () => {
    
    test("should return previous reading when record exists", async () => {
      mockMemberConsumption.findOne.mockResolvedValue({
        currentReading: 1250
      });

      const result = await getPreviousReading("member123", "comm456", 3, 2024);

      expect(mockMemberConsumption.findOne).toHaveBeenCalledWith({
        memberId: "member123",
        communityId: "comm456",
        'billingPeriod.month': 2,
        'billingPeriod.year': 2024
      });
      expect(result).toBe(1250);
    });

    test("should handle January by looking at December of previous year", async () => {
      mockMemberConsumption.findOne.mockResolvedValue({
        currentReading: 1000
      });

      await getPreviousReading("member123", "comm456", 1, 2024);

      expect(mockMemberConsumption.findOne).toHaveBeenCalledWith({
        memberId: "member123",
        communityId: "comm456",
        'billingPeriod.month': 12,
        'billingPeriod.year': 2023
      });
    });

    test("should return null when no previous record exists", async () => {
      mockMemberConsumption.findOne.mockResolvedValue(null);

      const result = await getPreviousReading("member123", "comm456", 3, 2024);

      expect(result).toBeNull();
    });

  });

  describe("getPreviousReadingDetails", () => {
    
    test("should return full details when previous reading exists", async () => {
      mockMemberConsumption.findOne.mockResolvedValue({
        currentReading: 1500
      });

      const result = await getPreviousReadingDetails("member123", "comm456", 3, 2024);

      expect(result).toEqual({
        memberId: "member123",
        communityId: "comm456",
        previousReading: 1500,
        previousReadingFound: true,
        sourceBillingPeriod: { month: 2, year: 2024 }
      });
    });

    test("should return null values when no previous reading exists", async () => {
      mockMemberConsumption.findOne.mockResolvedValue(null);

      const result = await getPreviousReadingDetails("member123", "comm456", 3, 2024);

      expect(result).toEqual({
        memberId: "member123",
        communityId: "comm456",
        previousReading: null,
        previousReadingFound: false,
        sourceBillingPeriod: null
      });
    });

  });

  describe("saveReading", () => {
    
    test("should calculate unitsConsumed and upsert record", async () => {
      const inputData = {
        memberId: "member123",
        communityId: "comm456",
        month: 3,
        year: 2024,
        previousReading: 1000,
        currentReading: 1250
      };

      const expectedSavedRecord = {
        _id: "consumption123",
        ...inputData,
        unitsConsumed: 250,
        amountOwed: 0,
        paymentStatus: "pending"
      };

      mockMemberConsumption.findOneAndUpdate.mockResolvedValue(expectedSavedRecord);

      const result = await saveReading(inputData);

      expect(mockMemberConsumption.findOneAndUpdate).toHaveBeenCalledWith(
        {
          memberId: "member123",
          communityId: "comm456",
          'billingPeriod.month': 3,
          'billingPeriod.year': 2024
        },
        {
          memberId: "member123",
          communityId: "comm456",
          billingPeriod: { month: 3, year: 2024 },
          previousReading: 1000,
          currentReading: 1250,
          unitsConsumed: 250,
          amountOwed: 0,
          paymentStatus: "pending"
        },
        { upsert: true, new: true }
      );
      expect(result).toEqual(expectedSavedRecord);
    });

    test("should handle zero consumption correctly", async () => {
      const inputData = {
        memberId: "member123",
        communityId: "comm456",
        month: 3,
        year: 2024,
        previousReading: 1000,
        currentReading: 1000
      };

      mockMemberConsumption.findOneAndUpdate.mockResolvedValue({});

      await saveReading(inputData);

      expect(mockMemberConsumption.findOneAndUpdate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          unitsConsumed: 0
        }),
        expect.any(Object)
      );
    });

  });

  describe("getReadingsByPeriod", () => {
    
    test("should query readings for specific community and billing period", async () => {
      const mockReadings = [
        { memberId: "m1", currentReading: 100 },
        { memberId: "m2", currentReading: 200 }
      ];
      mockMemberConsumption.find.mockResolvedValue(mockReadings);

      const result = await getReadingsByPeriod("comm456", 3, 2024);

      expect(mockMemberConsumption.find).toHaveBeenCalledWith({
        communityId: "comm456",
        'billingPeriod.month': 3,
        'billingPeriod.year': 2024
      });
      expect(result).toEqual(mockReadings);
    });

    test("should return empty array when no readings found", async () => {
      mockMemberConsumption.find.mockResolvedValue([]);

      const result = await getReadingsByPeriod("comm456", 3, 2024);

      expect(result).toEqual([]);
    });

  });

  describe("getReadingById", () => {
    
    test("should find reading by ID", async () => {
      const mockReading = { _id: "reading123", currentReading: 500 };
      mockMemberConsumption.findById.mockResolvedValue(mockReading);

      const result = await getReadingById("reading123");

      expect(mockMemberConsumption.findById).toHaveBeenCalledWith("reading123");
      expect(result).toEqual(mockReading);
    });

    test("should return null if reading not found", async () => {
      mockMemberConsumption.findById.mockResolvedValue(null);

      const result = await getReadingById("nonexistent");

      expect(result).toBeNull();
    });

  });

  describe("getReadingByPeriod", () => {
    
    test("should find reading by member, community, and period", async () => {
      const mockReading = { _id: "reading123", currentReading: 750 };
      mockMemberConsumption.findOne.mockResolvedValue(mockReading);

      const result = await getReadingByPeriod("member123", "comm456", 3, 2024);

      expect(mockMemberConsumption.findOne).toHaveBeenCalledWith({
        memberId: "member123",
        communityId: "comm456",
        'billingPeriod.month': 3,
        'billingPeriod.year': 2024
      });
      expect(result).toEqual(mockReading);
    });

  });

  describe("updateReadingById", () => {
    
    test("should fully update a reading by ID", async () => {
      const updateData = {
        previousReading: 1000,
        currentReading: 1250,
        unitsConsumed: 250,
        amountOwed: 50,
        paymentStatus: "paid"
      };

      const mockUpdated = { _id: "reading123", ...updateData };
      mockMemberConsumption.findByIdAndUpdate.mockResolvedValue(mockUpdated);

      const result = await updateReadingById("reading123", updateData);

      expect(mockMemberConsumption.findByIdAndUpdate).toHaveBeenCalledWith(
        "reading123",
        updateData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockUpdated);
    });

  });

  describe("patchReadingById", () => {
    
    test("should partially update a reading by ID", async () => {
      const patchData = { paymentStatus: "paid", amountOwed: 0 };
      const mockPatched = { _id: "reading123", paymentStatus: "paid" };
      mockMemberConsumption.findByIdAndUpdate.mockResolvedValue(mockPatched);

      const result = await patchReadingById("reading123", patchData);

      expect(mockMemberConsumption.findByIdAndUpdate).toHaveBeenCalledWith(
        "reading123",
        patchData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockPatched);
    });

  });

  describe("patchReadingByPeriod", () => {
    
    test("should partially update a reading by member and period", async () => {
      const patchData = { paymentStatus: "paid" };
      const mockPatched = { _id: "reading123", paymentStatus: "paid" };
      mockMemberConsumption.findOneAndUpdate.mockResolvedValue(mockPatched);

      const result = await patchReadingByPeriod(
        "member123", "comm456", 3, 2024, patchData
      );

      expect(mockMemberConsumption.findOneAndUpdate).toHaveBeenCalledWith(
        {
          memberId: "member123",
          communityId: "comm456",
          'billingPeriod.month': 3,
          'billingPeriod.year': 2024
        },
        patchData,
        { new: true, runValidators: true }
      );
      expect(result).toEqual(mockPatched);
    });

  });

  describe("deleteReadingById", () => {
    
    test("should delete a reading by ID", async () => {
      const mockDeleted = { _id: "reading123", currentReading: 500 };
      mockMemberConsumption.findByIdAndDelete.mockResolvedValue(mockDeleted);

      const result = await deleteReadingById("reading123");

      expect(mockMemberConsumption.findByIdAndDelete).toHaveBeenCalledWith("reading123");
      expect(result).toEqual(mockDeleted);
    });

  });

  describe("deleteReadingsByPeriod", () => {
    
    test("should delete all readings for a specific period", async () => {
      const deleteResult = { deletedCount: 5 };
      mockMemberConsumption.deleteMany.mockResolvedValue(deleteResult);

      const result = await deleteReadingsByPeriod("comm456", 3, 2024);

      expect(mockMemberConsumption.deleteMany).toHaveBeenCalledWith({
        communityId: "comm456",
        'billingPeriod.month': 3,
        'billingPeriod.year': 2024
      });
      expect(result).toEqual(deleteResult);
    });

  });

  describe("getMemberHistory", () => {
    
    test("should return empty array when no history exists", async () => {
      mockMemberConsumption.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const result = await getMemberHistory("member123");

      expect(result).toEqual([]);
    });

    test("should attach latest payment slip to each record", async () => {
      const mockRecords = [
        { 
          _id: "rec1", 
          toObject: () => ({ _id: "rec1", currentReading: 100 }),
        },
        { 
          _id: "rec2", 
          toObject: () => ({ _id: "rec2", currentReading: 200 }),
        }
      ];

      const mockSlips = [
        { _id: "slip1", memberConsumptionId: "rec1", amount: 50 },
        { _id: "slip2", memberConsumptionId: "rec1", amount: 30 },
        { _id: "slip3", memberConsumptionId: "rec2", amount: 75 },
      ];

      mockMemberConsumption.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords)
      });

      mockPaymentSlip.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSlips)
        })
      });

      const result = await getMemberHistory("member123");

      expect(mockPaymentSlip.find).toHaveBeenCalledWith({
        memberConsumptionId: { $in: ["rec1", "rec2"] }
      });
      
      expect(result[0].latestPaymentSlip).toEqual(mockSlips[0]);
      expect(result[1].latestPaymentSlip).toEqual(mockSlips[2]);
    });

    test("should set latestPaymentSlip to null when no slip exists", async () => {
      const mockRecords = [
        { 
          _id: "rec1", 
          toObject: () => ({ _id: "rec1", currentReading: 100 }),
        }
      ];

      mockMemberConsumption.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords)
      });

      mockPaymentSlip.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      });

      const result = await getMemberHistory("member123");

      expect(result[0].latestPaymentSlip).toBeNull();
    });

  });

  describe("getMemberHistoryByCommunity", () => {
    
    test("should filter history by community and sort descending", async () => {
      const mockRecords = [
        { 
          _id: "rec1", 
          toObject: () => ({ _id: "rec1", communityId: "comm456" }),
        }
      ];

      mockMemberConsumption.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRecords)
      });

      mockPaymentSlip.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([])
        })
      });

      await getMemberHistoryByCommunity("member123", "comm456");

      expect(mockMemberConsumption.find).toHaveBeenCalledWith({
        memberId: "member123",
        communityId: "comm456"
      });
    });

  });

});
import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";

const mockCommunityBill = {
  findOne: jest.fn(),
};

const mockCommunityBillInstance = {
  save: jest.fn().mockResolvedValue(true),
};

const mockMemberConsumption = {
  find: jest.fn(),
  findById: jest.fn(),
};

const mockMemberConsumptionInstance = {
  save: jest.fn().mockResolvedValue(true),
};

const mockPaymentSlip = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockPaymentSlipInstance = {
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({}),
};

const mockHandleImgService = {
  uploadToCloudinary: jest.fn(),
  deleteFromCloudinary: jest.fn(),
};

jest.unstable_mockModule("../../model/feature-3/CommunityBill.js", () => ({
  default: mockCommunityBill,
}));

jest.unstable_mockModule("../../model/feature-3/MemberConsumption.js", () => ({
  default: mockMemberConsumption,
}));

jest.unstable_mockModule("../../model/feature-3/PaymentSlip.js", () => ({
  default: mockPaymentSlip,
}));

jest.unstable_mockModule("../../service/feature-3/handleImgService.js", () => mockHandleImgService);

const {
  createPaymentSlip,
  getAdminPaymentSlips,
  getAdminPaymentSlipById,
  updatePaymentSlipStatus,
  deletePaymentSlipAssets,
} = await import("../../service/feature-3/payment.slip.service.js");

describe("Payment Slip Service Unit Tests", () => {
  
  const validObjectId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
  const validObjectId2 = new mongoose.Types.ObjectId("507f1f77bcf86cd799439012");

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPaymentSlip.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    });
  });

  describe("createPaymentSlip", () => {
    
    test("should throw error if file is not provided", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      await expect(createPaymentSlip(paymentData, null))
        .rejects
        .toThrow("Payment slip image is required");
    });

    test("should throw error if memberConsumptionId is missing", async () => {
      const paymentData = {
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      await expect(createPaymentSlip(paymentData, {})).rejects.toThrow("memberConsumptionId is required");
    });

    test("should throw error if userId is missing", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      await expect(createPaymentSlip(paymentData, {})).rejects.toThrow("userId is required");
    });

    test("should throw error if amountPaid is invalid", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 0,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      await expect(createPaymentSlip(paymentData, {}))
        .rejects
        .toThrow("amountPaid must be greater than 0");
    });

    test("should throw error if referenceNumber is missing", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "",
        payerName: "John Doe",
      };

      await expect(createPaymentSlip(paymentData, {}))
        .rejects
        .toThrow("referenceNumber is required");
    });

    test("should throw error if member consumption record not found", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      mockMemberConsumption.findById.mockResolvedValue(null);

      await expect(createPaymentSlip(paymentData, {}))
        .rejects
        .toThrow("Member consumption record not found");
    });

    test("should throw error if payment already completed", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      mockMemberConsumption.findById.mockResolvedValue({
        _id: validObjectId,
        memberId: validObjectId2,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountOwed: 100,
        paidAmount: 100,
      });

      await expect(createPaymentSlip(paymentData, {}))
        .rejects
        .toThrow("This payment has already been completed");
    });

    test("should throw error if payment does not belong to user", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      const differentUserId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439099");
      
      mockMemberConsumption.findById.mockResolvedValue({
        _id: validObjectId,
        memberId: differentUserId,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountOwed: 100,
        paidAmount: 0,
      });

      await expect(createPaymentSlip(paymentData, {}))
        .rejects
        .toThrow("This payment does not belong to the provided user");
    });

    test("should throw error if amount does not match amount owed", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 50,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      mockMemberConsumption.findById.mockResolvedValue({
        _id: validObjectId,
        memberId: validObjectId2,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountOwed: 100,
        paidAmount: 0,
      });

      mockPaymentSlip.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      await expect(createPaymentSlip(paymentData, {}))
        .rejects
        .toThrow("Payment slip amount must match the amount owed exactly (100)");
    });

    test("should throw error if pending slip already exists", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      mockMemberConsumption.findById.mockResolvedValue({
        _id: validObjectId,
        memberId: validObjectId2,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountOwed: 100,
        paidAmount: 0,
      });

      mockPaymentSlip.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({ status: "pending" }),
      });

      await expect(createPaymentSlip(paymentData, {}))
        .rejects
        .toThrow("A payment slip is already pending review for this record");
    });

    test("should throw error if approved slip already exists", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
      };

      mockMemberConsumption.findById.mockResolvedValue({
        _id: validObjectId,
        memberId: validObjectId2,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountOwed: 100,
        paidAmount: 0,
      });

      mockPaymentSlip.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({ status: "approved" }),
      });

      await expect(createPaymentSlip(paymentData, {}))
        .rejects
        .toThrow("A payment slip has already been approved for this record");
    });

    test("should create payment slip successfully", async () => {
      const paymentData = {
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        amountPaid: 100,
        paymentDate: "2024-03-15",
        referenceNumber: "REF123",
        payerName: "John Doe",
        notes: "Test payment",
      };

      const mockFile = { path: "test.jpg" };
      const mockUploadResult = { url: "http://cloudinary.com/test.jpg", publicId: "test123" };

      mockMemberConsumption.findById.mockResolvedValue({
        _id: validObjectId,
        memberId: validObjectId2,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountOwed: 100,
        paidAmount: 0,
      });

      mockPaymentSlip.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });
      
      mockHandleImgService.uploadToCloudinary.mockResolvedValue(mockUploadResult);

      const mockCreatedSlip = {
        _id: validObjectId,
        ...paymentData,
        slipImage: mockUploadResult,
        status: "pending",
      };

      mockPaymentSlip.create.mockResolvedValue(mockCreatedSlip);

      const result = await createPaymentSlip(paymentData, mockFile);

      expect(mockHandleImgService.uploadToCloudinary).toHaveBeenCalledWith(mockFile, "payment-slips");
      expect(mockPaymentSlip.create).toHaveBeenCalledWith({
        memberConsumptionId: validObjectId,
        userId: validObjectId2,
        memberId: validObjectId2,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountPaid: 100,
        paymentDate: new Date("2024-03-15"),
        referenceNumber: "REF123",
        payerName: "John Doe",
        notes: "Test payment",
        slipImage: mockUploadResult,
        status: "pending",
      });
      expect(result).toEqual(mockCreatedSlip);
    });

  });

  describe("getAdminPaymentSlips", () => {
    
    test("should return all payment slips when no filters provided", async () => {
      const mockSlips = [
        { _id: validObjectId, status: "pending" },
        { _id: validObjectId2, status: "approved" },
      ];

      mockPaymentSlip.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSlips),
        }),
      });

      const result = await getAdminPaymentSlips();

      expect(result).toEqual(mockSlips);
    });

    test("should filter by status when provided", async () => {
      const mockSlips = [{ _id: validObjectId, status: "pending" }];

      mockPaymentSlip.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockSlips),
        }),
      });

      const result = await getAdminPaymentSlips({ status: "pending" });

      expect(mockPaymentSlip.find).toHaveBeenCalledWith({ status: "pending" });
      expect(result).toEqual(mockSlips);
    });

  });

  describe("getAdminPaymentSlipById", () => {
    
    test("should return payment slip by ID", async () => {
      const mockSlip = { _id: validObjectId, status: "pending" };

      mockPaymentSlip.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockSlip),
      });

      const result = await getAdminPaymentSlipById(validObjectId);

      expect(mockPaymentSlip.findById).toHaveBeenCalledWith(validObjectId);
      expect(result).toEqual(mockSlip);
    });

    test("should throw error if payment slip not found", async () => {
      mockPaymentSlip.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(getAdminPaymentSlipById(validObjectId))
        .rejects
        .toThrow("Payment slip not found");
    });

  });

  describe("updatePaymentSlipStatus", () => {
    
    test("should throw error if payment slip not found", async () => {
      mockPaymentSlip.findById.mockResolvedValue(null);

      await expect(updatePaymentSlipStatus(validObjectId, { status: "approved" }))
        .rejects
        .toThrow("Payment slip not found");
    });

    test("should throw error if slip is already processed", async () => {
      mockPaymentSlip.findById.mockResolvedValue({
        _id: validObjectId,
        status: "approved",
      });

      await expect(updatePaymentSlipStatus(validObjectId, { status: "rejected" }))
        .rejects
        .toThrow("Payment slip is already approved. Cannot change to rejected");
    });

    test("should approve payment slip successfully", async () => {
      const mockSlip = {
        _id: validObjectId,
        memberConsumptionId: validObjectId2,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountPaid: 100,
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: validObjectId,
          status: "approved",
        }),
      };

      const mockConsumption = {
        _id: validObjectId2,
        amountOwed: 100,
        paidAmount: 0,
        paymentStatus: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      mockPaymentSlip.findById.mockResolvedValue(mockSlip);
      mockMemberConsumption.findById.mockResolvedValue(mockConsumption);
      mockMemberConsumption.find.mockResolvedValue([mockConsumption]);
      mockCommunityBill.findOne.mockResolvedValue({
        ...mockCommunityBillInstance,
        paymentStatus: "pending",
      });

      const result = await updatePaymentSlipStatus(validObjectId, { status: "approved" });

      expect(mockSlip.status).toBe("approved");
      expect(mockSlip.rejectionReason).toBeNull();
      expect(mockSlip.reviewedBy).toBe("admin");
      expect(mockSlip.save).toHaveBeenCalled();

      expect(mockConsumption.paymentStatus).toBe("paid");
      expect(mockConsumption.paidAmount).toBe(100);
      expect(mockConsumption.save).toHaveBeenCalled();

      expect(result.message).toBe("Payment slip approved successfully");
    });

    test("should reject payment slip with reason", async () => {
      const mockSlip = {
        _id: validObjectId,
        memberConsumptionId: validObjectId2,
        communityId: validObjectId,
        billingPeriod: { month: 3, year: 2024 },
        amountPaid: 100,
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: validObjectId,
          status: "rejected",
        }),
      };

      const mockConsumption = {
        _id: validObjectId2,
        amountOwed: 100,
        paidAmount: 0,
        paymentStatus: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      mockPaymentSlip.findById.mockResolvedValue(mockSlip);
      mockMemberConsumption.findById.mockResolvedValue(mockConsumption);
      mockMemberConsumption.find.mockResolvedValue([mockConsumption]);
      mockCommunityBill.findOne.mockResolvedValue({
        ...mockCommunityBillInstance,
        paymentStatus: "pending",
      });

      const result = await updatePaymentSlipStatus(validObjectId, {
        status: "rejected",
        rejectionReason: "Invalid slip image",
      });

      expect(mockSlip.status).toBe("rejected");
      expect(mockSlip.rejectionReason).toBe("Invalid slip image");
      expect(mockSlip.save).toHaveBeenCalled();

      expect(mockConsumption.paymentStatus).toBe("pending");
      expect(mockConsumption.paidAmount).toBe(0);
      expect(mockConsumption.save).toHaveBeenCalled();

      expect(result.message).toBe("Payment slip rejected successfully");
    });

    test("should throw error if rejecting without reason", async () => {
      const mockSlip = {
        _id: validObjectId,
        status: "pending",
      };

      mockPaymentSlip.findById.mockResolvedValue(mockSlip);

      await expect(updatePaymentSlipStatus(validObjectId, { status: "rejected" }))
        .rejects
        .toThrow("Rejection reason is required when rejecting a payment slip");
    });

  });

  describe("deletePaymentSlipAssets", () => {
    
    test("should delete cloudinary image if publicId exists", async () => {
      const mockSlip = {
        slipImage: {
          publicId: "test-public-id",
          url: "http://cloudinary.com/test.jpg",
        },
      };

      mockHandleImgService.deleteFromCloudinary.mockResolvedValue(true);

      await deletePaymentSlipAssets(mockSlip);

      expect(mockHandleImgService.deleteFromCloudinary).toHaveBeenCalledWith("test-public-id");
    });

    test("should not call delete if no slip image", async () => {
      const mockSlip = {};

      await deletePaymentSlipAssets(mockSlip);

      expect(mockHandleImgService.deleteFromCloudinary).not.toHaveBeenCalled();
    });

    test("should not call delete if no publicId", async () => {
      const mockSlip = {
        slipImage: {
          url: "http://cloudinary.com/test.jpg",
        },
      };

      await deletePaymentSlipAssets(mockSlip);

      expect(mockHandleImgService.deleteFromCloudinary).not.toHaveBeenCalled();
    });

  });

});
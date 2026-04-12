import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockQRCode = {
  toBuffer: jest.fn(),
};

const mockCloudinaryUploader = {
  upload: jest.fn(),
};

const mockCloudinaryApi = {
  resource: jest.fn(),
};

const mockCloudinary = {
  uploader: mockCloudinaryUploader,
  api: mockCloudinaryApi,
};


jest.unstable_mockModule("qrcode", () => ({
  default: mockQRCode,
}));

jest.unstable_mockModule("cloudinary", () => ({
  default: mockCloudinary,
}));


const { generateAndUploadQR, getQRUrl } = await import(
  "../../service/feature-3/qrService.js"
);

describe("QR Service Unit Tests", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe("generateAndUploadQR", () => {
    
    test("should generate QR buffer with correct content and dimensions", async () => {
      
      const mockBuffer = Buffer.from("fake-qr-data");
      mockQRCode.toBuffer.mockResolvedValue(mockBuffer);
      mockCloudinaryUploader.upload.mockResolvedValue({
        secure_url: "https://cloudinary.com/fake-url.png"
      });

      
      await generateAndUploadQR("member123", "community456");

      
      expect(mockQRCode.toBuffer).toHaveBeenCalledTimes(1);
      expect(mockQRCode.toBuffer).toHaveBeenCalledWith(
        "member123|community456",
        { width: 300, margin: 2 }
      );
    });

    test("should upload base64 image to Cloudinary with correct folder structure", async () => {
      // Arrange
      const mockBuffer = Buffer.from("fake-qr-data");
      mockQRCode.toBuffer.mockResolvedValue(mockBuffer);
      mockCloudinaryUploader.upload.mockResolvedValue({
        secure_url: "https://cloudinary.com/fake-url.png"
      });

      // Act
      await generateAndUploadQR("member123", "community456");

      // Assert
      expect(mockCloudinaryUploader.upload).toHaveBeenCalledTimes(1);
      expect(mockCloudinaryUploader.upload).toHaveBeenCalledWith(
        `data:image/png;base64,${mockBuffer.toString("base64")}`,
        {
          folder: "community_qrs/community456",
          public_id: "member123"
        }
      );
    });

    test("should return the secure URL from Cloudinary", async () => {
      
      mockQRCode.toBuffer.mockResolvedValue(Buffer.from("fake"));
      mockCloudinaryUploader.upload.mockResolvedValue({
        secure_url: "https://res.cloudinary.com/demo/image/upload/v123/member123.png"
      });

      
      const url = await generateAndUploadQR("member123", "community456");

      
      expect(url).toBe("https://res.cloudinary.com/demo/image/upload/v123/member123.png");
    });

  });


  describe("getQRUrl", () => {
    
    test("should return existing URL if QR code already exists in Cloudinary", async () => {
      
      mockCloudinaryApi.resource.mockResolvedValue({
        secure_url: "https://cloudinary.com/existing-qr.png"
      });

      
      const url = await getQRUrl("existingMember", "community456");

      
      expect(mockCloudinaryApi.resource).toHaveBeenCalledWith(
        "community_qrs/community456/existingMember"
      );
      expect(url).toBe("https://cloudinary.com/existing-qr.png");
      
      // Verify it did NOT try to generate a new QR code
      expect(mockQRCode.toBuffer).not.toHaveBeenCalled();
      expect(mockCloudinaryUploader.upload).not.toHaveBeenCalled();
    });

    test("should generate new QR if resource is not found (404 error)", async () => {
      
      const notFoundError = new Error("Resource not found");
      notFoundError.http_code = 404;
      mockCloudinaryApi.resource.mockRejectedValue(notFoundError);
      
      mockQRCode.toBuffer.mockResolvedValue(Buffer.from("new-fake-qr"));
      mockCloudinaryUploader.upload.mockResolvedValue({
        secure_url: "https://cloudinary.com/newly-generated.png"
      });

      
      const url = await getQRUrl("newMember", "community789");

      
      expect(mockCloudinaryApi.resource).toHaveBeenCalledWith(
        "community_qrs/community789/newMember"
      );
      expect(mockQRCode.toBuffer).toHaveBeenCalledTimes(1);
      expect(url).toBe("https://cloudinary.com/newly-generated.png");
    });

  });

});
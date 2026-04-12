import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockJwt = {
  verify: jest.fn(),
};

const mockUser = {
  findById: jest.fn(),
};

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: mockJwt,
}));

jest.unstable_mockModule("../../model/User.js", () => ({
  default: mockUser,
}));

const { requireAuth, requireOfficer, requireAdmin } = await import(
  "../../middleware/auth.js"
);

describe("requireAuth", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test("should return 401 if no token is provided", async () => {
    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token is invalid", async () => {
    req.headers.authorization = "Bearer fake-token";
    mockJwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token is valid but user not found", async () => {
    req.headers.authorization = "Bearer valid-token";
    mockJwt.verify.mockReturnValue({ id: "123" });
    mockUser.findById.mockResolvedValue(null);

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token user" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should set req.user and call next if token and user are valid", async () => {
    req.headers.authorization = "Bearer valid-token";
    mockJwt.verify.mockReturnValue({ id: "123" });

    const fakeUser = {
      toObject: () => ({
        _id: "abc123",
        name: "Onella",
        role: "ADMIN",
      }),
    };

    mockUser.findById.mockResolvedValue(fakeUser);

    await requireAuth(req, res, next);

    expect(req.user).toEqual({
      _id: "abc123",
      name: "Onella",
      role: "ADMIN",
    });

    expect(next).toHaveBeenCalled();
  });
});

describe("requireOfficer", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { role: "USER" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test("should return 403 if user is not OFFICER or ADMIN", () => {
    requireOfficer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Officer/Admin only" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next if user is OFFICER", () => {
    req.user.role = "OFFICER";

    requireOfficer(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("should call next if user is ADMIN", () => {
    req.user.role = "ADMIN";

    requireOfficer(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe("requireAdmin", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { role: "USER" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test("should return 403 if user is not ADMIN", () => {
    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Admin only" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next if user is ADMIN", () => {
    req.user.role = "ADMIN";

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
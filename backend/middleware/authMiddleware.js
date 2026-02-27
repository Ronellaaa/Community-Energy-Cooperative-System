// authMiddleware.js
// TEMPORARY version for testing backend without login
export const protect = async (req, res, next) => {
  // Mock admin user
  req.user = {
    _id: "1234567890abcdef",
    name: "Admin Test",
    email: "admin@test.com",
    role: "ADMIN",
    communityId: null,
  };
  next();
};
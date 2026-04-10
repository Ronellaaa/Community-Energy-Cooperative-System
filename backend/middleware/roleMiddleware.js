// roleMiddleware.js
// Keep as-is, will work with mocked req.user
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  next();
};
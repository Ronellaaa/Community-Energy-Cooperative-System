export const validateProject = (req, res, next) => {
  const { name, type, capacityKW, cost } = req.body;

  if (!name || !type || !capacityKW || !cost) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (capacityKW <= 0 || cost <= 0) {
    return res.status(400).json({
      message: "Capacity and cost must be positive numbers",
    });
  }

  next();
};
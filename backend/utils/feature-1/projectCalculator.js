export const calculateProjectMetrics = (capacityKW, tariff = 25) => {
  const monthlyGeneration = capacityKW * 120;
  const monthlySavings = monthlyGeneration * tariff;

  return {
    monthlyGeneration,
    monthlySavings
  };
};
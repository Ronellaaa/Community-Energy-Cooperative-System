const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatBillingPeriod = (billingPeriod = {}) => {
  const { month, year } = billingPeriod;

  if (!month || !year) {
    return "-";
  }

  return `${monthFormatter.format(new Date(year, month - 1, 1))} ${year}`;
};

export const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
};

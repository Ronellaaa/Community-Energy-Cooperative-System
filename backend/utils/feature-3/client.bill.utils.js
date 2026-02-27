export const calculateTotals = (bills) => {
  return bills.reduce((acc, bill) => {
    acc.totalOriginal += bill.totalAmountDue || 0;
    if (bill.status === 'approved') {
      acc.totalReduced += bill.reducedAmount || 0;
      acc.totalCustomerPays += (bill.totalAmountDue - bill.reducedAmount) || 0;
      acc.approvedCount++;
    }
    return acc;
  }, { totalOriginal: 0, totalReduced: 0, totalCustomerPays: 0, approvedCount: 0 });
};
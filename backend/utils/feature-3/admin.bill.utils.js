export const processCreditUsage = async (credits, bill, billAmount) => {
  // Calculate total credits available
  const totalCreditsAvailable = credits.reduce(
    (sum, c) => sum + c.remainingAmount, 0
  );
  
  // Determine how much credit to use (up to bill amount)
  const creditsToUse = Math.min(totalCreditsAvailable, billAmount);
  const finalAmount = billAmount - creditsToUse;
  
  // Apply credits (oldest first)
  let remainingToUse = creditsToUse;
  const usedCredits = [];
  
  console.log(`💰 Processing credits: Need ${creditsToUse} credits`);
  
  for (const credit of credits) {
    if (remainingToUse <= 0) {
      console.log('✅ Target reached, stopping credit usage');
      break;
    }
    
    // Check if this credit was already used for this bill
    const alreadyUsed = credit.usageHistory?.some(
      u => u.billId && u.billId.toString() === bill._id.toString()
    );
    
    if (alreadyUsed) {
      console.log(`⚠️ Credit ${credit._id} already used for this bill, skipping`);
      continue;
    }
    
    const amountToUse = Math.min(credit.remainingAmount, remainingToUse);
    const previousRemaining = credit.remainingAmount;
    
    console.log(`   Using credit ${credit._id}: ${amountToUse} from ${previousRemaining}`);
    
    // Update credit
    credit.remainingAmount -= amountToUse;
    
    // Track usage in history
    if (!credit.usageHistory) credit.usageHistory = [];
    credit.usageHistory.push({
      billId: bill._id,
      amountUsed: amountToUse,
      usedAt: new Date(),
      remainingAfter: credit.remainingAmount
    });
    
    // Keep old fields for backward compatibility
    if (credit.remainingAmount === 0) {
      credit.usedForBillReduction = true;
      credit.billId = bill._id;
      credit.usedAt = new Date();
    }
    
    await credit.save();
    
    usedCredits.push({
      id: credit._id,
      amount: amountToUse,
      originalAmount: credit.originalAmount,
      remainingAfter: credit.remainingAmount,
      month: credit.billingPeriod,
      isFullyUsed: credit.remainingAmount === 0
    });
    
    remainingToUse -= amountToUse;
    console.log(`   Remaining to use: ${remainingToUse}`);
  }
  
  return {
    usedCredits,
    creditsUsed: creditsToUse,
    finalAmount,
    remainingToUse
  };
};
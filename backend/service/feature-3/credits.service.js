import Investment from "../../model/feature-3/Investment.js"; 
import Credit from "../../model/feature-3/Credit.js";
import User from "../../model/feature-3/UserNew.js";
import MemberPayment from "../../model/feature-3/MemberPayment.js";
import FundingRecord from "../../model/feature-3/FundingRecord.js";
import FundingSource from "../../model/feature-3/FundingSource.js";
import EnergySettlement from "../../model/feature-3/EnergySettlement.js";
import mongoose from "mongoose";

export default async function distributeCredits(projectId, billingPeriod) {
  console.log("RAW projectId:", projectId);
  console.log("RAW billingPeriod:", billingPeriod);

  // ---- Convert once at the start ----
  const projectObjectId = new mongoose.Types.ObjectId(projectId);

  // Fetch settlement
  const settlement = await EnergySettlement.findOne({ 
    projectId: projectObjectId, 
    billingPeriod 
  });
  if (!settlement) throw new Error("No settlement found");

  const settlementObjectId = settlement._id;

  // Check if credits already distributed
  const alreadyDistributed = await Credit.findOne({
    projectId: projectObjectId,
    billingPeriod,
    settlementId: settlementObjectId
  });
  if (alreadyDistributed) throw new Error("Credits already distributed for this settlement");

  // ============================================
  // GET MEMBERS from MemberPayments
  // ============================================
  const memberPayments = await MemberPayment.find({
    projectId: projectObjectId
  }).populate("memberId");
  
  // Unique members
  const memberMap = new Map();
  memberPayments.forEach(payment => {
    if (payment.memberId) {
      memberMap.set(payment.memberId._id.toString(), payment.memberId);
    }
  });
  const members = Array.from(memberMap.values());
  console.log(`📋 Found ${members.length} unique members for project`);

  // ============================================
  // GET FUNDING SOURCES (exclude LOANS)
  // ============================================
  const fundingRecords = await FundingRecord.find({
    projectId: projectObjectId,
    status: "RECEIVED"
  }).populate("sourceId");
  
  // Filter to exclude LOAN type funding sources
  const nonLoanRecords = fundingRecords.filter(record => 
    record.sourceId && record.sourceId.fundType !== "LOAN"
  );
  
  // Group by funding source and sum amounts
  const sourceMap = new Map();
  nonLoanRecords.forEach(record => {
    const sourceId = record.sourceId._id.toString();
    if (sourceMap.has(sourceId)) {
      sourceMap.get(sourceId).totalAmount += record.amount;
    } else {
      sourceMap.set(sourceId, {
        source: record.sourceId,
        totalAmount: record.amount
      });
    }
  });
  
  const fundingSources = Array.from(sourceMap.values());
  const totalNonLoanFunding = fundingSources.reduce((sum, f) => sum + f.totalAmount, 0);
  
  console.log(`💰 Found ${fundingSources.length} non-LOAN funding sources`);
  console.log(`💰 Total non-LOAN funding: ${totalNonLoanFunding}`);

  // Safety check: totalCredits ≥ 0
  const totalCredits = Math.max(settlement.totalCredits, 0);

  let communityPool = 0;
  let investorPool = 0;

  // ----- Determine pools dynamically -----
  if (members.length > 0 && fundingSources.length > 0) {
    communityPool = totalCredits * 0.7;
    investorPool = totalCredits * 0.3;
  } else if (members.length > 0 && fundingSources.length === 0) {
    communityPool = totalCredits;
    investorPool = 0;
  } else if (members.length === 0 && fundingSources.length > 0) {
    communityPool = 0;
    investorPool = totalCredits;
  }

  const creditRecords = [];

  // ============================================
  // COMMUNITY POOL: equal share to MEMBERS
  // ============================================
  if (members.length > 0 && communityPool > 0) {
    const memberShare = Math.round(communityPool / members.length);
    for (const member of members) {
      // ✅ FIXED: Use originalAmount and remainingAmount (no creditAmount)
      const credit = await Credit.create({
        userId: member._id,
        projectId: projectObjectId,
        billingPeriod,
        settlementId: settlementObjectId,
        originalAmount: memberShare,     // ✅ Correct field name
        remainingAmount: memberShare,    // ✅ Correct field name
        createdBy: "system"
      });
      creditRecords.push(credit);

      // Update wallet balance
      await User.findByIdAndUpdate(member._id, { $inc: { walletBalance: memberShare } });
    }
    console.log(`✅ Distributed ${communityPool} to ${members.length} members`);
  }

  // ============================================
  // INVESTOR POOL: proportional share to FUNDING SOURCES
  // ============================================
  if (fundingSources.length > 0 && investorPool > 0) {
    for (const source of fundingSources) {
      // Calculate proportional share
      let creditAmount = 0;
      if (totalNonLoanFunding > 0) {
        const sourceShare = source.totalAmount / totalNonLoanFunding;
        creditAmount = Math.round(sourceShare * investorPool);
      }

      // ✅ FIXED: Use originalAmount and remainingAmount (no creditAmount)
      // ✅ FIXED: Fixed typo "coriginalAmount" → "originalAmount"
      const credit = await Credit.create({
        userId: source.source.user,
        projectId: projectObjectId,
        billingPeriod,
        settlementId: settlementObjectId,
        originalAmount: creditAmount,     // ✅ Correct field name (not coriginalAmount)
        remainingAmount: creditAmount,    // ✅ Correct field name
        createdBy: "system"
      });
      creditRecords.push(credit);

      // Add to user's wallet
      await User.findByIdAndUpdate(source.source.user, { $inc: { walletBalance: creditAmount } });
      
      console.log(`   → ${source.source.fundName}: ${creditAmount} credits`);
    }
    console.log(`✅ Distributed ${investorPool} to ${fundingSources.length} funding sources`);
  }

  return creditRecords;
}
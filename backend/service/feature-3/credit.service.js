import Investment from "../../model/feature-3/Investment.js"; 
import Credit from "../../model/feature-3/Bill.js";
import User from "../../model/feature-3/UserNew.js";
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

  // Fetch all users for this project
  const users = await User.find({ projectId: projectObjectId });

  // Separate users by role
  const members = users.filter(u => u.role === "MEMBER");
  const investors = users.filter(u => u.role === "INVESTOR");

  // Safety check: totalCredits ≥ 0
  const totalCredits = Math.max(settlement.totalCredits, 0);

  let communityPool = 0;
  let investorPool = 0;

  // ----- Determine pools dynamically -----
  if (members.length > 0 && investors.length > 0) {
    // both exist → 70/30 split
    communityPool = totalCredits * 0.7;
    investorPool = totalCredits * 0.3;
  } else if (members.length > 0 && investors.length === 0) {
    // only members → 100% to members
    communityPool = totalCredits;
    investorPool = 0;
  } else if (members.length === 0 && investors.length > 0) {
    // only investors → 100% to investors
    communityPool = 0;
    investorPool = totalCredits;
  }

  const creditRecords = [];

  // ----- Community pool: equal share -----
  if (members.length > 0 && communityPool > 0) {
    const memberShare = Math.round(communityPool / members.length);
    for (const member of members) {
      // ✅ FIXED: Include all required fields
      const credit = await Credit.create({
        userId: member._id,
        projectId: projectObjectId,
        billingPeriod,
        settlementId: settlementObjectId,
        creditAmount: memberShare,
        originalAmount: memberShare,     // ✅ Added - required by Credit model
        remainingAmount: memberShare,    // ✅ Added - required by Credit model
        createdBy: "system"
      });
      creditRecords.push(credit);

      // Update wallet balance (optional - will be skipped if field doesn't exist)
      try {
        await User.findByIdAndUpdate(member._id, { $inc: { walletBalance: memberShare } });
      } catch (error) {
        console.log(`⚠️ Could not update wallet for member ${member._id}: ${error.message}`);
      }
    }
    console.log(`✅ Distributed ${communityPool} to ${members.length} members`);
  }

  // ----- Investor pool: proportional share -----
  if (investors.length > 0 && investorPool > 0) {
    const totalInvestment = investors.reduce((sum, i) => sum + (i.investedAmount || 0), 0);

    for (const investor of investors) {
      const userInvestment = investor.investedAmount || 0;
      let creditAmount = 0;
      if (totalInvestment > 0) {
        const userShare = userInvestment / totalInvestment;
        creditAmount = Math.round(userShare * investorPool);
      }

      // ✅ FIXED: Include all required fields
      const credit = await Credit.create({
        userId: investor._id,
        projectId: projectObjectId,
        billingPeriod,
        settlementId: settlementObjectId,
        originalAmount: creditAmount,    // ✅ Added - required by Credit model
        remainingAmount: creditAmount,   // ✅ Added - required by Credit model
        createdBy: "system"
      });
      creditRecords.push(credit);

      // Update wallet balance (optional - will be skipped if field doesn't exist)
      try {
        await User.findByIdAndUpdate(investor._id, { $inc: { walletBalance: creditAmount } });
      } catch (error) {
        console.log(`⚠️ Could not update wallet for investor ${investor._id}: ${error.message}`);
      }
    }
    console.log(`✅ Distributed ${investorPool} to ${investors.length} investors`);
  }

  return creditRecords;
}
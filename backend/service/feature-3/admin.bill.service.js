// services/adminBillService.js
import Bill from "../../model/feature-3/Bill.js";
import Credit from "../../model/feature-3/Credit.js";
import CommunityBill from "../../model/feature-3/CommunityBill.js";
import MemberConsumption from "../../model/feature-3/MemberConsumption.js";
import User from "../../model/User.js";
import { processCreditUsage } from "../../utils/feature-3/admin.bill.utils.js";

export const getAdminBillsByStatus = async (status, filters = {}) => {
  const { startDate, endDate } = filters;

  // Build query - status is required, no userId filter
  let query = { status };

  // Add date range filter if provided
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Get bills - NO userId filter, so gets ALL users' bills
  const bills = await Bill.find(query).sort({ createdAt: -1 });

  // Get date range for summary
  const dateRange = {};
  if (bills.length > 0) {
    dateRange.oldest = bills[bills.length - 1].createdAt;
    dateRange.newest = bills[0].createdAt;
  }

  return {
    bills,
    dateRange,
  };
};

export const updateBillStatus = async (billId, updateData) => {
  const { status, rejectionReason, reviewedBy } = updateData;

  // Find the bill by ID only
  const bill = await Bill.findById(billId);

  if (!bill) {
    throw new Error("Bill not found");
  }

  const userId = bill.userId;

  if (bill.status !== "pending" && status !== bill.status) {
    throw new Error(
      `Bill is already ${bill.status}. Cannot change to ${status}`,
    );
  }

  if (status === "approved") {
    return await approveBill(bill, userId, reviewedBy);
  } else if (status === "rejected") {
    return await rejectBill(bill, userId, rejectionReason, reviewedBy);
  } else if (status === "pending") {
    return await resetBillToPending(bill);
  }

  throw new Error("Invalid status operation");
};

const roundToCurrency = (value) => Number(value.toFixed(2));

const getRemainingAmount = (record) =>
  Math.max(
    0,
    roundToCurrency(
      Number(record?.amountOwed || 0) - Number(record?.paidAmount || 0),
    ),
  );

const getCollectionStatus = (record) => {
  const remainingAmount = getRemainingAmount(record);

  if (remainingAmount <= 0.01) {
    return "paid";
  }

  return "unpaid";
};

const buildBillCollectionKey = (communityId, billingPeriod = {}) =>
  `${communityId}:${billingPeriod.year}:${billingPeriod.month}`;

const normalizeCommunityBillState = (bill) => {
  const distributionStatus = bill.distributionStatus || "pending";
  const paymentStatus =
    distributionStatus !== "distributed" ? "pending" : bill.paymentStatus || "pending";

  return {
    distributionStatus,
    paymentStatus,
    distributedAt: distributionStatus === "distributed" ? bill.distributedAt || null : null,
    distributedBy: distributionStatus === "distributed" ? bill.distributedBy || null : null,
  };
};

const buildCollectionSummaries = async (bills) => {
  const distributedBills = bills.filter(
    (bill) => (bill.distributionStatus || "pending") === "distributed",
  );

  if (distributedBills.length === 0) {
    return new Map();
  }

  const billFilters = [
    ...new Map(
      distributedBills.map((bill) => [
        buildBillCollectionKey(bill.communityId?.trim() || bill.communityId, bill.billingPeriod),
        {
          communityId: bill.communityId?.trim() || bill.communityId,
          "billingPeriod.month": Number(bill.billingPeriod?.month),
          "billingPeriod.year": Number(bill.billingPeriod?.year),
        },
      ]),
    ).values(),
  ];

  const consumptionRecords = await MemberConsumption.find({
    $or: billFilters,
  })
    .sort({
      communityId: 1,
      "billingPeriod.year": -1,
      "billingPeriod.month": -1,
      memberId: 1,
    })
    .lean();

  const memberIds = [
    ...new Set(
      consumptionRecords
        .map((record) => String(record.memberId || ""))
        .filter((memberId) => /^[a-f\d]{24}$/i.test(memberId)),
    ),
  ];

  const users = memberIds.length
    ? await User.find({ _id: { $in: memberIds } }).select("_id name email").lean()
    : [];

  const userNameMap = new Map(
    users.map((user) => [String(user._id), user.name || user.email || String(user._id)]),
  );

  const recordsByBill = new Map();

  consumptionRecords.forEach((record) => {
    const billKey = buildBillCollectionKey(record.communityId, record.billingPeriod);
    const memberName = userNameMap.get(String(record.memberId)) || String(record.memberId);
    const amountOwed = roundToCurrency(Number(record.amountOwed || 0));
    const amountPaid = roundToCurrency(Number(record.paidAmount || 0));
    const remainingAmount = getRemainingAmount(record);
    const collectionStatus = getCollectionStatus(record);

    const memberRecord = {
      consumptionId: record._id,
      memberId: String(record.memberId),
      memberName,
      unitsConsumed: Number(record.unitsConsumed || 0),
      amountOwed,
      amountPaid,
      remainingAmount,
      paymentStatus: record.paymentStatus || "pending",
      collectionStatus,
    };

    if (!recordsByBill.has(billKey)) {
      recordsByBill.set(billKey, []);
    }

    recordsByBill.get(billKey).push(memberRecord);
  });

  return new Map(
    distributedBills.map((bill) => {
      const billKey = buildBillCollectionKey(bill.communityId?.trim() || bill.communityId, bill.billingPeriod);
      const members = (recordsByBill.get(billKey) || []).sort((left, right) => {
        const statusOrder = { unpaid: 0, paid: 1 };

        if (statusOrder[left.collectionStatus] !== statusOrder[right.collectionStatus]) {
          return statusOrder[left.collectionStatus] - statusOrder[right.collectionStatus];
        }

        if (right.remainingAmount !== left.remainingAmount) {
          return right.remainingAmount - left.remainingAmount;
        }

        return left.memberName.localeCompare(right.memberName);
      });

      const summary = members.reduce(
        (accumulator, member) => {
          accumulator.membersCount += 1;
          accumulator.totalAmountOwed += member.amountOwed;
          accumulator.totalPaidAmount += member.amountPaid;
          accumulator.totalRemainingAmount += member.remainingAmount;

          if (member.collectionStatus === "paid") {
            accumulator.paidMembersCount += 1;
          } else {
            accumulator.unpaidMembersCount += 1;
          }

          return accumulator;
        },
        {
          membersCount: 0,
          paidMembersCount: 0,
          unpaidMembersCount: 0,
          totalAmountOwed: 0,
          totalPaidAmount: 0,
          totalRemainingAmount: 0,
        },
      );

      const totalAmountOwed = roundToCurrency(summary.totalAmountOwed);
      const totalPaidAmount = roundToCurrency(summary.totalPaidAmount);
      const totalRemainingAmount = roundToCurrency(summary.totalRemainingAmount);

      return [
        bill._id.toString(),
        {
          members,
          summary: {
            ...summary,
            totalAmountOwed,
            totalPaidAmount,
            totalRemainingAmount,
            completionPercentage:
              totalAmountOwed <= 0
                ? 0
                : Math.min(
                    100,
                    roundToCurrency((totalPaidAmount / totalAmountOwed) * 100),
                  ),
          },
        },
      ];
    }),
  );
};

export const getCommunityBills = async (filters = {}) => {
  const { communityId, month, year, distributionStatus } = filters;
  const query = {};

  if (communityId) {
    query.communityId = communityId;
  }

  if (distributionStatus) {
    if (distributionStatus === "pending") {
      query.$or = [
        { distributionStatus: "pending" },
        { distributionStatus: { $exists: false } },
        { distributionStatus: null },
      ];
    } else {
      query.distributionStatus = distributionStatus;
    }
  }

  if (month !== undefined && month !== "") {
    query["billingPeriod.month"] = Number(month);
  }

  if (year !== undefined && year !== "") {
    query["billingPeriod.year"] = Number(year);
  }

  const bills = await CommunityBill.find(query).sort({
    "billingPeriod.year": -1,
    "billingPeriod.month": -1,
    createdAt: -1,
  });

  const updates = bills
    .map((bill) => {
      const normalizedState = normalizeCommunityBillState(bill);
      const needsUpdate =
        bill.distributionStatus !== normalizedState.distributionStatus ||
        bill.paymentStatus !== normalizedState.paymentStatus ||
        bill.distributedAt !== normalizedState.distributedAt ||
        bill.distributedBy !== normalizedState.distributedBy;

      if (!needsUpdate) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: bill._id },
          update: {
            $set: normalizedState,
          },
        },
      };
    })
    .filter(Boolean);

  if (updates.length > 0) {
    await CommunityBill.bulkWrite(updates);
  }

  const collectionSummaries = await buildCollectionSummaries(
    bills.map((bill) => ({
      ...bill.toObject(),
      ...normalizeCommunityBillState(bill),
    })),
  );

  return bills.map((bill) => {
    const normalizedState = normalizeCommunityBillState(bill);
    const collection = collectionSummaries.get(bill._id.toString()) || null;

    return {
      ...bill.toObject(),
      ...normalizedState,
      collectionSummary: collection?.summary || null,
      memberCollections: collection?.members || [],
    };
  });
};

const buildProportionalAllocations = (records, totalAmount) => {
  const totalUnits = records.reduce(
    (sum, record) => sum + (record.unitsConsumed || 0),
    0,
  );

  if (totalUnits <= 0) {
    throw new Error(
      "Cannot allocate bill because the total units consumed for this period is zero",
    );
  }

  const totalAmountInCents = Math.round(totalAmount * 100);

  const baseAllocations = records.map((record) => {
    const exactShareInCents =
      (totalAmountInCents * record.unitsConsumed) / totalUnits;
    const flooredShareInCents = Math.floor(exactShareInCents);

    return {
      record,
      unitsConsumed: record.unitsConsumed,
      exactShareInCents,
      allocatedInCents: flooredShareInCents,
      remainder: exactShareInCents - flooredShareInCents,
    };
  });

  let remainingCents =
    totalAmountInCents -
    baseAllocations.reduce(
      (sum, allocation) => sum + allocation.allocatedInCents,
      0,
    );

  const remainderRanking = [...baseAllocations].sort((a, b) => {
    if (b.remainder !== a.remainder) return b.remainder - a.remainder; //sort by descending order of remainder
    if (b.unitsConsumed !== a.unitsConsumed)
      return b.unitsConsumed - a.unitsConsumed; // tie-breaker: more units consumed gets priority
    return String(a.record.memberId).localeCompare(String(b.record.memberId)); // final tie-breaker: sort by memberId for consistency
  });

  // Distribute remaining cents to those with the largest remainders
  for (let index = 0; index < remainingCents; index += 1) {
    remainderRanking[index].allocatedInCents += 1;
  }

  return {
    totalUnits,
    allocations: baseAllocations.map((allocation) => ({
      ...allocation,
      amountOwed: allocation.allocatedInCents / 100,
    })),
  };
};

const resolveCommunityBill = async ({ billId, communityId, month, year }) => {
  if (billId) {
    const communityBill = await CommunityBill.findById(billId);

    if (!communityBill) {
      throw new Error("Community bill not found");
    }

    return communityBill;
  }

  if (!communityId) {
    throw new Error("communityId is required");
  }

  const numericMonth = Number(month);
  const numericYear = Number(year);

  if (
    !Number.isInteger(numericMonth) ||
    numericMonth < 1 ||
    numericMonth > 12 ||
    !Number.isInteger(numericYear)
  ) {
    throw new Error("Valid month and year are required");
  }

  const communityBill = await CommunityBill.findOne({
    communityId,
    "billingPeriod.month": numericMonth,
    "billingPeriod.year": numericYear,
  });

  if (!communityBill) {
    throw new Error("Community bill not found for the given billing period");
  }

  return communityBill;
};

export const allocateCommunityBillByConsumption = async ({
  billId,
  communityId,
  month,
  year,
  distributedBy = "admin",
}) => {
  const communityBill = await resolveCommunityBill({
    billId,
    communityId,
    month,
    year,
  });

  const normalizedState = normalizeCommunityBillState(communityBill);
  if (
    communityBill.paymentStatus !== normalizedState.paymentStatus ||
    communityBill.distributionStatus !== normalizedState.distributionStatus ||
    communityBill.distributedAt !== normalizedState.distributedAt ||
    communityBill.distributedBy !== normalizedState.distributedBy
  ) {
    Object.assign(communityBill, normalizedState);
    await communityBill.save();
  }

  if (communityBill.distributionStatus === "distributed") {
    throw new Error("Community bill has already been distributed");
  }

  const numericMonth = Number(communityBill.billingPeriod.month);
  const numericYear = Number(communityBill.billingPeriod.year);

  const consumptions = await MemberConsumption.find({
    communityId: communityBill.communityId?.trim() || communityBill.communityId,
    "billingPeriod.month": numericMonth,
    "billingPeriod.year": numericYear,
  }).sort({ unitsConsumed: -1, memberId: 1 });

  if (consumptions.length === 0) {
    throw new Error(
      "No member consumption records found for the given community and billing period",
    );
  }

  const { totalUnits, allocations } = buildProportionalAllocations(
    consumptions,
    communityBill.totalAmount,
  );

  await MemberConsumption.bulkWrite(
    allocations.map((allocation) => ({
      updateOne: {
        filter: { _id: allocation.record._id },
        update: { $set: { amountOwed: allocation.amountOwed } },
      },
    })),
  );

  const totalAllocated = allocations.reduce(
    (sum, allocation) => sum + allocation.amountOwed,
    0,
  );

  communityBill.distributionStatus = "distributed";
  communityBill.distributedAt = new Date();
  communityBill.distributedBy = distributedBy;
  await communityBill.save();

  return {
    communityBill: {
      id: communityBill._id,
      communityId: communityBill.communityId,
      billNumber: communityBill.billNumber,
      billingPeriod: communityBill.billingPeriod,
      totalAmount: communityBill.totalAmount,
      totalImport: communityBill.totalImport,
      paymentStatus: communityBill.paymentStatus,
      distributionStatus: communityBill.distributionStatus,
      distributedAt: communityBill.distributedAt,
      distributedBy: communityBill.distributedBy,
    },
    summary: {
      membersCount: allocations.length,
      totalUnitsConsumed: totalUnits,
      totalAllocatedAmount: roundToCurrency(totalAllocated),
      communityBillAmount: roundToCurrency(communityBill.totalAmount),
      communityImportDifference: roundToCurrency(
        totalUnits - (communityBill.totalImport || 0),
      ),
    },
    allocations: allocations.map((allocation) => ({
      consumptionId: allocation.record._id,
      memberId: allocation.record.memberId,
      communityId: allocation.record.communityId,
      billingPeriod: allocation.record.billingPeriod,
      previousReading: allocation.record.previousReading,
      currentReading: allocation.record.currentReading,
      unitsConsumed: allocation.record.unitsConsumed,
      usageRatio:
        totalUnits === 0
          ? 0
          : roundToCurrency(allocation.record.unitsConsumed / totalUnits),
      amountOwed: allocation.amountOwed,
      paymentStatus: allocation.record.paymentStatus,
    })),
  };
};

// ============================================
// DEBUG VERSION: Helper function for approval
// ============================================
const approveBill = async (bill, userId, reviewedBy) => {
  console.log("\n🔍 ===== APPROVE BILL DEBUG =====");
  console.log("Bill ID:", bill._id.toString());
  console.log("User ID:", userId.toString());
  console.log("Bill Amount:", bill.totalAmountDue);

  // STEP 1: Check if ANY credits exist for this user (no filters)
  console.log("\n📋 STEP 1: Finding ANY credits for this user...");
  const anyCredits = await Credit.find({ userId: userId });
  console.log(`Found ${anyCredits.length} total credits for user`);

  if (anyCredits.length > 0) {
    console.log("All credits in DB:");
    anyCredits.forEach((c, i) => {
      console.log(
        `  ${i + 1}. ID: ${c._id}, Period: ${c.billingPeriod}, Remaining: ${c.remainingAmount} (Type: ${typeof c.remainingAmount})`,
      );
    });
  } else {
    console.log("❌ No credits at all found for this user!");
  }

  // STEP 2: Try the filtered query
  console.log("\n🔎 STEP 2: Finding credits with remainingAmount > 0...");
  const allCredits = await Credit.find({
    userId: userId,
    remainingAmount: { $gt: 0 },
  }).sort({ createdAt: 1 });

  console.log(`Found ${allCredits.length} credits with remainingAmount > 0`);

  if (allCredits.length > 0) {
    console.log("Credits with remainingAmount > 0:");
    allCredits.forEach((c, i) => {
      console.log(
        `  ${i + 1}. ID: ${c._id}, Period: ${c.billingPeriod}, Remaining: ${c.remainingAmount} (Type: ${typeof c.remainingAmount})`,
      );
    });
  }

  // STEP 3: Check for data type issues
  if (anyCredits.length > 0 && allCredits.length === 0) {
    console.log("\n⚠️ DATA TYPE ISSUE DETECTED!");
    console.log("You have credits but none with remainingAmount > 0");
    console.log("This usually means remainingAmount is stored as STRING");

    // Check types
    const stringCredits = anyCredits.filter(
      (c) => typeof c.remainingAmount === "string",
    );
    if (stringCredits.length > 0) {
      console.log(
        `Found ${stringCredits.length} credits with remainingAmount as STRING:`,
      );
      stringCredits.forEach((c) => {
        console.log(
          `  ID: ${c._id}, remainingAmount: "${c.remainingAmount}" (string)`,
        );
      });
    }
  }

  // Initialize variables with defaults
  let creditsToUse = 0;
  let finalAmount = bill.totalAmountDue;
  let usedCredits = [];

  // ONLY process credits if they exist
  if (allCredits.length > 0) {
    console.log("\n💰 STEP 3: Processing credits...");
    const creditResult = await processCreditUsage(
      allCredits,
      bill,
      bill.totalAmountDue,
    );
    creditsToUse = creditResult.creditsUsed;
    finalAmount = creditResult.finalAmount;
    usedCredits = creditResult.usedCredits;
    console.log(
      `✅ Used ${creditsToUse} credits from ${allCredits.length} credit sources`,
    );
    console.log(`   Final amount: ${finalAmount}`);
  } else {
    console.log("\nℹ️ STEP 3: No credits with remainingAmount > 0 found");
    console.log(
      "   Approving bill without credits at full amount:",
      bill.totalAmountDue,
    );
  }

  // Update bill - ALWAYS approve regardless of credits
  bill.status = "approved";
  bill.reducedAmount = finalAmount;
  bill.creditId = usedCredits[0]?.id || null;
  bill.reviewedBy = reviewedBy;
  bill.reviewedAt = new Date();

  await bill.save();
  console.log("✅ Bill saved with status: approved");

  // Get remaining credits for response
  const remainingCredits = await Credit.find({
    userId: userId,
    remainingAmount: { $gt: 0 },
  });

  const totalRemaining = remainingCredits.reduce(
    (sum, c) => sum + c.remainingAmount,
    0,
  );

  console.log("\n📊 Final remaining credits:", totalRemaining);
  console.log("===== END DEBUG =====\n");

  return {
    message:
      usedCredits.length > 0
        ? "Bill approved with credits"
        : "Bill approved (no credits available)",
    data: {
      bill: {
        id: bill._id,
        userId: userId,
        accountNumber: bill.accountNumber,
        consumerName: bill.consumerName,
        month: bill.billMonth,
        originalAmount: bill.totalAmountDue,
        creditsUsed: creditsToUse,
        finalAmount: finalAmount,
        savings: creditsToUse,
        status: bill.status,
      },
      credits: {
        used: usedCredits,
        totalUsed: creditsToUse,
        remaining: totalRemaining,
        remainingCount: remainingCredits.length,
      },
      reviewedBy: bill.reviewedBy,
      reviewedAt: bill.reviewedAt,
    },
  };
};

// Helper function for rejection
const rejectBill = async (bill, userId, rejectionReason, reviewedBy) => {
  if (!rejectionReason) {
    throw new Error("Rejection reason is required when rejecting a bill");
  }

  bill.status = "rejected";
  bill.rejectionReason = rejectionReason;
  bill.reviewedBy = reviewedBy;
  bill.reviewedAt = new Date();

  await bill.save();

  return {
    message: "Bill rejected successfully",
    data: {
      id: bill._id,
      userId: userId,
      accountNumber: bill.accountNumber,
      consumerName: bill.consumerName,
      status: bill.status,
      rejectionReason: bill.rejectionReason,
      reviewedBy: bill.reviewedBy,
      reviewedAt: bill.reviewedAt,
    },
  };
};

// Helper function for reset to pending
const resetBillToPending = async (bill) => {
  bill.status = "pending";
  bill.reviewedBy = null;
  bill.reviewedAt = null;
  bill.rejectionReason = null;
  bill.reducedAmount = null;
  bill.creditId = null;

  await bill.save();

  return {
    message: "Bill status updated to pending",
    data: {
      id: bill._id,
      userId: bill.userId,
      status: bill.status,
      accountNumber: bill.accountNumber,
      consumerName: bill.consumerName,
    },
  };
};

import MemberConsumption from '../../model/feature-3/MemberConsumption.js';
import PaymentSlip from '../../model/feature-3/PaymentSlip.js';

export const getPreviousBillingPeriod = (month, year) => ({
  previousMonth: month === 1 ? 12 : month - 1,
  previousYear: month === 1 ? year - 1 : year,
});

// Get previous reading for a member
export const getPreviousReading = async (memberId, communityId, month, year) => {
  const { previousMonth, previousYear } = getPreviousBillingPeriod(month, year);
  
  const lastRecord = await MemberConsumption.findOne({
    memberId,
    communityId,
    'billingPeriod.month': previousMonth,
    'billingPeriod.year': previousYear
  });
  
  return lastRecord ? lastRecord.currentReading : null;
};

export const getPreviousReadingDetails = async (memberId, communityId, month, year) => {
  const { previousMonth, previousYear } = getPreviousBillingPeriod(month, year);

  const lastRecord = await MemberConsumption.findOne({
    memberId,
    communityId,
    'billingPeriod.month': previousMonth,
    'billingPeriod.year': previousYear
  });

  return {
    memberId,
    communityId,
    previousReading: lastRecord ? lastRecord.currentReading : null,
    previousReadingFound: Boolean(lastRecord),
    sourceBillingPeriod: lastRecord
      ? { month: previousMonth, year: previousYear }
      : null,
  };
};

// Save a reading
export const saveReading = async (data) => {
  const unitsConsumed = data.currentReading - data.previousReading;
  
  const consumption = await MemberConsumption.findOneAndUpdate(
    {
      memberId: data.memberId,
      communityId: data.communityId,
      'billingPeriod.month': data.month,
      'billingPeriod.year': data.year
    },
    {
      memberId: data.memberId,
      communityId: data.communityId,
      billingPeriod: { month: data.month, year: data.year },
      previousReading: data.previousReading,
      currentReading: data.currentReading,
      unitsConsumed,
      amountOwed: 0,
      paymentStatus: 'pending'
    },
    { upsert: true, new: true }
  );
  
  return consumption;
};

// Get all readings for a billing period
export const getReadingsByPeriod = async (communityId, month, year) => {
  return await MemberConsumption.find({
    communityId,
    'billingPeriod.month': month,
    'billingPeriod.year': year
  });
};

// Get reading history for a member
export const getMemberHistory = async (memberId) => {
  const records = await MemberConsumption.find({
    memberId
  }).sort({ 'billingPeriod.year': -1, 'billingPeriod.month': -1 });

  return await attachLatestPaymentSlip(records);
};

export const getMemberHistoryByCommunity = async (memberId, communityId) => {
  const records = await MemberConsumption.find({
    memberId,
    communityId,
  }).sort({ 'billingPeriod.year': -1, 'billingPeriod.month': -1 });

  return await attachLatestPaymentSlip(records);
};

const attachLatestPaymentSlip = async (records) => {
  if (records.length === 0) {
    return [];
  }

  const recordIds = records.map((record) => record._id);
  const paymentSlips = await PaymentSlip.find({
    memberConsumptionId: { $in: recordIds },
  })
    .sort({ createdAt: -1 })
    .lean();

  const latestSlipByConsumptionId = new Map();

  paymentSlips.forEach((paymentSlip) => {
    const key = String(paymentSlip.memberConsumptionId);
    if (!latestSlipByConsumptionId.has(key)) {
      latestSlipByConsumptionId.set(key, paymentSlip);
    }
  });

  return records.map((record) => ({
    ...record.toObject(),
    latestPaymentSlip: latestSlipByConsumptionId.get(String(record._id)) || null,
  }));
};

// ============ GET - Get single reading by ID ============
export const getReadingById = async (id) => {
  return await MemberConsumption.findById(id);
};

export const getReadingByPeriod = async (memberId, communityId, month, year) => {
  return await MemberConsumption.findOne({
    memberId,
    communityId,
    'billingPeriod.month': month,
    'billingPeriod.year': year
  });
};

// ============ PUT - Full update by ID ============
export const updateReadingById = async (id, data) => {
  return await MemberConsumption.findByIdAndUpdate(
    id,
    {
      previousReading: data.previousReading,
      currentReading: data.currentReading,
      unitsConsumed: data.unitsConsumed,
      amountOwed: data.amountOwed,
      paymentStatus: data.paymentStatus
    },
    { new: true, runValidators: true }
  );
};

// ============ PATCH - Partial update by ID ============
export const patchReadingById = async (id, updateData) => {
  return await MemberConsumption.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
};

// ============ PATCH - Partial update by member and period ============
export const patchReadingByPeriod = async (memberId, communityId, month, year, updateData) => {
  return await MemberConsumption.findOneAndUpdate(
    {
      memberId,
      communityId,
      'billingPeriod.month': month,
      'billingPeriod.year': year
    },
    updateData,
    { new: true, runValidators: true }
  );
};

// ============ DELETE - Delete by ID ============
export const deleteReadingById = async (id) => {
  return await MemberConsumption.findByIdAndDelete(id);
};

// ============ DELETE - Delete all readings for a period ============
export const deleteReadingsByPeriod = async (communityId, month, year) => {
  const result = await MemberConsumption.deleteMany({
    communityId,
    'billingPeriod.month': month,
    'billingPeriod.year': year
  });
  
  return result;
};

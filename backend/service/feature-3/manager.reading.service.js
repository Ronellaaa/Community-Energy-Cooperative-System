import MemberConsumption from '../models/MemberConsumption.js';

// Get previous reading for a member
export const getPreviousReading = async (memberId, month, year) => {
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  
  const lastRecord = await MemberConsumption.findOne({
    memberId,
    'billingPeriod.month': previousMonth,
    'billingPeriod.year': previousYear
  });
  
  return lastRecord ? lastRecord.currentReading : null;
};

// Save a reading
export const saveReading = async (data) => {
  const unitsConsumed = data.currentReading - data.previousReading;
  
  const consumption = await MemberConsumption.findOneAndUpdate(
    {
      memberId: data.memberId,
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
  return await MemberConsumption.find({
    memberId
  }).sort({ 'billingPeriod.year': -1, 'billingPeriod.month': -1 });
};

// ============ GET - Get single reading by ID ============
export const getReadingById = async (id) => {
  return await MemberConsumption.findById(id);
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
export const patchReadingByPeriod = async (memberId, month, year, updateData) => {
  return await MemberConsumption.findOneAndUpdate(
    {
      memberId,
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
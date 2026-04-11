import mongoose from 'mongoose';
import MemberConsumption from './model/feature-3/MemberConsumption.js';
import CommunityBill from './model/feature-3/CommunityBill.js';

async function run() {
  await mongoose.connect('mongodb+srv://dbAdmin:Oggy2012@ronella-dev-cluster.k8dn8f2.mongodb.net/enercoop_db');
  
  const cbs = await CommunityBill.find({ distributionStatus: 'pending' }).sort({ createdAt: -1 }).limit(1);
  const cb = cbs[0];
  console.log(`Checking CommunityBill: ${cb._id}`);
  console.log(`Community string from CB: "${cb.communityId}" length: ${cb.communityId.length}`);
  
  const consumptionsAll = await MemberConsumption.find({});
  const communityIdsFromConsumptions = [...new Set(consumptionsAll.map(c => c.communityId))];
  
  console.log(`All community IDs found in MemberConsumptions:`);
  communityIdsFromConsumptions.forEach(id => {
     console.log(`"${id}" length: ${id.length}`);
  });
  
  // Find which ones match
  const matching = consumptionsAll.filter(c => c.communityId.trim() === cb.communityId.trim());
  console.log(`Matching consumptions by trimmed ID: ${matching.length}`);
  
  if (matching.length > 0) {
      console.log(`Periods stored for this matched community:`);
      matching.forEach(m => console.log(`  month: ${m.billingPeriod.month}, year: ${m.billingPeriod.year}`));
  }
  
  mongoose.disconnect();
}
run();

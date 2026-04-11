import mongoose from 'mongoose';
import MemberConsumption from './model/feature-3/MemberConsumption.js';
import CommunityBill from './model/feature-3/CommunityBill.js';

async function run() {
  await mongoose.connect('mongodb+srv://dbAdmin:Oggy2012@ronella-dev-cluster.k8dn8f2.mongodb.net/enercoop_db');
  
  const cbs = await CommunityBill.find({ distributionStatus: 'pending' }).sort({ createdAt: -1 }).limit(5);
  for (const cb of cbs) {
    console.log(`\nCommunityBill: ${cb._id} | Period: ${cb.billingPeriod.year}-${cb.billingPeriod.month} | Community: ${cb.communityId}`);
    
    // Exact match query used in API
    const specific = await MemberConsumption.find({
        communityId: cb.communityId,
        'billingPeriod.month': Number(cb.billingPeriod.month),
        'billingPeriod.year': Number(cb.billingPeriod.year)
    });
    console.log(`EXACT match counts: ${specific.length}`);
    
    // Find what period the records actually have
    const anyForCommunity = await MemberConsumption.find({ communityId: cb.communityId });
    console.log(`Available periods for this community:`, anyForCommunity.map(m => `${m.billingPeriod.year}-${m.billingPeriod.month}`));
  }
  
  mongoose.disconnect();
}
run();

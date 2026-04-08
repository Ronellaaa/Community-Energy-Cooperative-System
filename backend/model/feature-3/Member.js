import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true,
    unique: true
  },
  communityId: {
    type: String,
    required: true,
    index: true
  }
});

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;
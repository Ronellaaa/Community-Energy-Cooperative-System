import Community from "../../model/Community.js";
import Project from "../../model/feature-1/Project.js";
import User from "../../model/User.js";
import mongoose from "mongoose";
export const listCommunities = async (req, res) => {
  const { search = "", page = "1", limit = "10" } = req.query;
  const p = Math.max(1, Number(page));
  const l = Math.min(50, Math.max(1, Number(limit)));
  const skip = (p - 1) * l;

  const q = { isArchived: false };
  if (search) {
    q.$or = [
      { name: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total, memberCounts, projects] = await Promise.all([
    Community.find(q).sort({ createdAt: -1 }).skip(skip).limit(l),
    Community.countDocuments(q),
    User.aggregate([
      {
        $match: {
          role: "USER",
          isArchived: { $ne: true },
          communityId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$communityId",
          memberCount: { $sum: 1 },
        },
      },
    ]),
    Project.find({}, { communityId: 1 }),
  ]);

  const memberCountMap = new Map(
    memberCounts.map((entry) => [String(entry._id), entry.memberCount]),
  );

  const projectMap = new Map(
  projects.map((p) => [String(p.communityId), true])
  );

  const itemsWithCounts = items.map((community) => ({
    ...community.toObject(),
    memberCount: memberCountMap.get(String(community._id)) || 0,
    hasProject: projectMap.has(String(community._id)),
  }));

  res.json({ items: itemsWithCounts, total, page: p, limit: l });
};

export const getCommunity = async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community || community.isArchived)
    return res.status(404).json({ message: "Community not found" });
  res.json(community);
};

export const createCommunity = async (req, res) => {
  const { name, location } = req.body;
  if (!name || !location)
    return res.status(400).json({ message: "name and location required" });

  const community = await Community.create({
    name,
    location,
    createdBy: req.user._id,
  });
  res.status(201).json(community);
};

export const updateCommunity = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid community id" });

  const community = await Community.findById(id);
  if (!community || community.isArchived)
    return res.status(404).json({ message: "Community not found" });

  // 🔒 only the officer who created it can edit
  if (String(community.createdBy) !== String(req.user._id)) {
    return res
      .status(403)
      .json({ message: "You can only update your own communities" });
  }

  const { name, location } = req.body;
  if (name !== undefined) community.name = name;
  if (location !== undefined) community.location = location;

  await community.save();
  res.json(community);
};

export const deleteCommunity = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid community id" });

  const community = await Community.findById(id);
  if (!community || community.isArchived)
    return res.status(404).json({ message: "Community not found" });

  // 🔒 only the officer who created it can delete
  if (String(community.createdBy) !== String(req.user._id)) {
    return res
      .status(403)
      .json({ message: "You can only delete your own communities" });
  }

  // ✅ soft delete
  community.isArchived = true;
  await community.save();

  res.json({ message: "Community archived (deleted)", id: community._id });
};

export const getApprovedCommunities = async (req, res) => {
  try {
    const communities = await Community.find({
      isApproved: true,
      isArchived: false,
    });

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

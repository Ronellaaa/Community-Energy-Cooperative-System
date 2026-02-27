import Community from "../../model/Community.js";

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

  const [items, total] = await Promise.all([
    Community.find(q).sort({ createdAt: -1 }).skip(skip).limit(l),
    Community.countDocuments(q),
  ]);

  res.json({ items, total, page: p, limit: l });
};

export const getCommunity = async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community || community.isArchived) return res.status(404).json({ message: "Community not found" });
  res.json(community);
};

export const createCommunity = async (req, res) => {
  const { name, location } = req.body;
  if (!name || !location) return res.status(400).json({ message: "name and location required" });

  const community = await Community.create({ name, location, createdBy: req.user._id });
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
    return res.status(403).json({ message: "You can only update your own communities" });
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
    return res.status(403).json({ message: "You can only delete your own communities" });
  }

  // ✅ soft delete
  community.isArchived = true;
  await community.save();

  res.json({ message: "Community archived (deleted)", id: community._id });
};
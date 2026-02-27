import User from "../../model/User.js";
import Community from "../../model/Community.js";
import bcrypt from "bcryptjs";

// Create OFFICER account
export const createOfficer = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "name, email, password required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already used" });

  const passwordHash = await bcrypt.hash(password, 10);
  const officer = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: "OFFICER",
  });

  res.status(201).json({
    id: officer._id,
    name: officer.name,
    email: officer.email,
    role: officer.role,
  });
};

// List OFFICERS
export const listOfficers = async (req, res) => {
  const officers = await User.find({ role: "OFFICER" }).select("-passwordHash");
  res.json(officers);
};

// Promote USER -> OFFICER
export const promoteToOfficer = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = "OFFICER";
  await user.save();

  res.json({ message: "Promoted to OFFICER", id: user._id, role: user.role });
};

// Archive community
export const archiveCommunity = async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) return res.status(404).json({ message: "Community not found" });

  community.isArchived = true;
  await community.save();

  res.json({ message: "Community archived", id: community._id, isArchived: true });
};

// Update officer (name/email/phone)
export const updateOfficer = async (req, res) => {
  const { name, email, phone } = req.body;

  const officer = await User.findById(req.params.id);
  if (!officer) return res.status(404).json({ message: "Officer not found" });
  if (officer.role !== "OFFICER") return res.status(400).json({ message: "Target user is not an OFFICER" });

  // optional: if email is changing, ensure unique
  if (email && email !== officer.email) {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });
    officer.email = email;
  }

  if (name) officer.name = name;
  if (phone !== undefined) officer.phone = phone;

  await officer.save();

  res.json({
    message: "Officer updated",
    officer: { id: officer._id, name: officer.name, email: officer.email, phone: officer.phone, role: officer.role },
  });
};

// Delete officer
export const deleteOfficer = async (req, res) => {
  const officer = await User.findById(req.params.id);
  if (!officer) return res.status(404).json({ message: "Officer not found" });
  if (officer.role !== "OFFICER") return res.status(400).json({ message: "Target user is not an OFFICER" });

  // Safety rule: don't allow deleting if officer has created communities
  const createdCount = await Community.countDocuments({ createdBy: officer._id });
  if (createdCount > 0) {
    return res.status(400).json({
      message: "Cannot delete: officer has created communities. Archive communities or reassign first.",
    });
  }

  await User.deleteOne({ _id: officer._id });
  res.json({ message: "Officer deleted" });
};

export const listCommunitiesAdmin = async (req, res) => {
  const items = await Community.find()
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  res.json(items);
};

export const archiveOfficer = async (req, res) => {
  const officer = await User.findById(req.params.id);
  if (!officer) return res.status(404).json({ message: "Officer not found" });
  if (officer.role !== "OFFICER")
    return res.status(400).json({ message: "Target user is not an OFFICER" });

  officer.isArchived = true;
  await officer.save();

  res.json({ message: "Officer archived", id: officer._id });
};

export const unarchiveOfficer = async (req, res) => {
  const officer = await User.findById(req.params.id);
  if (!officer) return res.status(404).json({ message: "Officer not found" });
  if (officer.role !== "OFFICER")
    return res.status(400).json({ message: "Target user is not an OFFICER" });

  officer.isArchived = false;
  await officer.save();

  res.json({ message: "Officer unarchived", id: officer._id });
};
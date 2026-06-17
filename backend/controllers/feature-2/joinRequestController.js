import JoinRequest from "../../model/JoinRequest.js";
import Community from "../../model/Community.js";

const inferDocType = (filename = "") => {
  const f = filename.toLowerCase();
  if (f.includes("nic")) return "NIC";
  if (f.includes("gn")) return "GN_LETTER";
  if (f.includes("bill")) return "UTILITY_BILL";
  return "OTHER";
};

export const createJoinRequest = async (req, res) => {
  // minimal required checks
  const required = ["communityId", "applicantType", "fullName", "phone", "address", "reason", "monthlyBillRange"];
  for (const k of required) {
    if (!req.body[k] || String(req.body[k]).trim() === "") {
      return res.status(400).json({ message: `${k} is required` });
    }
  }

  // low income conditional
  const low = String(req.body.lowIncomeRequested).toLowerCase() === "true" || req.body.lowIncomeRequested === true;
  if (low) {
    if (!req.body.incomeRange) return res.status(400).json({ message: "incomeRange required when lowIncomeRequested=true" });
    const fs = Number(req.body.familySize);
    if (!Number.isInteger(fs) || fs < 1 || fs > 30) return res.status(400).json({ message: "familySize must be 1-30" });
  }

  // must not already be in a community
  if (req.user.communityId) return res.status(400).json({ message: "Already in a community" });

  // no duplicate pending
  const pending = await JoinRequest.findOne({ userId: req.user._id, status: "PENDING" });
  if (pending) return res.status(409).json({ message: "You already have a pending request" });

  // community exists
  const community = await Community.findOne({ _id: req.body.communityId, isArchived: false });
  if (!community) return res.status(404).json({ message: "Community not found" });

  // normalize contributionTypes (accept array or JSON string)
  let contributionTypes = [];
  if (req.body.contributionTypes) {
    if (Array.isArray(req.body.contributionTypes)) contributionTypes = req.body.contributionTypes;
    else {
      try { contributionTypes = JSON.parse(req.body.contributionTypes); }
      catch { contributionTypes = String(req.body.contributionTypes).split(","); }
    }
    contributionTypes = contributionTypes.map((x) => String(x).trim()).filter(Boolean);
  }

  // documents (multer)
  const documents = (req.files || []).map((f) => ({
    type: inferDocType(f.originalname),
    fileUrl: `/uploads/join-docs/${f.filename}`,
    originalName: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
  }));

  const jr = await JoinRequest.create({
    userId: req.user._id,
    communityId: req.body.communityId,
    applicantType: req.body.applicantType,
    fullName: req.body.fullName,
    phone: req.body.phone,
    address: req.body.address,
    reason: req.body.reason,
    monthlyBillRange: req.body.monthlyBillRange,
    meterNumber: req.body.meterNumber || undefined,
    contributionTypes,
    lowIncomeRequested: low,
    incomeRange: low ? req.body.incomeRange : undefined,
    familySize: low ? Number(req.body.familySize) : undefined,
    documents,
  });

  res.status(201).json(jr);
};

export const myJoinRequest = async (req, res) => {
  const jr = await JoinRequest.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(jr || null);
};

export const cancelJoinRequest = async (req, res) => {
  const jr = await JoinRequest.findOne({ _id: req.params.id, userId: req.user._id });
  if (!jr) return res.status(404).json({ message: "Request not found" });
  if (jr.status !== "PENDING") return res.status(400).json({ message: "Only PENDING can be cancelled" });

  jr.status = "CANCELLED";
  await jr.save();
  res.json(jr);
};
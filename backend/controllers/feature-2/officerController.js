import JoinRequest from "../../model/JoinRequest.js";
import User from "../../model/User.js";

export const listJoinRequests = async (req, res) => {
  const { status = "PENDING", page = "1", limit = "10", search = "" } = req.query;
  const p = Math.max(1, Number(page));
  const l = Math.min(50, Math.max(1, Number(limit)));
  const skip = (p - 1) * l;

  const q = { status };
  if (search) {
    q.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    JoinRequest.find(q)
      .populate("communityId", "name location")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l),
    JoinRequest.countDocuments(q),
  ]);

  res.json({ items, total, page: p, limit: l });
};

export const approveJoinRequest = async (req, res) => {
  const jr = await JoinRequest.findById(req.params.id);
  if (!jr) return res.status(404).json({ message: "Request not found" });
  if (jr.status !== "PENDING") return res.status(400).json({ message: "Only PENDING can be approved" });

  jr.status = "APPROVED";
  jr.reviewedBy = req.user._id;
  jr.reviewedAt = new Date();
  await jr.save();

  await User.findByIdAndUpdate(jr.userId, { communityId: jr.communityId });

  res.json(jr);
};

export const rejectJoinRequest = async (req, res) => {
  const jr = await JoinRequest.findById(req.params.id);
  if (!jr) return res.status(404).json({ message: "Request not found" });
  if (jr.status !== "PENDING") return res.status(400).json({ message: "Only PENDING can be rejected" });

  jr.status = "REJECTED";
  jr.rejectionReason = req.body.reason || "Rejected";
  jr.reviewedBy = req.user._id;
  jr.reviewedAt = new Date();
  await jr.save();

  res.json(jr);
};
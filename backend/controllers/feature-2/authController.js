import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../model/User.js";
// import Membership from "../../model/Membership.js";

export const register = async (req, res) => {
 const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "name, email, password required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already used" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, passwordHash });


 res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, communityId: user.communityId });
}


export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, communityId: user.communityId },
  });
};

export const me = async (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role, communityId: u.communityId });
};
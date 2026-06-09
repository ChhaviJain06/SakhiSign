import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken, authRequired } from "../middleware/auth.js";

const router = Router();

function tokenFor(user) {
  return signToken({ id: user._id.toString(), isGuest: !!user.isGuest });
}

function publicUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email || null,
    isGuest: !!u.isGuest,
    streak: u.streak,
    prefs: u.prefs,
  };
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name || "",
    email: email.toLowerCase(),
    passwordHash,
    lastActiveAt: new Date(),
  });
  res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash)
    return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ token: tokenFor(user), user: publicUser(user) });
});

// POST /api/auth/guest - issue a guest identity for instant demo
router.post("/guest", async (_req, res) => {
  const user = await User.create({
    name: "Guest",
    isGuest: true,
    lastActiveAt: new Date(),
  });
  res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
});

// GET /api/auth/me
router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(user) });
});

export default router;

import { Router } from "express";
import mongoose from "mongoose";
import { Sign } from "../models/Sign.js";
import { Attempt } from "../models/Attempt.js";
import { authOptional } from "../middleware/auth.js";

const router = Router();

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

/** slug -> most recent attempt summary for this user (with feedback). */
async function lastAttempts(userId) {
  if (!userId) return {};
  const rows = await Attempt.aggregate([
    { $match: { userId: toObjectId(userId) } },
    { $sort: { timestamp: -1 } },
    { $group: { _id: "$signSlug", doc: { $first: "$$ROOT" } } },
  ]);
  return Object.fromEntries(
    rows.map((r) => [
      r._id,
      {
        overallAccuracy: Math.round(r.doc.overallAccuracy),
        componentScores: r.doc.componentScores,
        feedbackMessages: r.doc.feedbackMessages || [],
        mirrored: !!r.doc.mirrored,
        timestamp: r.doc.timestamp,
      },
    ])
  );
}

// GET /api/signs - list all signs (+ user's last attempt if logged in)
router.get("/", authOptional, async (req, res) => {
  const [signs, attempts] = await Promise.all([
    Sign.find().sort({ createdAt: 1 }).lean(),
    lastAttempts(req.user?.id),
  ]);
  res.json({
    signs: signs.map((s) => {
      const last = attempts[s.slug] || null;
      return { ...s, lastScore: last ? last.overallAccuracy : null, lastAttempt: last };
    }),
  });
});

// GET /api/signs/:slug - one sign's details (+ last attempt)
router.get("/:slug", authOptional, async (req, res) => {
  const sign = await Sign.findOne({ slug: req.params.slug }).lean();
  if (!sign) return res.status(404).json({ error: "Sign not found" });

  let lastAttempt = null;
  if (req.user?.id) {
    const map = await lastAttempts(req.user.id);
    lastAttempt = map[sign.slug] || null;
  }
  res.json({
    sign: { ...sign, lastScore: lastAttempt ? lastAttempt.overallAccuracy : null, lastAttempt },
  });
});

export default router;

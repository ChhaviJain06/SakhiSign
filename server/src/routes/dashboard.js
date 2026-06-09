import { Router } from "express";
import mongoose from "mongoose";
import { Attempt } from "../models/Attempt.js";
import { Sign } from "../models/Sign.js";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { env } from "../config/env.js";

const router = Router();
const oid = (id) => new mongoose.Types.ObjectId(id);

// GET /api/dashboard/summary
router.get("/summary", authRequired, async (req, res) => {
  const userId = oid(req.user.id);
  const [agg] = await Attempt.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        avgAccuracy: { $avg: "$overallAccuracy" },
        signs: { $addToSet: "$signSlug" },
      },
    },
  ]);

  // signs mastered = signs whose BEST score >= threshold
  const best = await Attempt.aggregate([
    { $match: { userId } },
    { $group: { _id: "$signSlug", best: { $max: "$overallAccuracy" } } },
  ]);
  const mastered = best.filter((b) => b.best >= env.masteryThreshold).length;

  const user = await User.findById(req.user.id).lean();

  res.json({
    totalAttempts: agg?.totalAttempts || 0,
    signsTried: agg?.signs.length || 0,
    signsMastered: mastered,
    averageAccuracy: agg ? Math.round(agg.avgAccuracy) : 0,
    currentStreak: user?.streak || 0,
    masteryThreshold: env.masteryThreshold,
  });
});

// GET /api/dashboard/signs - per-sign mastery with last accuracy + trend
router.get("/signs", authRequired, async (req, res) => {
  const userId = oid(req.user.id);
  const signs = await Sign.find().sort({ createdAt: 1 }).lean();

  const stats = await Attempt.aggregate([
    { $match: { userId } },
    { $sort: { timestamp: 1 } },
    {
      $group: {
        _id: "$signSlug",
        best: { $max: "$overallAccuracy" },
        attempts: { $sum: 1 },
        scores: { $push: "$overallAccuracy" },
      },
    },
  ]);
  const map = Object.fromEntries(stats.map((s) => [s._id, s]));

  res.json({
    signs: signs.map((s) => {
      const st = map[s.slug];
      const scores = st?.scores || [];
      const last = scores.at(-1) ?? null;
      const prev = scores.at(-2) ?? null;
      return {
        slug: s.slug,
        name: s.name,
        category: s.category,
        mastery: st ? Math.round(st.best) : 0,
        lastAccuracy: last !== null ? Math.round(last) : null,
        attempts: st?.attempts || 0,
        trend: last !== null && prev !== null ? Math.round(last - prev) : 0,
      };
    }),
  });
});

// GET /api/dashboard/history?page=1&limit=10
router.get("/history", authRequired, async (req, res) => {
  const userId = oid(req.user.id);
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);

  const [items, total] = await Promise.all([
    Attempt.find({ userId })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Attempt.countDocuments({ userId }),
  ]);

  res.json({
    page,
    limit,
    total,
    items: items.map((a) => ({
      id: a._id,
      sign: a.signSlug,
      overallAccuracy: Math.round(a.overallAccuracy),
      componentScores: a.componentScores,
      timestamp: a.timestamp,
    })),
  });
});

export default router;

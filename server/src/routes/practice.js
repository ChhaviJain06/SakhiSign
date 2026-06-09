import { Router } from "express";
import { Sign } from "../models/Sign.js";
import { Attempt } from "../models/Attempt.js";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { evaluateSign } from "../services/aiClient.js";

const router = Router();

/** Bump the user's daily streak based on last active day. */
async function updateStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return;
  const today = new Date();
  const last = user.lastActiveAt;
  const sameDay = last && last.toDateString() === today.toDateString();
  if (!sameDay) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const continued = last && last.toDateString() === yesterday.toDateString();
    user.streak = continued ? user.streak + 1 : 1;
    user.lastActiveAt = today;
    await user.save();
  } else if (!user.streak) {
    // First activity on the same day the account was created.
    user.streak = 1;
    await user.save();
  }
}

// POST /api/practice/:slug/attempt
// body: { landmarks: [ { left_hand, right_hand }, ... ] }
router.post("/:slug/attempt", authRequired, async (req, res) => {
  const { slug } = req.params;
  const { landmarks } = req.body || {};

  if (!Array.isArray(landmarks) || landmarks.length === 0)
    return res.status(400).json({ error: "landmarks (non-empty array) required" });

  const sign = await Sign.findOne({ slug });
  if (!sign) return res.status(404).json({ error: "Sign not found" });

  // Forward to the FastAPI AI service.
  let aiResult;
  try {
    aiResult = await evaluateSign(slug, landmarks);
  } catch (err) {
    const status = err.response?.status || 502;
    return res.status(status).json({
      error: "AI service error",
      detail: err.response?.data?.detail || err.message,
    });
  }

  // Persist the attempt against the user id (guests have a real User doc too,
  // so their progress / last-attempt review works on this device's session).
  const userId = req.user.id;
  const attempt = await Attempt.create({
    userId,
    signId: sign._id,
    signSlug: slug,
    overallAccuracy: aiResult.overallAccuracy,
    componentScores: aiResult.componentScores,
    feedbackMessages: aiResult.feedbackMessages,
    mirrored: aiResult.mirrored,
  });

  if (userId) await updateStreak(userId);

  res.json({
    attemptId: attempt._id,
    overallAccuracy: aiResult.overallAccuracy,
    componentScores: aiResult.componentScores,
    feedbackMessages: aiResult.feedbackMessages,
    verdict: aiResult.verdict,
    mirrored: aiResult.mirrored,
  });
});

export default router;

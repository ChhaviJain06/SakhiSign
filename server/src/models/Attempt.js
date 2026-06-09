import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    handshape: Number,
    position: Number,
    movement: Number,
    timing: Number,
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = guest
    signId: { type: mongoose.Schema.Types.ObjectId, ref: "Sign", required: true },
    signSlug: { type: String, required: true },
    overallAccuracy: { type: Number, required: true },
    componentScores: { type: componentSchema, default: () => ({}) },
    feedbackMessages: { type: [String], default: [] },
    mirrored: { type: Boolean, default: false },
    rawPayload: { type: mongoose.Schema.Types.Mixed }, // optional, for debugging
  },
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

// Dashboard queries fetch a user's attempts for a sign, newest first.
attemptSchema.index({ userId: 1, signId: 1, timestamp: -1 });
attemptSchema.index({ userId: 1, timestamp: -1 });

export const Attempt = mongoose.model("Attempt", attemptSchema);

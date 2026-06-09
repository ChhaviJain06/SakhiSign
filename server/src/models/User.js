import mongoose from "mongoose";

const prefsSchema = new mongoose.Schema(
  {
    highContrast: { type: Boolean, default: false },
    largeText: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, sparse: true, unique: true },
    passwordHash: { type: String },
    isGuest: { type: Boolean, default: false },
    streak: { type: Number, default: 0 },          // consecutive active days
    lastActiveAt: { type: Date },
    prefs: { type: prefsSchema, default: () => ({}) },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const User = mongoose.model("User", userSchema);

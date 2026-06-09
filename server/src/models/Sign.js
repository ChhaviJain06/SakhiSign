import mongoose from "mongoose";

const signSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true }, // "pain"
    name: { type: String, required: true },                            // "Pain"
    category: { type: String, default: "Healthcare" },                 // Emergency/Healthcare/Basic Need
    hands: { type: Number, default: 1 },                               // 1 or 2
    description: { type: String, default: "" },
    instructions: { type: [String], default: [] },
    difficulty: { type: String, default: "Beginner" },
    tutorialGifUrl: { type: String, default: "" },
    tutorialVideoUrl: { type: String, default: "" },
    // The AI service holds the reference sequence keyed by slug; we just store
    // the key so the backend stays decoupled from the ML internals.
    referenceKey: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Sign = mongoose.model("Sign", signSchema);

/**
 * Seed the Sign collection from the AI engine's registry (the single source of
 * truth). Run once after the FastAPI service is up:
 *
 *     npm run seed
 *
 * Re-running is safe: it upserts by slug.
 */
import { connectDB } from "./config/db.js";
import { Sign } from "./models/Sign.js";
import { fetchSigns } from "./services/aiClient.js";
import mongoose from "mongoose";

// Category / difficulty metadata layered on top of the engine's signs.
const META = {
  pain: { category: "Healthcare", difficulty: "Beginner" },
  help: { category: "Emergency", difficulty: "Intermediate" },
  doctor: { category: "Healthcare", difficulty: "Intermediate" },
  medicine: { category: "Healthcare", difficulty: "Intermediate" },
  water: { category: "Basic Need", difficulty: "Beginner" },
};

async function run() {
  await connectDB();
  const signs = await fetchSigns();
  console.log(`[seed] fetched ${signs.length} signs from AI engine`);

  for (const s of signs) {
    const meta = META[s.name] || {};
    await Sign.findOneAndUpdate(
      { slug: s.name },
      {
        slug: s.name,
        name: s.display,
        hands: s.hands,
        description: s.description,
        instructions: s.instructions,
        category: meta.category || "Healthcare",
        difficulty: meta.difficulty || "Beginner",
        tutorialGifUrl: s.media?.gif || "",
        tutorialVideoUrl: s.media?.video || "",
        referenceKey: s.name,
      },
      { upsert: true, new: true }
    );
    console.log(`[seed] upserted ${s.name}`);
  }

  await mongoose.disconnect();
  console.log("[seed] done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

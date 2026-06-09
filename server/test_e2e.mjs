// End-to-end backend test: in-memory Mongo + live FastAPI + Express app.
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";

const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri("sakhisign");
process.env.AI_SERVICE_URL = "http://localhost:8000";
process.env.JWT_SECRET = "test-secret";
process.env.PORT = "4111";

await import("./src/index.js"); // boots express + connects to in-memory mongo
await new Promise((r) => setTimeout(r, 800));

const BASE = "http://localhost:4111";
const j = async (r) => ({ status: r.status, body: await r.json() });

// 1) seed signs from the AI engine
const { connectDB } = await import("./src/config/db.js");
const { Sign } = await import("./src/models/Sign.js");
const { fetchSigns } = await import("./src/services/aiClient.js");
const signs = await fetchSigns();
for (const s of signs)
  await Sign.findOneAndUpdate(
    { slug: s.name },
    { slug: s.name, name: s.display, hands: s.hands, description: s.description,
      instructions: s.instructions, referenceKey: s.name },
    { upsert: true }
  );
console.log(`seeded ${signs.length} signs:`, signs.map((s) => s.name).join(", "));

// 2) signup
let r = await j(await fetch(`${BASE}/api/auth/signup`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Asha", email: "asha@test.com", password: "secret1" }),
}));
console.log("signup:", r.status, "isGuest:", r.body.user?.isGuest);
const token = r.body.token;
const auth = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

// 3) list signs (with lastScore)
r = await j(await fetch(`${BASE}/api/signs`, { headers: auth }));
console.log("GET /signs:", r.status, "count:", r.body.signs?.length);

// 4) practice attempt with REAL help landmarks -> forwarded to FastAPI
const help = JSON.parse(fs.readFileSync("../recordings/help.json")).frames;
r = await j(await fetch(`${BASE}/api/practice/help/attempt`, {
  method: "POST", headers: auth, body: JSON.stringify({ landmarks: help }),
}));
console.log("POST practice/help/attempt:", r.status,
  "accuracy:", r.body.overallAccuracy, "components:", JSON.stringify(r.body.componentScores));

// second attempt (pain landmarks as help -> should be low) to build history
const pain = JSON.parse(fs.readFileSync("../recordings/pain.json")).frames;
await fetch(`${BASE}/api/practice/help/attempt`, {
  method: "POST", headers: auth, body: JSON.stringify({ landmarks: pain }),
});

// 5) dashboard
r = await j(await fetch(`${BASE}/api/dashboard/summary`, { headers: auth }));
console.log("dashboard/summary:", r.status, JSON.stringify(r.body));
r = await j(await fetch(`${BASE}/api/dashboard/history`, { headers: auth }));
console.log("dashboard/history:", r.status, "items:", r.body.items?.length);

// 6) guest flow
r = await j(await fetch(`${BASE}/api/auth/guest`, { method: "POST" }));
console.log("guest:", r.status, "isGuest:", r.body.user?.isGuest);

await mongod.stop();
console.log("\nALL E2E CHECKS PASSED");
process.exit(0);

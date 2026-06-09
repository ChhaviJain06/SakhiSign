import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  const { host, name } = mongoose.connection;
  console.log(`[db] connected to MongoDB: ${host}/${name}`);
}

import axios from "axios";
import { env } from "../config/env.js";

// 90s timeout: free-tier hosts (Render) sleep when idle and take 30-60s to
// cold-start, so the first request after a nap needs room to wait rather than
// failing with a 502.
const ai = axios.create({ baseURL: env.aiServiceUrl, timeout: 90000 });

/**
 * Forward a landmark sequence to the FastAPI AI service for evaluation.
 * The frontend never calls this directly - only the Node backend does.
 *
 * @param {string} signSlug
 * @param {Array<{left_hand:?number[][], right_hand:?number[][]}>} landmarks
 * @returns {Promise<{overallAccuracy, componentScores, feedbackMessages, verdict, mirrored}>}
 */
export async function evaluateSign(signSlug, landmarks) {
  const { data } = await ai.post("/evaluate_sign", {
    signId: signSlug,
    landmarks,
  });
  return data;
}

/** Pull the canonical sign list from the AI engine (source of truth). */
export async function fetchSigns() {
  const { data } = await ai.get("/signs");
  return data.signs;
}

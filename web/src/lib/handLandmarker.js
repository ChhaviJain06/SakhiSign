import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let _landmarker = null;
let _loading = null;

/**
 * Lazily load a single shared HandLandmarker (2 hands, video mode).
 * Model + wasm are pulled from the MediaPipe CDN.
 */
export async function getHandLandmarker() {
  if (_landmarker) return _landmarker;
  if (_loading) return _loading;

  _loading = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    const modelAssetPath =
      "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

    // Try GPU first (faster); fall back to CPU if the GPU delegate fails
    // (common on some integrated graphics / browsers).
    try {
      _landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 2,
      });
    } catch (gpuErr) {
      console.warn("[handLandmarker] GPU delegate failed, using CPU:", gpuErr);
      _landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath, delegate: "CPU" },
        runningMode: "VIDEO",
        numHands: 2,
      });
    }
    return _landmarker;
  })();

  return _loading;
}

/**
 * Convert a HandLandmarker result into the engine's frame shape:
 *   { left_hand: [[x,y,z]*21] | null, right_hand: [[x,y,z]*21] | null }
 */
export function resultToFrame(result) {
  const frame = { left_hand: null, right_hand: null };
  if (!result?.landmarks) return frame;
  result.landmarks.forEach((hand, i) => {
    const label = result.handednesses?.[i]?.[0]?.categoryName; // "Left" | "Right"
    const pts = hand.map((p) => [p.x, p.y, p.z]);
    if (label === "Left") frame.left_hand = pts;
    else frame.right_hand = pts;
  });
  return frame;
}

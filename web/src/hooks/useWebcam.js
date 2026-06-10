import { useCallback, useEffect, useRef, useState } from "react";
import { getHandLandmarker, resultToFrame } from "../lib/handLandmarker.js";

/**
 * Webcam + hand-tracking hook for the practice screen.
 *
 * - starts getUserMedia and a per-frame HandLandmarker loop
 * - exposes live hand presence so the UI can hint "show your hand(s)"
 * - record(durationMs) collects landmark frames for that window and resolves
 *   with the array of frames (the payload sent to the backend)
 */
export function useWebcam() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null); // offscreen, mirrored frame for detection
  const rafRef = useRef(null);
  const recordingRef = useRef(null); // { frames, until, resolve, requireBoth }
  const lastTsRef = useRef(-1);
  const landmarkRef = useRef([]);    // latest raw hands for the skeleton overlay
  const fpsRef = useRef(0);          // smoothed detection FPS (telemetry)
  const fpsPrevRef = useRef(0);

  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [trackingReady, setTrackingReady] = useState(false);
  const [hands, setHands] = useState({ left: false, right: false });
  const [error, setError] = useState(null);

  const loop = useCallback(async (landmarker) => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(() => loop(landmarker));
      return;
    }
    // Monotonic timestamp required by detectForVideo.
    let ts = performance.now();
    if (ts <= lastTsRef.current) ts = lastTsRef.current + 1;
    lastTsRef.current = ts;

    // Mirror the frame horizontally BEFORE detection, so browser handedness
    // and coordinates match how the Python reference signs were recorded
    // (those were captured from a flipped/selfie image). Without this, the
    // left/right hands are swapped vs the reference and two-handed signs break.
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvasRef.current = canvas;
    }
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    let frame = { left_hand: null, right_hand: null };
    let result = null;
    try {
      result = landmarker.detectForVideo(canvas, ts);
      frame = resultToFrame(result);
    } catch {
      /* transient detect error - skip this frame */
    }

    // Expose raw landmarks for the live skeleton overlay.
    landmarkRef.current = (result?.landmarks || []).map((points) => ({ points }));

    // Smoothed FPS (telemetry readout).
    const dt = ts - (fpsPrevRef.current || ts);
    fpsPrevRef.current = ts;
    if (dt > 0) fpsRef.current = fpsRef.current * 0.85 + (1000 / dt) * 0.15;

    setHands({ left: !!frame.left_hand, right: !!frame.right_hand });

    const rec = recordingRef.current;
    if (rec) {
      // For two-handed signs, only keep frames with BOTH hands so partial
      // frames don't pollute the inter-hand relationship features.
      const keep = rec.requireBoth
        ? frame.left_hand && frame.right_hand
        : frame.left_hand || frame.right_hand;
      if (keep) rec.frames.push(frame);
      if (performance.now() >= rec.until) {
        recordingRef.current = null;
        rec.resolve(rec.frames);
      }
    }

    rafRef.current = requestAnimationFrame(() => loop(landmarker));
  }, []);

  const start = useCallback(async () => {
    // 1) Camera FIRST, so the user sees themselves immediately even if the
    //    hand-tracking model is slow to download.
    let stream;
    try {
      setStatus("loading");
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
    } catch (e) {
      setError(friendlyCamError(e));
      setStatus("error");
      return;
    }

    const video = videoRef.current;
    if (!video) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      /* autoplay may need a user gesture; the stream is still attached */
    }
    setStatus("ready");

    // 2) Load hand tracking in the background. A failure here must NOT blank
    //    the camera - we keep the live feed and just disable scoring.
    try {
      const landmarker = await getHandLandmarker();
      setTrackingReady(true);
      loop(landmarker);
    } catch (e) {
      console.error("[useWebcam] hand tracking failed to load:", e);
      setError(
        "Hand tracking failed to load (check your internet connection). " +
          "Your camera is on, but scoring is unavailable."
      );
    }
  }, [loop]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject;
    stream?.getTracks().forEach((t) => t.stop());
  }, []);

  /**
   * Record landmark frames for `durationMs`; resolves with the frames array.
   * Pass { requireBoth: true } for two-handed signs to keep only frames where
   * both hands are visible.
   */
  const record = useCallback(
    (durationMs = 3000, { requireBoth = false } = {}) =>
      new Promise((resolve) => {
        recordingRef.current = {
          frames: [],
          until: performance.now() + durationMs,
          resolve,
          requireBoth,
        };
      }),
    []
  );

  useEffect(() => () => stop(), [stop]);

  return { videoRef, status, trackingReady, hands, error, start, stop, record, landmarkRef, fpsRef };
}

/** Map getUserMedia DOMExceptions to actionable messages. */
function friendlyCamError(e) {
  const name = e?.name || "";
  if (!window.isSecureContext) {
    return "Camera needs a secure context. Open the app via http://localhost:5173 (not a LAN IP).";
  }
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera permission was blocked. Click the camera icon in your browser's address bar and choose Allow, then press Start again.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No camera was found. Connect a webcam and try again.";
    case "NotReadableError":
      return "Your camera is already in use by another app (Zoom, Meet, etc.). Close it and retry.";
    default:
      return e?.message || "Could not access the camera.";
  }
}

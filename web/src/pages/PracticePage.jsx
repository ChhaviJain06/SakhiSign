import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWebcam } from "../hooks/useWebcam.js";
import { useSign, useSigns } from "../hooks/useSigns.js";
import ResultsPanel from "../components/ResultsPanel.jsx";
import { SignCardSkeleton } from "../components/Skeleton.jsx";
import SignGlyph from "../components/SignGlyph.jsx";
import { CameraIcon, AlertIcon, ArrowLeftIcon } from "../components/icons.jsx";
import { drawHands } from "../lib/handDraw.js";
import api from "../api/client.js";

const RECORD_MS = 3000;

// Sign picker shown at /practice with no sign selected.
function PracticePicker() {
  const { signs, loading } = useSigns();
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow mb-1">Camera practice</p>
        <h1 className="t-h1 text-navy">Practice</h1>
        <p className="t-caption mt-0.5">Pick a sign to practise with your camera.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SignCardSkeleton key={i} />)
          : signs.map((s) => (
              <button
                key={s.slug}
                onClick={() => navigate(`/practice/${s.slug}`)}
                className="card-interactive p-5 text-left"
              >
                <SignGlyph slug={s.slug} size="lg" className="mb-3" />
                <p className="t-h3 text-navy">{s.name}</p>
              </button>
            ))}
      </div>
    </div>
  );
}

export default function PracticePage() {
  const { slug } = useParams();
  if (!slug) return <PracticePicker />;
  return <PracticeSession slug={slug} />;
}

function PracticeSession({ slug }) {
  const navigate = useNavigate();
  const { sign } = useSign(slug);
  const { videoRef, status, trackingReady, hands, error, start, record, landmarkRef, fpsRef } = useWebcam();

  const [phase, setPhase] = useState("idle"); // idle | countdown | recording | scoring | done
  const [count, setCount] = useState(0);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [errMsg, setErrMsg] = useState(null);
  const [telemetry, setTelemetry] = useState({ hands: 0, fps: 0 });

  const overlayRef = useRef(null);

  // Live skeleton overlay: draw the detected landmarks onto a canvas over the
  // video, color-coded per finger. Also surfaces lightweight ML telemetry.
  useEffect(() => {
    let raf;
    const tick = () => {
      const cv = overlayRef.current;
      const video = videoRef.current;
      if (cv && video && video.videoWidth) {
        const w = video.clientWidth;
        const h = video.clientHeight;
        if (cv.width !== w || cv.height !== h) {
          cv.width = w;
          cv.height = h;
        }
        const ctx = cv.getContext("2d");
        const lms = landmarkRef.current || [];
        drawHands(ctx, lms, w, h, video.videoWidth, video.videoHeight);
        setTelemetry({ hands: lms.length, fps: Math.round(fpsRef.current || 0) });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [videoRef, landmarkRef, fpsRef]);

  const needTwo = sign?.hands === 2;
  const handsOk = needTwo ? hands.left && hands.right : hands.left || hands.right;
  const busy = phase === "countdown" || phase === "recording" || phase === "scoring";

  async function runAttempt() {
    setErrMsg(null);
    setResult(null);
    setPhase("countdown");
    for (let c = 3; c >= 1; c--) {
      setCount(c);
      await new Promise((r) => setTimeout(r, 700));
    }
    setPhase("recording");
    const frames = await record(RECORD_MS, { requireBoth: needTwo });

    if (frames.length < 5) {
      setErrMsg(
        needTwo
          ? "Couldn't see both hands clearly. Keep BOTH hands inside the box for the full 3 seconds and try again."
          : "No hand detected. Keep your hand inside the frame and try again."
      );
      setPhase("idle");
      return;
    }

    setPhase("scoring");
    try {
      const { data } = await api.post(`/practice/${slug}/attempt`, { landmarks: frames });
      setResult(data);
      setAttempts((a) => a + 1);
      setPhase("done");
    } catch (e) {
      setErrMsg(e.response?.data?.detail || e.response?.data?.error || "Evaluation failed.");
      setPhase("idle");
    }
  }

  const hint =
    phase === "recording" ? "Perform the sign now!"
    : phase === "scoring" ? "Evaluating your sign…"
    : status === "ready" && !trackingReady ? "Loading hand tracking…"
    : handsOk ? "Looking good — press Start when ready."
    : needTwo ? "Show BOTH hands inside the box."
    : "Show your hand inside the box.";

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {/* Header */}
      <div className="card px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/learn/${slug}`)}
            aria-label="Back to tutorial"
            className="grid place-items-center w-9 h-9 -ml-1 rounded-xl text-ink-soft hover:bg-cream
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <SignGlyph slug={slug} size="sm" />
          <div>
            <p className="t-h3 text-navy leading-tight">{sign?.name || slug}</p>
            <p className="text-[12px] text-ink-faint">{needTwo ? "Two hands" : "One hand"}</p>
          </div>
        </div>
        <span className="pill bg-teal/15 text-teal-dark">● Practice mode</span>
      </div>

      {/* Webcam stage */}
      <div className="card overflow-hidden">
        <div className="relative aspect-video w-full bg-navy-900">
          <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />

          {/* Live hand-skeleton overlay (color-coded per finger) */}
          <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* ML telemetry readout */}
          {status === "ready" && trackingReady && phase !== "recording" && (
            <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
              <span className="pill bg-navy/75 text-white text-[10px] backdrop-blur-sm">MediaPipe Hands</span>
              <span className="pill bg-navy/75 text-white text-[10px] backdrop-blur-sm tabular-nums">
                {telemetry.hands} hand{telemetry.hands === 1 ? "" : "s"} · {telemetry.hands * 21} landmarks · {telemetry.fps} FPS
              </span>
            </div>
          )}

          {/* Framing guide */}
          <div
            className={`absolute inset-6 rounded-3xl border-2 border-dashed transition-colors duration-300 ${
              handsOk ? "border-teal" : "border-white/40"
            }`}
          />

          {/* Hand detection chips.
              The camera is mirrored (selfie view), so MediaPipe's "left"/"right"
              is the opposite of the user's real hand. We label the chips from the
              USER's perspective: their left hand lands in the "right" slot. */}
          {status === "ready" && trackingReady && phase !== "recording" && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {(needTwo
                ? [{ slot: "right", label: "left hand" }, { slot: "left", label: "right hand" }]
                : [{ slot: "hand", label: "hand" }]
              ).map(({ slot, label }) => {
                const ok = needTwo ? hands[slot] : handsOk;
                return (
                  <span
                    key={label}
                    className={`pill text-[11px] ${ok ? "bg-teal text-white" : "bg-white/20 text-white"}`}
                  >
                    {ok ? "✓" : "○"} {label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Countdown */}
          {phase === "countdown" && (
            <div className="absolute inset-0 grid place-items-center bg-navy/50 backdrop-blur-sm">
              <span className="text-8xl font-extrabold text-white animate-pop" key={count}>{count}</span>
            </div>
          )}
          {phase === "recording" && (
            <div className="absolute top-3 left-3 pill bg-danger text-white animate-pulse">● REC</div>
          )}
          {phase === "scoring" && (
            <div className="absolute inset-0 grid place-items-center bg-navy/60 text-white font-semibold gap-3">
              <span className="w-8 h-8 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
              Evaluating…
            </div>
          )}

          {/* Camera gate / status */}
          {status !== "ready" && (
            <div className="absolute inset-0 grid place-items-center text-center px-6 bg-navy-900">
              {status === "idle" ? (
                <div className="text-white max-w-sm">
                  <CameraIcon className="w-10 h-10 mx-auto mb-3 text-accent" />
                  <p className="t-h3">Camera access needed</p>
                  <p className="text-[13px] text-white/65 mt-1.5 mb-4 leading-relaxed">
                    SakhiSign needs your camera to watch your hands and score your sign. Your video
                    stays on your device — only hand positions are analysed, never uploaded.
                  </p>
                  <button className="btn-primary" onClick={start}>Enable camera</button>
                </div>
              ) : status === "error" ? (
                <div className="text-white max-w-sm">
                  <CameraIcon className="w-9 h-9 mx-auto mb-2 text-white/70" />
                  <p className="t-h3">Camera is required to practise</p>
                  <p className="text-[13px] text-white/65 mt-1.5 mb-4 leading-relaxed">{error}</p>
                  <button className="btn-glass" onClick={start}>Try again</button>
                </div>
              ) : (
                <div className="text-white/70 flex flex-col items-center gap-2">
                  <span className="w-7 h-7 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
                  <span className="text-sm">Requesting camera…</span>
                </div>
              )}
            </div>
          )}

          {/* Live hint */}
          {status === "ready" && (
            <div className="absolute bottom-3 inset-x-3 flex justify-center">
              <span className="pill bg-navy/75 text-white backdrop-blur-sm text-[13px] px-4 py-1.5">{hint}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4">
          {errMsg && (
            <div className="surface bg-danger/8 border border-danger/15 p-3 mb-3 flex gap-2">
              <AlertIcon className="w-4 h-4 text-danger-dark shrink-0 mt-0.5" />
              <p className="text-[13px] text-danger-dark leading-snug">{errMsg}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={runAttempt}
              disabled={status !== "ready" || !trackingReady || busy}
            >
              {phase === "recording" ? "Recording…"
                : phase === "scoring" ? "Scoring…"
                : status === "ready" && !trackingReady ? "Loading tracking…"
                : attempts > 0 ? "Try Again" : "Start Practice"}
            </button>
            <button className="btn-ghost" onClick={() => navigate(`/learn/${slug}`)}>Tutorial</button>
          </div>
          <p className="text-[12px] text-ink-faint mt-2.5 text-center">
            {attempts > 0 ? `${attempts} attempt${attempts > 1 ? "s" : ""} this session` : "Keep your hand(s) inside the dashed box."}
          </p>
        </div>
      </div>

      {/* Result */}
      {phase === "done" && result && (
        <ResultsPanel
          signName={sign?.name || slug}
          result={result}
          onPracticeAgain={runAttempt}
          onTryAnother={() => navigate("/learn")}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWebcam } from "../hooks/useWebcam.js";
import { useSign, useSigns } from "../hooks/useSigns.js";
import ResultsPanel from "../components/ResultsPanel.jsx";
import { SignCardSkeleton } from "../components/Skeleton.jsx";
import SignGlyph from "../components/SignGlyph.jsx";
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
  const { videoRef, status, trackingReady, hands, error, start, record } = useWebcam();

  const [phase, setPhase] = useState("idle"); // idle | countdown | recording | scoring | done
  const [count, setCount] = useState(0);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    start();
  }, [start]);

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
        <div className="flex items-center gap-3">
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
        <div className="relative aspect-[16/10] max-h-[56vh] bg-navy-900">
          <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />

          {/* Framing guide */}
          <div
            className={`absolute inset-6 rounded-3xl border-2 border-dashed transition-colors duration-300 ${
              handsOk ? "border-teal" : "border-white/40"
            }`}
          />

          {/* Hand detection chips */}
          {status === "ready" && trackingReady && phase !== "recording" && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {(needTwo ? ["left", "right"] : ["hand"]).map((k) => {
                const ok = needTwo ? hands[k] : handsOk;
                return (
                  <span
                    key={k}
                    className={`pill text-[11px] ${ok ? "bg-teal text-white" : "bg-white/20 text-white"}`}
                  >
                    {ok ? "✓" : "○"} {needTwo ? `${k} hand` : "hand"}
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

          {/* Camera not ready */}
          {status !== "ready" && (
            <div className="absolute inset-0 grid place-items-center text-center px-6">
              {status === "error" ? (
                <div className="text-white/90">
                  <div className="text-3xl mb-2">📷</div>
                  <p className="t-h3">Camera unavailable</p>
                  <p className="text-[13px] text-white/60 mt-1">{error}</p>
                </div>
              ) : (
                <div className="text-white/70 flex flex-col items-center gap-2">
                  <span className="w-7 h-7 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
                  <span className="text-sm">Starting camera…</span>
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
              <span className="text-danger-dark">⚠</span>
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

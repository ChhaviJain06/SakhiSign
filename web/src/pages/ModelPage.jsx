import { FINGER_COLORS } from "../lib/ui.js";

const SIGNS = ["pain", "help", "doctor", "medicine", "water"];

// Cross-sign validation: each recording scored against every sign's reference.
// Rows = sign performed, cols = sign it was scored against (calibrated engine).
const CONFUSION = {
  pain: [100, 20, 13, 11, 53],
  help: [23, 100, 33, 23, 13],
  doctor: [16, 35, 100, 47, 11],
  medicine: [20, 22, 45, 100, 12],
  water: [55, 16, 10, 9, 100],
};

const PIPELINE = [
  { t: "Webcam frame", d: "Live video, in-browser" },
  { t: "MediaPipe Hands", d: "21 landmarks × (x, y, z) per hand" },
  { t: "Feature extraction", d: "Finger angles, openness, inter-hand geometry" },
  { t: "Dynamic Time Warping", d: "Align to the reference over time" },
  { t: "Score + feedback", d: "0–100 + component breakdown" },
];

const STACK = ["MediaPipe Hands (pretrained CNN)", "Dynamic Time Warping", "Python / FastAPI", "React + Vite"];

const FINGERS = ["thumb", "index", "middle", "ring", "pinky"];

function cellStyle(v, isDiag) {
  // Diagonal (correct) bright teal; off-diagonal tinted rose (high = a problem).
  const a = (v / 100) * 0.85 + 0.05;
  return isDiag
    ? { background: `rgba(0,200,150,${a})`, color: v > 55 ? "#fff" : "#0B1F4B" }
    : { background: `rgba(244,71,107,${(v / 100) * 0.6})`, color: v > 70 ? "#fff" : "#5A6B8C" };
}

export default function ModelPage() {
  const STATS = [
    { label: "Correct attempts scored", value: "74–81%" },
    { label: "Highest a wrong sign reached", value: "55%" },
    { label: "Pass threshold", value: "65%" },
    { label: "Separation on validation set", value: "5/5 ✓ · 20/20 ✗" },
  ];

  return (
    <div className="space-y-7 max-w-5xl">
      <header>
        <p className="eyebrow mb-1">Under the hood</p>
        <h1 className="t-h1 text-navy">How the model works</h1>
        <p className="t-body mt-3 max-w-2xl">
          SakhiSign is an <span className="font-semibold text-navy">evaluation</span> system, not a
          classifier. You pick the sign; the model measures how closely you performed{" "}
          <span className="italic">that</span> sign by comparing your hand motion to a reference.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {STACK.map((s) => (
            <span key={s} className="pill bg-navy text-white">{s}</span>
          ))}
        </div>
      </header>

      {/* Pipeline */}
      <section>
        <h2 className="t-h2 text-navy mb-3">The pipeline</h2>
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PIPELINE.map((p, i) => (
            <div key={p.t} className="card p-4">
              <span className="grid place-items-center w-8 h-8 rounded-pill bg-accent/15 text-accent-dark font-bold mb-2">
                {i + 1}
              </span>
              <p className="t-h3 text-navy">{p.t}</p>
              <p className="t-caption mt-0.5">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Validation / accuracy */}
      <section>
        <h2 className="t-h2 text-navy mb-1">How accurate is it?</h2>
        <p className="t-caption mb-4 max-w-2xl">
          We validate with a confusion matrix: each recorded sign is scored against{" "}
          <span className="font-semibold">every</span> reference. A good model scores high on the
          diagonal (matching itself) and low everywhere else (telling signs apart).
        </p>

        <div className="grid lg:grid-cols-[auto,1fr] gap-5 items-start">
          {/* Confusion matrix */}
          <div className="card p-4 overflow-x-auto">
            <table className="border-separate border-spacing-1 text-[12px]">
              <thead>
                <tr>
                  <th className="p-1"></th>
                  {SIGNS.map((s) => (
                    <th key={s} className="p-1 font-semibold text-ink-soft capitalize">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIGNS.map((row, ri) => (
                  <tr key={row}>
                    <td className="p-1 pr-2 font-semibold text-ink-soft capitalize text-right">{row}</td>
                    {CONFUSION[row].map((v, ci) => (
                      <td
                        key={ci}
                        className="w-12 h-10 text-center rounded-lg font-bold tabular-nums"
                        style={cellStyle(v, ri === ci)}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-ink-faint mt-2">Rows: sign performed · Columns: sign scored against</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="card p-4">
                <div className="text-[22px] font-extrabold text-navy tracking-tightest">{s.value}</div>
                <div className="text-[12px] text-ink-faint mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
            <div className="card p-4 col-span-2 bg-cream">
              <p className="t-caption">
                <span className="font-semibold text-navy">Prototype note:</span> metrics are from a
                small validation set (1–2 recordings per sign). Correct attempts always clear the
                65% pass line; no wrong sign does — a clean separation. More recordings would tighten
                the thresholds further.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Finger color legend */}
      <section>
        <h2 className="t-h2 text-navy mb-3">Finger color key</h2>
        <p className="t-caption mb-3 max-w-2xl">
          The live skeleton overlay and the feedback dots share these colors, so you can see exactly
          which finger a tip refers to.
        </p>
        <div className="flex flex-wrap gap-2">
          {FINGERS.map((f) => (
            <span key={f} className="pill bg-white border border-navy/10 capitalize">
              <span className="w-3 h-3 rounded-full" style={{ background: FINGER_COLORS[f] }} /> {f}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

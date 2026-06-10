import ScoreRing from "./ScoreRing.jsx";
import ComponentRadar from "./ComponentRadar.jsx";
import { scoreColor, scoreBar, verdictLabel, fingerInText, FINGER_COLORS } from "../lib/ui.js";

const COMPONENTS = [
  { key: "handshape", label: "Handshape" },
  { key: "position", label: "Position" },
  { key: "movement", label: "Movement" },
  { key: "timing", label: "Timing" },
];

/**
 * result = { overallAccuracy, componentScores, feedbackMessages, mirrored }
 */
export default function ResultsPanel({ signName, result, onPracticeAgain, onTryAnother }) {
  const score = Math.round(result.overallAccuracy);
  const verdict = verdictLabel(score);
  const great = score >= 80;

  return (
    <div className="card overflow-hidden animate-scaleIn">
      {/* Ticket header */}
      <div className="bg-navy text-white px-5 py-4 flex items-center justify-between navy-pattern relative">
        <div className="relative z-10">
          <p className="eyebrow text-white/60">Sign</p>
          <p className="t-h2">{signName}</p>
        </div>
        <span
          className={`relative z-10 pill ${
            great ? "bg-teal text-white" : score >= 60 ? "bg-accent text-white" : "bg-white/15 text-white"
          }`}
        >
          {verdict}
        </span>
      </div>

      {/* Perforation */}
      <div className="relative h-5 bg-navy">
        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-pill bg-cream" />
        <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-pill bg-cream" />
        <div className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-white/30" />
      </div>

      <div className="p-5">
        {/* Score ring */}
        <div className="flex flex-col items-center mb-6">
          <ScoreRing value={score} />
          {result.mirrored && (
            <div className="pill bg-teal/15 text-teal-dark mt-3">↔ Performed with the opposite hand</div>
          )}
        </div>

        {/* Component breakdown — radar + values */}
        <p className="eyebrow mb-2">Component breakdown</p>
        <div className="surface p-4 mb-6 flex flex-col sm:flex-row items-center gap-5">
          <ComponentRadar scores={result.componentScores} size={196} />
          <div className="flex-1 w-full grid grid-cols-2 gap-x-5 gap-y-3">
            {COMPONENTS.map(({ key, label }) => {
              const v = Math.round(result.componentScores?.[key] ?? 0);
              return (
                <div key={key}>
                  <div className="flex justify-between items-center text-[12px] mb-1">
                    <span className="text-ink-soft">{label}</span>
                    <span className="font-bold text-navy">{v}%</span>
                  </div>
                  <div className="h-1.5 rounded-pill bg-navy/10 overflow-hidden">
                    <div className={`h-full ${scoreBar(v)} transition-all duration-700`} style={{ width: `${v}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suggestions */}
        {result.feedbackMessages?.length > 0 && (
          <div className="mb-6">
            <p className="eyebrow mb-2">{great ? "Notes" : "How to improve"}</p>
            <ul className="space-y-2">
              {result.feedbackMessages.map((m, i) => {
                const finger = fingerInText(m);
                return (
                  <li key={i} className="flex gap-2.5 t-body text-ink items-start">
                    <span
                      className="mt-[7px] w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white"
                      style={{ background: finger ? FINGER_COLORS[finger] : "#FF9F1C" }}
                      title={finger ? `${finger} finger` : undefined}
                    />
                    <span>{m}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={onPracticeAgain}>Practice Again</button>
          <button className="btn-ghost flex-1" onClick={onTryAnother}>Try Another Sign</button>
        </div>
      </div>
    </div>
  );
}

import { scoreColor, scoreBar, verdictLabel, scoreHex } from "../lib/ui.js";

const COMPONENTS = [
  { key: "handshape", label: "Handshape" },
  { key: "position", label: "Position" },
  { key: "movement", label: "Movement" },
  { key: "timing", label: "Timing" },
];

/**
 * Compact review of a user's most recent attempt at a sign.
 * Used inline inside expandable sign cards (and anywhere a quick recap fits).
 * `attempt` = { overallAccuracy, componentScores, feedbackMessages, mirrored, timestamp }
 */
export default function AttemptReview({ attempt }) {
  const score = Math.round(attempt.overallAccuracy);
  const when = attempt.timestamp
    ? new Date(attempt.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <div className="surface p-4">
      <div className="flex items-center gap-4">
        {/* Mini score dial */}
        <div
          className="grid place-items-center w-16 h-16 rounded-full shrink-0"
          style={{ background: `conic-gradient(${scoreHex(score)} ${score * 3.6}deg, rgba(11,31,75,0.08) 0deg)` }}
        >
          <div className="grid place-items-center w-12 h-12 rounded-full bg-white">
            <span className="text-[17px] font-extrabold text-navy leading-none">{score}%</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="t-h3 text-navy">Last attempt</p>
          <p className="t-caption">
            {verdictLabel(score)}
            {when ? ` · ${when}` : ""}
            {attempt.mirrored ? " · opposite hand" : ""}
          </p>
        </div>
      </div>

      {/* Component mini-bars */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4">
        {COMPONENTS.map(({ key, label }) => {
          const v = Math.round(attempt.componentScores?.[key] ?? 0);
          return (
            <div key={key}>
              <div className="flex justify-between text-[12px] mb-1">
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

      {/* Feedback */}
      {attempt.feedbackMessages?.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {attempt.feedbackMessages.slice(0, 4).map((m, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-ink">
              <span className="text-accent-dark font-bold shrink-0">›</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import SignGlyph from "./SignGlyph.jsx";
import { ArrowRightIcon } from "./icons.jsx";
import { categoryPill, scoreColor, scoreBar, SIGN_TAGLINE } from "../lib/ui.js";

/**
 * Compact, equal-height sign card (SaaS density).
 *   top    — glyph + score badge
 *   middle — name, category, one-line description
 *   bottom — progress bar + "Continue learning" CTA with arrow
 */
export default function SignCard({ sign }) {
  const navigate = useNavigate();
  const score = sign.lastScore;
  const practised = score != null;

  return (
    <button
      onClick={() => navigate(`/learn/${sign.slug}`)}
      aria-label={`Open ${sign.name} tutorial`}
      className="card-interactive group p-4 text-left flex flex-col min-h-[220px] w-full
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <SignGlyph slug={sign.slug} size="md" />
        <span className={`pill ${scoreColor(score)}`}>{practised ? `${score}%` : "New"}</span>
      </div>

      {/* Middle */}
      <div className="mt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="t-h3 text-navy">{sign.name}</h3>
          <span className={`pill ${categoryPill(sign.category)}`}>{sign.category}</span>
        </div>
        <p className="text-[13px] text-ink-soft leading-snug mt-1.5 line-clamp-2">
          {SIGN_TAGLINE[sign.slug] || sign.description}
        </p>
      </div>

      {/* Bottom */}
      <div className="mt-auto pt-4">
        <div className="h-1.5 rounded-pill bg-navy/[0.08] overflow-hidden mb-3">
          <div
            className={`h-full rounded-pill ${scoreBar(score)} transition-all duration-700`}
            style={{ width: `${score || 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-accent-dark">
            {practised ? "Continue learning" : "Start learning"}
          </span>
          <span className="grid place-items-center w-7 h-7 rounded-pill bg-cream text-navy
                           transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden>
            <ArrowRightIcon className="w-4 h-4" />
          </span>
        </div>
      </div>
    </button>
  );
}

import { useEffect, useState } from "react";
import { scoreHex } from "../lib/ui.js";

/**
 * Animated circular progress ring for a 0-100 score.
 * Used on the results panel and dashboard for a premium, rewarding feel.
 */
export default function ScoreRing({
  value = 0,
  size = 168,
  stroke = 14,
  label = "Overall accuracy",
}) {
  const [shown, setShown] = useState(0);
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, shown));
  const offset = circ - (pct / 100) * circ;
  const color = scoreHex(value);

  // Animate from 0 to the target value on mount / change.
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(11,31,75,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[44px] font-extrabold leading-none text-navy tracking-tightest">
            {Math.round(value)}
            <span className="text-2xl align-top">%</span>
          </div>
          <div className="t-caption mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

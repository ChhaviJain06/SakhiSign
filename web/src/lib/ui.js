// Shared UI helpers + content maps.

export const CATEGORY_STYLES = {
  Emergency: "bg-danger/12 text-danger-dark",
  Healthcare: "bg-teal/15 text-teal-dark",
  "Basic Need": "bg-accent/15 text-accent-dark",
};

export function categoryPill(category) {
  return CATEGORY_STYLES[category] || "bg-navy/10 text-navy";
}

// Score -> color band for pills / bars.
export function scoreColor(score) {
  if (score == null) return "bg-navy/10 text-ink-soft";
  if (score >= 80) return "bg-teal/15 text-teal-dark";
  if (score >= 60) return "bg-accent/15 text-accent-dark";
  return "bg-danger/12 text-danger-dark";
}

export function scoreBar(score) {
  if (score == null) return "bg-navy/20";
  if (score >= 80) return "bg-teal";
  if (score >= 60) return "bg-accent";
  return "bg-danger";
}

// Raw hex (for the SVG score ring stroke).
export function scoreHex(score) {
  if (score == null) return "#23386F";
  if (score >= 80) return "#00C896";
  if (score >= 60) return "#FF9F1C";
  return "#F4476B";
}

export function verdictLabel(score) {
  if (score == null) return "Not practiced";
  if (score >= 80) return "Mastered";
  if (score >= 65) return "Almost there";
  if (score >= 45) return "Needs practice";
  return "Keep trying";
}

// Short, one-line taglines for the compact sign cards.
export const SIGN_TAGLINE = {
  pain: "Signal that you are in pain or hurt.",
  help: "Call for help in an emergency.",
  doctor: "Ask for a doctor or medical aid.",
  medicine: "Request medicine you need.",
  water: "Ask for water.",
};

export const SIGN_EMOJI = {
  pain: "🤕",
  help: "🆘",
  doctor: "🩺",
  medicine: "💊",
  water: "💧",
  emergency: "🚨",
};

/**
 * Per-sign meaning & usage content shown on the Sign Detail page.
 *
 * ── FILL THIS IN with the real content (coming via WhatsApp). ──
 * Each entry: {
 *   meaning: "What the sign actually means.",
 *   usage:   "When / where you'd use it in real life.",
 *   safety:  "Optional safety or context note." (optional)
 * }
 * Any sign left out (or with empty fields) shows a tasteful 'coming soon'
 * placeholder in the UI, so it's safe to fill these one at a time.
 */
export const SIGN_INFO = {
  pain: { meaning: "", usage: "", safety: "" },
  help: { meaning: "", usage: "", safety: "" },
  doctor: { meaning: "", usage: "", safety: "" },
  medicine: { meaning: "", usage: "", safety: "" },
  water: { meaning: "", usage: "", safety: "" },
};

export function getSignInfo(slug) {
  const info = SIGN_INFO[slug];
  if (!info) return null;
  const hasContent = !!(info.meaning || info.usage || info.safety);
  return { ...info, hasContent };
}

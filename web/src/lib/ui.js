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

// Per-finger colors — shared by the live hand-skeleton overlay and the
// feedback dots, so users can connect a tip to the finger it refers to.
export const FINGER_COLORS = {
  thumb: "#FB7185",  // rose
  index: "#FB923C",  // orange
  middle: "#FACC15", // amber
  ring: "#34D399",   // emerald
  pinky: "#60A5FA",  // blue
  palm: "#CBD5E1",   // slate (wrist/palm)
};

const FINGER_NAMES = ["thumb", "index", "middle", "ring", "pinky"];

/** Return the finger mentioned in a feedback string (or null). */
export function fingerInText(text = "") {
  const t = text.toLowerCase();
  return FINGER_NAMES.find((f) => t.includes(f)) || null;
}

// Short, one-line taglines for the compact sign cards.
export const SIGN_TAGLINE = {
  pain: "Signal that you are in pain or hurt.",
  help: "Call for help in an emergency.",
  doctor: "Ask for a doctor or medical aid.",
  medicine: "Request medicine you need.",
  water: "Ask for water.",
  toilet: "Ask for the toilet or restroom.",
  danger: "Warn others of danger nearby.",
  wound: "Show that you have a wound or injury.",
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
  pain: {
    meaning:
      "Tells the people around you that you are hurt or in physical pain, and that you need attention for it.",
    usage:
      "Use it when you cannot speak — to show a doctor, a helper, or a bystander that something hurts and you need care.",
    safety:
      "Right after making the sign, point to the part of your body that hurts so help can find the problem faster.",
  },
  help: {
    meaning:
      "A direct request for assistance — it simply says, “I need help.”",
    usage:
      "Use it in any emergency or unsafe situation to signal that you need someone to come to your aid right away.",
    safety:
      "Make the sign large and at chest height so it stays visible from a distance, even in a crowd or low light.",
  },
  doctor: {
    meaning:
      "Asks for a doctor or a trained medical professional.",
    usage:
      "Use it when you or someone near you needs medical care and you are unable to say it out loud.",
    safety:
      "Combine it with the Pain sign to show that the medical need is urgent, not routine.",
  },
  medicine: {
    meaning:
      "Requests medicine or medical treatment.",
    usage:
      "Use it to ask for medication — at a pharmacy or hospital, or when you need a regular dose and can’t explain in words.",
    safety:
      "If it’s for a specific condition, keep a small written note or card with your medicine’s name to show alongside the sign.",
  },
  water: {
    meaning:
      "Says that you are thirsty or need water.",
    usage:
      "Use it to ask for a drink — especially important during distress, dehydration, or a long wait for help.",
    safety:
      "It’s simple and universally understood, which makes it a great first sign to learn and remember under stress.",
  },
  toilet: {
    meaning:
      "Tells someone that you need to use the toilet or restroom.",
    usage:
      "Use it to ask for the bathroom when you can’t say it aloud — helpful in hospitals, unfamiliar places, or for children.",
    safety:
      "A simple everyday need, but important for dignity and comfort when speaking isn’t possible.",
  },
  danger: {
    meaning:
      "Warns that there is danger or a threat nearby.",
    usage:
      "Use it to alert the people around you to a hazard, an unsafe situation, or a person to be wary of.",
    safety:
      "Pair it with the Help sign so others don’t just notice the danger — they act on it.",
  },
  wound: {
    meaning:
      "Shows that you are injured or have a wound, and roughly where it is.",
    usage:
      "Use it to tell a helper or medic that you’re hurt and the injury needs attention.",
    safety:
      "Point to the wound right after making the sign so help knows exactly where to look.",
  },
};

export function getSignInfo(slug) {
  const info = SIGN_INFO[slug];
  if (!info) return null;
  const hasContent = !!(info.meaning || info.usage || info.safety);
  return { ...info, hasContent };
}

/**
 * Tutorial video per sign. Two ways to provide one (use whichever you have):
 *   1. Local file  -> drop it in  web/public/media/<sign>.mp4  and set:
 *        pain: { src: "/media/pain.mp4" }
 *   2. YouTube     -> set the video id (the part after v=):
 *        help: { youtube: "dQw4w9WgXcQ" }
 * Leave a sign out (or empty) to show the "coming soon" placeholder.
 */
export const SIGN_TUTORIAL = {
  pain: { src: "/media/pain.gif" },
  help: { src: "/media/help.gif" },
  medicine: { youtube: "9odwds_amPo", start: 4 },
  water: { youtube: "5FSC6Og1RBQ", start: 1 },
  doctor: { youtube: "-5lgXJQG0EM" },
  toilet: { youtube: "p8-zJttOAKc" },
  danger: { youtube: "xVuM_WPsOB8" },
  wound: { youtube: "_I7a-SaQTbQ" },
};

export function getTutorial(slug) {
  const t = SIGN_TUTORIAL[slug];
  if (!t || (!t.src && !t.youtube)) return null;
  return t;
}

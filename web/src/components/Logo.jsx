/**
 * SakhiSign logo mark — a navy rounded tile with an amber open-hand glyph
 * (hands = sign language). Used in the sidebar, auth screens and as the
 * in-app brand. Pair with a "SakhiSign" wordmark where space allows.
 */
export default function Logo({ className = "w-9 h-9" }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-xl shadow-soft ${className}`}
      style={{ background: "linear-gradient(135deg, #15295C 0%, #0B1F4B 100%)" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="w-[62%] h-[62%]" fill="none" stroke="#FF9F1C"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 13V5a1.5 1.5 0 0 1 3 0v6" />
        <path d="M11 11V4a1.5 1.5 0 0 1 3 0v7" />
        <path d="M14 11V5.5a1.5 1.5 0 0 1 3 0V13c0 4-2.5 7-6.5 7C7 20 5 18 4 15l-1.2-3a1.4 1.4 0 0 1 2.3-1.5L8 13" />
      </svg>
    </span>
  );
}

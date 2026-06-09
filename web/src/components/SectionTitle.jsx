import { Link } from "react-router-dom";

/**
 * Consistent section header used across pages.
 * Optional eyebrow label, and an optional action link on the right.
 */
export default function SectionTitle({ eyebrow, title, action, to, onAction }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="t-h2 text-navy">{title}</h2>
      </div>
      {action &&
        (to ? (
          <Link to={to} className="text-[13px] font-semibold text-accent-dark hover:underline shrink-0">
            {action}
          </Link>
        ) : (
          <button onClick={onAction} className="text-[13px] font-semibold text-accent-dark hover:underline shrink-0">
            {action}
          </button>
        ))}
    </div>
  );
}

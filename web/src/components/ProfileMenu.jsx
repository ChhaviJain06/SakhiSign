import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Profile dropdown in the top bar.
 * Clicking the avatar opens a menu with account details + actions
 * (instead of logging the user out immediately).
 */
export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const initial = (user?.name || "G").trim().charAt(0).toUpperCase();
  const firstName = user?.isGuest ? "Guest" : (user?.name || "Account").split(" ")[0];

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-pill bg-cream hover:bg-navy/[0.06] border border-navy/[0.06] pl-1 pr-2.5 py-1 transition-colors
                   focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
      >
        <span className="grid place-items-center w-8 h-8 rounded-pill bg-accent text-navy font-bold text-sm">
          {initial}
        </span>
        <span className="text-[13px] font-semibold text-navy hidden sm:block max-w-[90px] truncate">{firstName}</span>
        <span className="text-ink-faint text-xs">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-cardHover overflow-hidden z-50 animate-scaleIn origin-top-right text-ink"
        >
          {/* Account details */}
          <div className="p-4 bg-cream">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-11 h-11 rounded-pill bg-accent text-navy font-extrabold">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="t-h3 text-navy truncate">{user?.name || "Guest"}</p>
                <p className="text-[12px] text-ink-faint truncate">
                  {user?.isGuest ? "Guest session" : user?.email || "Signed in"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <span className="pill bg-white text-ink-soft">🔥 {user?.streak ?? 0} day streak</span>
              {user?.isGuest && <span className="pill bg-accent/15 text-accent-dark">Guest</span>}
            </div>
          </div>

          <div className="p-1.5">
            <button
              role="menuitem"
              onClick={() => { setOpen(false); navigate("/dashboard"); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-[14px] font-medium text-navy hover:bg-cream flex items-center gap-2.5"
            >
              <span>📊</span> My progress
            </button>
            {user?.isGuest && (
              <button
                role="menuitem"
                onClick={() => { setOpen(false); logout(); navigate("/signup"); }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-[14px] font-medium text-navy hover:bg-cream flex items-center gap-2.5"
              >
                <span>✨</span> Create an account
              </button>
            )}
            <button
              role="menuitem"
              onClick={() => { setOpen(false); logout(); }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-[14px] font-semibold text-danger-dark hover:bg-danger/5 flex items-center gap-2.5"
            >
              <span>↩</span> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

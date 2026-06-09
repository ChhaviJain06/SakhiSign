import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import { HomeIcon, CameraIcon, ChartIcon, InfoIcon, XIcon } from "./icons.jsx";

const LINKS = [
  { to: "/", label: "Home", Icon: HomeIcon, end: true },
  { to: "/practice", label: "Practice", Icon: CameraIcon },
  { to: "/dashboard", label: "Dashboard", Icon: ChartIcon },
  { to: "/about", label: "About", Icon: InfoIcon },
];

/**
 * Navigation sidebar.
 *  - Desktop (lg+): part of the flex layout, so the content area resizes with
 *    it. Toggles between expanded (260px, icon + label) and collapsed (80px,
 *    icon only). No overlap, no horizontal scroll.
 *  - Below lg: a slide-in overlay drawer.
 */
export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCloseMobile();
    if (mobileOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onCloseMobile}
        className={`fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm lg:hidden transition-opacity duration-300
          ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
      />

      <aside
        aria-label="Main navigation"
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen shrink-0 flex flex-col
          bg-navy text-white border-r border-white/5
          transition-[width,transform] duration-300 ease-out
          w-[260px] ${collapsed ? "lg:w-20" : "lg:w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Brand */}
        <div className={`h-16 shrink-0 flex items-center gap-2.5 ${collapsed ? "lg:justify-center lg:px-0" : "px-4"} px-4`}>
          <Logo className="w-9 h-9" />
          <span className={`font-extrabold tracking-tightest text-[18px] whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
            SakhiSign
          </span>
          <button
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="ml-auto lg:hidden grid place-items-center w-9 h-9 rounded-xl text-white/70 hover:bg-white/10"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {LINKS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl text-[15px] font-semibold transition-colors
                 ${collapsed ? "lg:justify-center lg:px-0" : ""} px-3 py-2.5
                 ${isActive ? "bg-accent text-navy" : "text-white/70 hover:bg-white/10 hover:text-white"}`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer tagline */}
        <div className={`p-4 text-[12px] leading-snug text-white/45 ${collapsed ? "lg:hidden" : ""}`}>
          Built for women's safety, healthcare &amp; emergencies.
        </div>
      </aside>
    </>
  );
}

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import ProfileMenu from "./ProfileMenu.jsx";
import { MenuIcon } from "./icons.jsx";

const TITLES = {
  "/": "Home",
  "/practice": "Practice",
  "/dashboard": "Dashboard",
  "/model": "Model",
  "/about": "About",
};

// Fluid page gutter — grows with the viewport instead of a fixed container.
const GUTTER = { paddingInline: "clamp(16px, 3vw, 40px)" };

export default function AppShell() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sakhi_sb") === "1");
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = TITLES[pathname] || (pathname.startsWith("/learn/") ? "Tutorial" : "SakhiSign");

  function toggle() {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setCollapsed((c) => {
        localStorage.setItem("sakhi_sb", !c ? "1" : "0");
        return !c;
      });
    } else {
      setMobileOpen((o) => !o);
    }
  }

  return (
    <div className="min-h-screen bg-cream lg:flex">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Header (light) */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-navy/[0.06]">
          <div className="h-16 flex items-center justify-between gap-3" style={GUTTER}>
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={toggle}
                aria-label="Toggle navigation"
                className="grid place-items-center w-10 h-10 -ml-1 rounded-xl text-navy hover:bg-cream transition-colors
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
              <h1 className="t-h3 text-navy truncate">{title}</h1>
            </div>
            <ProfileMenu />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 py-6" style={GUTTER}>
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

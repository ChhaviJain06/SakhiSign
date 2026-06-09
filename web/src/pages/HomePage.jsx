import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSigns } from "../hooks/useSigns.js";
import { useAuth } from "../context/AuthContext.jsx";
import SignCard from "../components/SignCard.jsx";
import { SignCardSkeleton } from "../components/Skeleton.jsx";

export default function HomePage() {
  const { signs, loading, error } = useSigns();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(signs.map((s) => s.category)))],
    [signs]
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return signs.filter((s) => {
      const mq = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      const mc = category === "All" || s.category === category;
      return mq && mc;
    });
  }, [signs, query, category]);

  const scrollToSigns = () =>
    document.getElementById("signs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const greeting = user?.isGuest ? "Welcome" : `Welcome back, ${user?.name?.split(" ")[0] || "there"}`;

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="hero-panel navy-pattern rounded-2xl px-6 sm:px-10 py-8 sm:py-10">
        <div className="relative max-w-2xl">
          <p className="eyebrow text-accent mb-2">{greeting}</p>
          <h1 className="t-h1 sm:t-display">A safety companion for every woman</h1>
          <p className="text-white/70 mt-3 text-[14px] sm:text-[15px] leading-relaxed max-w-xl">
            SakhiSign helps women learn and master sign language for emergencies, healthcare and
            personal safety — with instant, AI-powered feedback on every attempt.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <button className="btn-primary" onClick={scrollToSigns}>Browse signs</button>
            <button className="btn-glass" onClick={() => navigate("/about")}>How it works</button>
          </div>
        </div>
      </section>

      {/* Signs */}
      <section id="signs" className="scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <p className="eyebrow mb-1">Healthcare &amp; emergency pack</p>
            <h2 className="t-h2 text-navy">Choose a sign to learn</h2>
          </div>
        </div>

        {/* Search (left) + filters (right) — single row on desktop */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
          <div className="relative md:flex-1 md:max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden>🔍</span>
            <input
              className="input pl-11"
              placeholder="Search signs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search signs"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] md:ml-auto -mx-1 px-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`chip whitespace-nowrap ${
                  category === c
                    ? "bg-navy text-white border-navy"
                    : "bg-white text-ink-soft border-navy/12 hover:border-navy/25"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-danger-dark">{error}</p>}

        {/* Auto-fit, full-width responsive grid */}
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SignCardSkeleton key={i} />)
            : filtered.map((s) => <SignCard key={s.slug} sign={s} />)}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="card p-8 text-center">
            <p className="t-h3 text-navy">No signs found</p>
            <p className="t-caption mt-1">Try a different search or category.</p>
          </div>
        )}
      </section>
    </div>
  );
}

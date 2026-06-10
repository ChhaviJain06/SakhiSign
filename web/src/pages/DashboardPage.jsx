import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import SignGlyph from "../components/SignGlyph.jsx";
import { RowSkeleton, Skeleton } from "../components/Skeleton.jsx";
import { TrophyIcon, TargetIcon, FlameIcon } from "../components/icons.jsx";
import { scoreBar, scoreColor, verdictLabel } from "../lib/ui.js";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [signs, setSigns] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/summary").then((r) => setSummary(r.data)),
      api.get("/dashboard/signs").then((r) => setSigns(r.data.signs)),
      api.get("/dashboard/history?limit=10").then((r) => setHistory(r.data.items)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { Icon: TrophyIcon, tint: "text-amber-600 bg-amber-50", label: "Signs mastered",
      value: summary ? `${summary.signsMastered}/${signs.length || summary.signsTried || 0}` : "—" },
    { Icon: TargetIcon, tint: "text-teal-600 bg-teal-50", label: "Avg accuracy",
      value: summary ? `${summary.averageAccuracy}%` : "—" },
    { Icon: FlameIcon, tint: "text-rose-500 bg-rose-50", label: "Day streak",
      value: summary ? `${summary.currentStreak}` : "—" },
  ];

  const practiced = signs.filter((s) => s.attempts > 0).length;
  const insight =
    summary && summary.totalAttempts > 0
      ? `You've practiced ${practiced} of ${signs.length} signs at ${summary.averageAccuracy}% average accuracy.`
      : "Practice your first sign to start tracking progress here.";

  const fmtDate = (t) =>
    t ? new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-1">Your progress</p>
        <h1 className="t-h1 text-navy">Dashboard</h1>
        <p className="t-caption mt-0.5">
          {user?.isGuest ? "Guest progress (this device)" : `Welcome back, ${user?.name?.split(" ")[0] || "learner"}`}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {kpis.map(({ Icon, tint, label, value }) => (
          <div key={label} className="card p-4 flex flex-col items-center text-center gap-2">
            <span className={`grid place-items-center w-10 h-10 rounded-xl ${tint}`}>
              <Icon className="w-5 h-5" />
            </span>
            <div className="text-[24px] font-extrabold text-navy leading-none tracking-tightest">{value}</div>
            <div className="text-[11px] text-ink-faint leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Continue where you left off / first-time insight */}
      {history[0] ? (
        <div className="card p-4 sm:p-5 flex items-center gap-4">
          <SignGlyph slug={history[0].sign} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="eyebrow mb-0.5">Continue where you left off</p>
            <p className="t-h2 text-navy capitalize">{history[0].sign}</p>
            <p className="t-caption">
              Last score {history[0].overallAccuracy}% · {verdictLabel(history[0].overallAccuracy)}
            </p>
          </div>
          <button className="btn-primary shrink-0" onClick={() => navigate(`/practice/${history[0].sign}`)}>
            Resume
          </button>
        </div>
      ) : (
        <div className="card p-4 bg-gradient-to-br from-navy-700 to-navy text-white">
          <p className="text-[14px] leading-snug text-white/85">{insight}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
      {/* Sign mastery */}
      <div>
        <SectionTitle eyebrow="Skill tracking" title="Sign mastery" />
        <div className="space-y-2.5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
            : signs.map((s) => (
                <div key={s.slug} className="card p-4 flex items-center gap-3">
                  <SignGlyph slug={s.slug} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <p className="t-h3 text-navy truncate">{s.name}</p>
                      <span className={`pill ${scoreColor(s.attempts ? s.mastery : null)}`}>
                        {s.attempts ? `${s.mastery}%` : "—"}
                      </span>
                    </div>
                    <div className="h-2 rounded-pill bg-navy/[0.08] overflow-hidden mt-2">
                      <div
                        className={`h-full ${scoreBar(s.attempts ? s.mastery : null)} transition-all duration-700`}
                        style={{ width: `${s.attempts ? s.mastery : 0}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-ink-faint mt-1.5">
                      {s.attempts ? `${verdictLabel(s.mastery)} · ${s.attempts} attempt${s.attempts > 1 ? "s" : ""}` : "Not practiced yet"}
                    </p>
                  </div>
                  <button
                    className="btn-ghost text-[13px] px-4 min-h-[40px] shrink-0"
                    onClick={() => navigate(`/practice/${s.slug}`)}
                  >
                    Practice
                  </button>
                </div>
              ))}
        </div>
      </div>

      {/* Recent activity (list) */}
      <div>
        <SectionTitle eyebrow="History" title="Recent activity" />
        {loading ? (
          <Skeleton className="h-32 w-full rounded-card" />
        ) : history.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="t-h3 text-navy">No attempts yet</p>
            <p className="t-caption mt-1">Your practice history will appear here.</p>
            <button className="btn-primary mt-4" onClick={() => navigate("/practice")}>Start practicing</button>
          </div>
        ) : (
          <div className="card divide-y divide-navy/[0.06]">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 p-3.5">
                <SignGlyph slug={h.sign} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="t-h3 text-navy capitalize">{h.sign}</p>
                  <p className="text-[12px] text-ink-faint">{verdictLabel(h.overallAccuracy)} · {fmtDate(h.timestamp)}</p>
                </div>
                <span className={`pill ${scoreColor(h.overallAccuracy)}`}>{h.overallAccuracy}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

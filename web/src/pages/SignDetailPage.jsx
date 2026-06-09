import { useParams, useNavigate } from "react-router-dom";
import { useSign } from "../hooks/useSigns.js";
import { PlayIcon } from "../components/icons.jsx";
import { Skeleton } from "../components/Skeleton.jsx";
import AttemptReview from "../components/AttemptReview.jsx";
import SignGlyph from "../components/SignGlyph.jsx";
import { categoryPill, getSignInfo } from "../lib/ui.js";

export default function SignDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { sign, loading, error } = useSign(slug);

  if (loading) return <DetailSkeleton />;
  if (error) return <p className="text-danger-dark">{error}</p>;

  const info = getSignInfo(sign.slug);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <button onClick={() => navigate("/learn")} className="text-[13px] font-semibold text-ink-soft hover:text-navy">
        ← Back to Signs
      </button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <SignGlyph slug={sign.slug} size="lg" />
        <div className="min-w-0">
          <h1 className="t-h1 text-navy">{sign.name}</h1>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <span className={`pill ${categoryPill(sign.category)}`}>{sign.category}</span>
            <span className="pill bg-navy/[0.06] text-ink-soft">{sign.hands === 2 ? "Two hands" : "One hand"}</span>
          </div>
        </div>
      </div>

      {/* Tutorial media */}
      <div className="card overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-navy-700 to-navy-900 grid place-items-center text-white relative navy-pattern">
          {sign.tutorialGifUrl && sign.tutorialVideoReady ? (
            <img src={sign.tutorialGifUrl} alt={`${sign.name} tutorial`} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center relative z-10">
              <button className="grid place-items-center w-16 h-16 rounded-pill bg-white/15 mx-auto mb-3 hover:bg-white/25 transition-colors">
                <PlayIcon className="w-7 h-7 translate-x-0.5" />
              </button>
              <p className="t-h3">Tutorial video coming soon</p>
              <p className="text-[13px] text-white/55 mt-0.5">A demo of the {sign.name} sign will play here.</p>
            </div>
          )}
        </div>
      </div>

      {/* WHAT THIS SIGN MEANS — content arrives later (via WhatsApp). */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-accent/12 text-accent-dark">💬</span>
          <h2 className="t-h2 text-navy">What this sign means</h2>
        </div>

        {info?.hasContent ? (
          <div className="space-y-4">
            {info.meaning && (
              <div>
                <p className="eyebrow mb-1">Meaning</p>
                <p className="t-body text-ink">{info.meaning}</p>
              </div>
            )}
            {info.usage && (
              <div>
                <p className="eyebrow mb-1">When to use it</p>
                <p className="t-body text-ink">{info.usage}</p>
              </div>
            )}
            {info.safety && (
              <div className="surface p-4 border-l-4 border-teal">
                <p className="eyebrow text-teal-dark mb-1">Good to know</p>
                <p className="t-body text-ink">{info.safety}</p>
              </div>
            )}
          </div>
        ) : (
          // Tasteful placeholder reserving the space until real content is added.
          <div className="space-y-3">
            <p className="t-body">
              A clear explanation of what the <span className="font-semibold text-navy">{sign.name}</span> sign
              means and the real-life situations where you'd use it will appear here.
            </p>
            <div className="surface p-4 flex items-start gap-3">
              <span className="text-lg">✍️</span>
              <p className="t-caption">
                Detailed meaning &amp; usage for this sign is being added. Check back soon.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Your last performance */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-teal/12 text-teal-dark">📊</span>
          <h2 className="t-h2 text-navy">Your last performance</h2>
        </div>
        {sign.lastAttempt ? (
          <AttemptReview attempt={sign.lastAttempt} />
        ) : (
          <div className="surface p-5 text-center">
            <div className="text-3xl mb-1">🎯</div>
            <p className="t-body">You haven't practised this sign yet.</p>
            <p className="t-caption mt-0.5">Practise it to see your score and feedback here.</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={() => navigate(`/practice/${sign.slug}`)}>
          {sign.lastAttempt ? "Practise Again" : "Start Practice"}
        </button>
        <button className="btn-ghost flex-1" onClick={() => navigate("/learn")}>
          Back to Signs
        </button>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-4 w-24 rounded-pill" />
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-3xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-pill" />
          <Skeleton className="h-4 w-44 rounded-pill" />
        </div>
      </div>
      <Skeleton className="aspect-video w-full rounded-card" />
      <Skeleton className="h-40 w-full rounded-card" />
    </div>
  );
}

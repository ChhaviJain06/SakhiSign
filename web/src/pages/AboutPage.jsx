import { useNavigate } from "react-router-dom";
import { ShieldIcon, AlertIcon, HeartIcon } from "../components/icons.jsx";

const MISSION = [
  { Icon: ShieldIcon, t: "Personal safety", d: "Communicate a need for help without words when speaking isn't possible or safe.", c: "text-amber-600 bg-amber-50" },
  { Icon: AlertIcon, t: "Emergency communication", d: "Signal pain, danger or urgency clearly so the people around you can respond.", c: "text-rose-500 bg-rose-50" },
  { Icon: HeartIcon, t: "Healthcare access", d: "Bridge the gap with doctors, nurses and caregivers during treatment.", c: "text-teal-600 bg-teal-50" },
];

const STEPS = [
  { n: 1, t: "Choose a sign", d: "Pick what you want to learn from the home page." },
  { n: 2, t: "Watch the tutorial", d: "See exactly how the sign is formed and moved." },
  { n: 3, t: "Practice on camera", d: "Perform the sign — your hands are tracked live." },
  { n: 4, t: "Get AI feedback", d: "Receive a score and specific tips on what to refine." },
];

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow mb-1">About SakhiSign</p>
        <h1 className="t-h1 text-navy">Sign language that helps women stay safe</h1>
        <p className="t-body mt-3 max-w-2xl">
          <span className="font-semibold text-navy">“Sakhi”</span> means a woman's trusted friend.
          SakhiSign is built for women — a companion to learn and master the essential signs that
          matter in emergencies, healthcare and unsafe situations, when speaking out loud isn't
          possible or safe.
        </p>
        <p className="t-body mt-3 max-w-2xl">
          You choose a sign, learn it, and practice it on camera. Our AI then evaluates how closely
          your performance matches the reference and gives you a score with clear, specific feedback —
          so you can build real confidence in signs that could one day make a difference.
        </p>
      </header>

      {/* Mission */}
      <section>
        <h2 className="t-h2 text-navy mb-3">Why it matters</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {MISSION.map(({ Icon, t, d, c }) => (
            <div key={t} className="card p-5">
              <div className={`grid place-items-center w-11 h-11 rounded-2xl mb-3 ${c}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="t-h3 text-navy">{t}</p>
              <p className="t-caption mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="t-h2 text-navy mb-3">How it works</h2>
        <div className="card divide-y divide-navy/[0.06]">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-center gap-4 p-4">
              <span className="grid place-items-center w-9 h-9 rounded-pill bg-navy text-white font-bold shrink-0">
                {s.n}
              </span>
              <div>
                <p className="t-h3 text-navy">{s.t}</p>
                <p className="t-caption">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Approach note */}
      <section className="card p-5 bg-gradient-to-br from-navy-700 to-navy text-white">
        <h2 className="t-h2 mb-2">Evaluation, not guesswork</h2>
        <p className="text-white/80 text-[14px] leading-relaxed max-w-2xl">
          SakhiSign doesn't try to guess which sign you're making. You tell it the sign you want to
          practice, and it measures how accurately you performed that specific sign — comparing
          hand shape, position, movement and timing against a reference. That's what makes the
          feedback precise and genuinely useful for learning.
        </p>
        <button className="btn-primary mt-4" onClick={() => navigate("/")}>
          Start practicing
        </button>
      </section>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { CheckIcon } from "../components/icons.jsx";
import Logo from "../components/Logo.jsx";

export default function LoginPage() {
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function guest() {
    setBusy(true);
    try {
      await continueAsGuest();
      navigate("/", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue learning life-saving signs.">
      <form onSubmit={submit} className="space-y-3">
        <input className="input" type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3 text-navy/30 text-xs">
        <div className="h-px flex-1 bg-navy/10" /> OR <div className="h-px flex-1 bg-navy/10" />
      </div>

      <button className="btn-ghost w-full" onClick={guest} disabled={busy}>
        Continue as Guest
      </button>

      <p className="text-center text-sm text-navy/60 mt-5">
        New here?{" "}
        <Link to="/signup" className="text-accent-dark font-semibold">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

const BENEFITS = [
  "Practice on camera with instant AI feedback",
  "Learn key signs for emergencies and healthcare",
  "Built for women's safety and independence",
];

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand / value panel (desktop) */}
      <div className="hidden lg:flex hero-panel navy-pattern flex-col justify-between p-12">
        <div className="relative flex items-center gap-2.5">
          <Logo className="w-10 h-10" />
          <span className="text-xl font-extrabold tracking-tightest text-white">SakhiSign</span>
        </div>
        <div className="relative">
          <h2 className="t-display text-white max-w-md">Learn the signs that keep you safe.</h2>
          <p className="text-white/65 mt-4 max-w-md leading-relaxed">
            A learning companion built for women — practice essential sign language for emergencies,
            healthcare and personal safety.
          </p>
          <ul className="mt-8 space-y-3.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-white/85">
                <span className="grid place-items-center w-6 h-6 rounded-pill bg-accent/20 text-accent shrink-0">
                  <CheckIcon className="w-4 h-4" />
                </span>
                <span className="text-[14px]">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-white/40 text-[12px]">Women's safety · Healthcare · Emergencies</p>
      </div>

      {/* Form panel */}
      <div className="min-h-screen lg:min-h-0 flex flex-col justify-center bg-cream px-6 py-12">
        <div className="w-full max-w-sm mx-auto animate-fadeUp">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-extrabold tracking-tightest text-navy">SakhiSign</span>
          </div>
          <h1 className="t-h1 text-navy">{title}</h1>
          <p className="t-body mt-1.5 mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

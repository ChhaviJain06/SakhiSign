import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { HandIcon } from "../components/icons.jsx";
import Logo from "../components/Logo.jsx";

export default function LoginPage() {
  const { login, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from || "/learn";

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
      navigate(dest, { replace: true });
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
      navigate(dest, { replace: true });
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

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen hero-panel navy-pattern flex flex-col rounded-none">
      <div className="flex-1 flex flex-col justify-center px-6 py-10 text-white max-w-app mx-auto w-full">
        <div className="flex items-center gap-2.5 mb-10">
          <Logo className="w-10 h-10" />
          <span className="text-xl font-extrabold tracking-tightest">SakhiSign</span>
        </div>
        <HandIcon className="w-12 h-12 text-accent mb-5 animate-float" />
        <h1 className="t-display mb-2">{title}</h1>
        <p className="text-white/65 mb-7 text-[15px] leading-relaxed">{subtitle}</p>
        <div className="card p-5 text-navy animate-fadeUp">{children}</div>
        <p className="text-center text-[12px] text-white/40 mt-8">
          Learn life-saving signs · Women's safety · Healthcare
        </p>
      </div>
    </div>
  );
}

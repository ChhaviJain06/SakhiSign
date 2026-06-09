import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AuthLayout } from "./LoginPage.jsx";

export default function SignupPage() {
  const { signup, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signup(form.name, form.email, form.password);
      navigate("/learn", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Track your progress and master every sign.">
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Name" value={form.name} onChange={set("name")} />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input className="input" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set("password")} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? "Creating…" : "Create Account"}
        </button>
      </form>

      <button className="btn-ghost w-full mt-3" onClick={() => continueAsGuest().then(() => navigate("/learn"))} disabled={busy}>
        Continue as Guest
      </button>

      <p className="text-center text-sm text-navy/60 mt-5">
        Already have an account?{" "}
        <Link to="/login" className="text-accent-dark font-semibold">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

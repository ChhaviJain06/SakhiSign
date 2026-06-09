import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("sakhi_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(false);

  // Revalidate the stored token on load.
  useEffect(() => {
    const token = localStorage.getItem("sakhi_token");
    if (!token) return setReady(true);
    api
      .get("/auth/me")
      .then((r) => persist(token, r.data.user))
      .catch(() => clear())
      .finally(() => setReady(true));
  }, []);

  function persist(token, user) {
    localStorage.setItem("sakhi_token", token);
    localStorage.setItem("sakhi_user", JSON.stringify(user));
    setUser(user);
  }
  function clear() {
    localStorage.removeItem("sakhi_token");
    localStorage.removeItem("sakhi_user");
    setUser(null);
  }

  async function login(email, password) {
    const r = await api.post("/auth/login", { email, password });
    persist(r.data.token, r.data.user);
  }
  async function signup(name, email, password) {
    const r = await api.post("/auth/signup", { name, email, password });
    persist(r.data.token, r.data.user);
  }
  async function continueAsGuest() {
    const r = await api.post("/auth/guest");
    persist(r.data.token, r.data.user);
  }
  function logout() {
    clear();
  }

  return (
    <AuthContext.Provider
      value={{ user, ready, login, signup, continueAsGuest, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

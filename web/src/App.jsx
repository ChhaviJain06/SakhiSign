import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import SignDetailPage from "./pages/SignDetailPage.jsx";
import PracticePage from "./pages/PracticePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public auth pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* App (requires a session - real or guest) */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Home now also lists all signs (Learn merged in) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/learn" element={<Navigate to="/" replace />} />
        <Route path="/learn/:slug" element={<SignDetailPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/:slug" element={<PracticePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>

      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

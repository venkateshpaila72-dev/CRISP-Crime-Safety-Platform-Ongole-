import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import LoginPage from "./pages/LoginPage";
import ReportsPage from "./pages/ReportsPage";
import ContentPage from "./pages/ContentPage";
import ScraperPage from "./pages/ScraperPage";

// Placeholder for pages not yet rebuilt in this pass (Dashboard = Phase 3,
// Incidents = Phase 4). Swap these for the real pages once those phases
// are confirmed to actually exist in the project — don't wire them blind.
function ComingSoon({ label }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <p className="text-sm text-zinc-500">{label} page — coming in a later phase.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ComingSoon label="Dashboard" />} />
            <Route path="incidents" element={<ComingSoon label="Incidents" />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="scraper" element={<ScraperPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
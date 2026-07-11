import { useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

// Simple prefix match keeps this working for nested routes later
// (e.g. /incidents/excluded still shows "Incidents") without every page
// having to report its own title back up.
const PAGE_TITLES = [
  { prefix: "/incidents", label: "Incidents" },
  { prefix: "/reports", label: "Reports" },
  { prefix: "/content", label: "Content" },
  { prefix: "/scraper", label: "Scraper" },
];

function getPageTitle(pathname) {
  const match = PAGE_TITLES.find((entry) => pathname.startsWith(entry.prefix));
  return match ? match.label : "Dashboard";
}

function Topbar() {
  const location = useLocation();
  const { adminEmail, logout } = useAuth();
  const title = getPageTitle(location.pathname);

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-zinc-200 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-zinc-800">{title}</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">{adminEmail}</span>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

export default Topbar;
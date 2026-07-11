import { NavLink } from "react-router-dom";

// Route/label/icon for each admin section. Each path corresponds to a
// page that later phases populate — Phase 2 only wires the shell.
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/incidents", label: "Incidents", icon: "🗂️" },
  { to: "/reports", label: "Reports", icon: "🚩" },
  { to: "/content", label: "Content", icon: "🏥" },
  { to: "/scraper", label: "Scraper", icon: "🔄" },
];

function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 bg-zinc-900 text-zinc-300 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-zinc-800">
        <p className="text-white font-bold text-lg leading-tight">Ongole SafeMap</p>
        <p className="text-xs text-zinc-500">Admin Console</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
              }`
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
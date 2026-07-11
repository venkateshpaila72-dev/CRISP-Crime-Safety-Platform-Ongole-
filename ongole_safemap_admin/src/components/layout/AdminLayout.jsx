import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Shell for every authenticated page: fixed sidebar + topbar, scrollable
// content area in between. Individual pages render via <Outlet /> and
// don't need to know about the chrome around them.
function AdminLayout() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-zinc-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import UserSidebar from "./UserSidebar";
import { apiRequest, getProfile, isAdminUser } from "../../services/api";

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleStatus, setRoleStatus] = useState("loading");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      try {
        const data = await getProfile();
        if (!mounted) return;
        setRoleStatus(isAdminUser(data) ? "admin" : "user");
      } catch {
        if (!mounted) return;
        setRoleStatus("user");
      }
    }

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    try {
      await apiRequest("/logout.php");
    } catch {
      // ignore and continue
    }
    setSidebarOpen(false);
    navigate("/login");
  }

  if (roleStatus === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        Loading dashboard...
      </div>
    );
  }

  if (roleStatus === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {sidebarOpen ? (
        <button
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] border-r border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 transform transition-transform md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-lg font-semibold">
            Meet My Crew
          </Link>
          <button
            className="rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <UserSidebar onLogout={logout} />
      </aside>

      <div className="min-h-screen md:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-6 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button
              className="rounded-lg border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200 md:hidden"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Toggle sidebar"
            >
              <Menu size={18} />
            </button>

            <div className="hidden md:block" />

            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              {theme === "dark" ? "Dark" : "Light"}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

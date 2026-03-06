import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Folder,
  Compass,
  MessageSquare,
  FolderPlus,
  User,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { apiRequest } from "../../services/api";

const navSections = [
  {
    title: "Projects",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/my-projects", label: "My Projects", icon: Folder },
      { to: "/start-project", label: "Start Project", icon: FolderPlus },
    ],
  },
  {
    title: "Network",
    items: [
      { to: "/discover", label: "Discover Creatives", icon: Compass },
      { to: "/messages", label: "Messages", icon: MessageSquare },
    ],
  },
  {
    title: "Account",
    items: [{ to: "/profile", label: "Profile", icon: User }],
  },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  async function logout() {
    try {
      await apiRequest("/logout.php");
    } catch {
      // ignore and continue
    }
    setSidebarOpen(false);
    navigate("/login");
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
            className="md:hidden rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="mt-6 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {section.title}
              </p>
              <div className="flex flex-col gap-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-lg px-4 py-2 font-medium ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        }`
                      }
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}

                {section.title === "Account" ? (
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="md:pl-[260px] min-h-screen">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-6 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button
              className="md:hidden rounded-lg border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
              onClick={() => setSidebarOpen((s) => !s)}
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

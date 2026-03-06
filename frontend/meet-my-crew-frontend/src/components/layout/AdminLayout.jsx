import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FolderKanban, Briefcase, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/portfolio", label: "Portfolio", icon: Briefcase },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Platform management and monitoring tools.</p>
          </div>

          <Button variant="neutral" className="rounded-md px-3 py-2 text-sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} />
            Back to App
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 h-fit">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
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
            </nav>
          </aside>

          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}


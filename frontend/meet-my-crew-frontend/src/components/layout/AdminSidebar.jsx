import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FolderKanban, Briefcase, LogOut } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/portfolio", label: "Portfolios", icon: Briefcase },
];

export default function AdminSidebar({ onLogout }) {
  return (
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

      <button
        onClick={onLogout}
        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </nav>
  );
}

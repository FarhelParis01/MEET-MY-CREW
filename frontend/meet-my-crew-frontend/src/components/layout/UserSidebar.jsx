import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  Compass,
  MessageSquare,
  FolderPlus,
  User,
  LogOut,
} from "lucide-react";

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

export default function UserSidebar({ onLogout }) {
  return (
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

            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      ))}
    </nav>
  );
}

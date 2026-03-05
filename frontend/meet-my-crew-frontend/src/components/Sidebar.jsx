import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  Compass,
  Users,
  MessageSquare,
  Handshake,
  User,
  FolderPlus,
  LogOut,
  X,
} from "lucide-react";
import { apiRequest } from "../services/api";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-projects", label: "My Projects", icon: Folder },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/creatives", label: "Find Creatives", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/requests", label: "Collaboration Requests", icon: Handshake },
  { to: "/start-project", label: "Start Project", icon: FolderPlus },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar({ isOpen = false, onClose }) {
  const navigate = useNavigate();

  async function logout() {
    try {
      await apiRequest("/logout.php");
    } catch {
      // ignore logout errors and still route to login
    }
    if (onClose) onClose();
    navigate("/login");
  }

  return (
    <aside className={`mmc-sidebar ${isOpen ? "open" : ""}`}>
      <div className="mmc-sidebar-head">
        <div className="mmc-brand">Meet My Crew</div>
        <button className="mmc-sidebar-close" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="mmc-nav">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                "mmc-link" + (isActive ? " active" : "")
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button className="mmc-logout" onClick={logout}>
        <LogOut size={18} />
        <span>Log Out</span>
      </button>
    </aside>
  );
}

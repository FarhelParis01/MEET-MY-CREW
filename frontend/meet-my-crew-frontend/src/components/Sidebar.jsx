import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  Users,
  MessageSquare,
  Handshake,
  User,
  LogOut,
} from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/creatives", label: "Find Creatives", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/requests", label: "Collaboration Requests", icon: Handshake },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    // simple logout (adjust when you add backend sessions)
    localStorage.removeItem("mmc_user");
    navigate("/login");
  }

  return (
    <aside className="mmc-sidebar">
      <div className="mmc-brand">Meet My Crew</div>

      <nav className="mmc-nav">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
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
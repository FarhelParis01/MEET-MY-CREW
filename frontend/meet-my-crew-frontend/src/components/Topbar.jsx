import { ChevronDown, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();

  const user =
    JSON.parse(localStorage.getItem("mmc_user") || "null") || {
      full_name: "User",
      role: "Creative",
      region: "",
      city: "",
    };

  return (
    <header className="mmc-topbar">
      <div />

      <div className="mmc-topbar-right">
        <button className="mmc-themeBtn" onClick={toggleTheme}>
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === "dark" ? "Dark" : "Light"}</span>
        </button>

        <div className="mmc-userMini">
          <div className="mmc-avatar" />
          <div className="mmc-userMiniText">
            <div className="name">{user.full_name}</div>
            <div className="role">{user.role}</div>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}
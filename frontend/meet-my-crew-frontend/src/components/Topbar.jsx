import { ChevronDown, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { getProfile } from "../services/api";

const DEFAULT_USER = {
  full_name: "User",
  role: "Creative",
  region: "",
  city: "",
};

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(DEFAULT_USER);

  useEffect(() => {
    getProfile()
      .then((res) => {
        setUser(res.user ? { ...DEFAULT_USER, ...res.user } : DEFAULT_USER);
      })
      .catch(() => {
        setUser(DEFAULT_USER);
      });
  }, []);

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

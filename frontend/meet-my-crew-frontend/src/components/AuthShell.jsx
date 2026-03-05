import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AuthShell({ title, subtitle, leftTitle, leftText, bullets, children, bgImage = "/src/assets/bg.jpg" }) {
  const loc = useLocation();
  const isLogin = loc.pathname.includes("login");
  const { theme, toggleTheme } = useTheme();

  const onToggle = () => {
    toggleTheme();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07101d]">
      {/* Top nav */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-[#07101d]/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-wide text-slate-900 dark:text-white">
            Meet My Crew
          </div>

          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              to="/login"
              className={`px-3 py-2 rounded-md text-sm ${
                isLogin
                  ? "text-white bg-[#1b4bff] hover:bg-[#143be0]"
                  : "text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5"
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`px-3 py-2 rounded-md text-sm ${
                !isLogin
                  ? "text-white bg-[#1b4bff] hover:bg-[#143be0]"
                  : "text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5"
              }`}
            >
              Register
            </Link>

            {/* Theme toggle */}
            <button
              onClick={onToggle}
              className="ml-2 inline-flex items-center justify-center w-10 h-10 rounded-full
                         border border-slate-200 hover:bg-slate-100
                         dark:border-white/10 dark:hover:bg-white/5"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-white/80" />
              ) : (
                <Sun className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="px-5 py-10">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT PANEL */}
            <div className="relative p-10 md:p-12 text-white">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/75" />
              <div className="relative">
                <h1 className="text-4xl font-semibold tracking-wide mb-4">{leftTitle}</h1>
                <p className="text-white/85 mb-8 max-w-md">{leftText}</p>

                <div className="space-y-4 text-white/90">
                  {bullets?.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      {b.icon}
                      <p>{b.text}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-10 text-sm text-white/70">
                  © 2026 Meet My Crew | HND Software Project.
                </p>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="p-10 md:p-12 bg-slate-50 dark:bg-white/5">
              <div className="max-w-md">
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white mb-2">
                  {title}
                </h2>
                <p className="text-slate-600 dark:text-white/70 mb-8">{subtitle}</p>
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

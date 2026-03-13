import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AuthShell({
  title,
  subtitle,
  leftTitle,
  leftText,
  bullets,
  children,
  bgImage = "/src/assets/bg.jpg",
  layout = "split",
}) {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isAbout = pathname === "/" || pathname === "/about";
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";
  const isSplitLayout = layout === "split";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07101d]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-[#07101d]/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="text-lg font-semibold tracking-wide text-slate-900 dark:text-slate-100">
            Meet My Crew
          </div>

          <nav className="flex items-center gap-2">
            <Link
              to="/about"
              className={`rounded-md px-3 py-2 text-sm ${
                isAbout
                  ? "bg-[#1b4bff] text-white hover:bg-[#143be0]"
                  : "text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5"
              }`}
            >
              About Us
            </Link>
            <Link
              to="/login"
              className={`rounded-md px-3 py-2 text-sm ${
                isLogin
                  ? "bg-[#1b4bff] text-white hover:bg-[#143be0]"
                  : "text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5"
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className={`rounded-md px-3 py-2 text-sm ${
                isRegister
                  ? "bg-[#1b4bff] text-white hover:bg-[#143be0]"
                  : "text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/5"
              }`}
            >
              Register
            </Link>

            <button
              onClick={toggleTheme}
              className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-white/80" />
              ) : (
                <Sun className="h-5 w-5 text-slate-700" />
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="px-5 py-10">
        <div className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-white/5 md:max-w-6xl">
          {isSplitLayout ? (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative p-10 text-white md:p-12">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/75" />
                <div className="relative">
                  <h1 className="mb-4 text-4xl font-semibold tracking-wide">{leftTitle}</h1>
                  <p className="mb-8 max-w-md text-white/85">{leftText}</p>

                  <div className="space-y-4 text-white/90">
                    {bullets?.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {bullet.icon}
                        <p>{bullet.text}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-10 text-sm text-white/70">
                    © 2026 Meet My Crew | HND Software Project.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-10 dark:bg-white/5 md:p-12">
                <div className="max-w-md">
                  <h2 className="mb-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                    {title}
                  </h2>
                  <p className="mb-8 text-slate-600 dark:text-white/70">{subtitle}</p>
                  {children}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-10 dark:bg-white/5 md:p-12">
              <div className="mx-auto max-w-4xl">
                <h1 className="mb-2 text-3xl font-semibold text-slate-900 dark:text-slate-100 md:text-4xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mb-8 text-slate-600 dark:text-white/70">{subtitle}</p>
                ) : null}
                {children}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Compass,
  Users,
  MessageSquare,
  Handshake,
  User,
  LogOut,
  Moon,
  Sun,
  Search,
  ChevronDown,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", active: true },
  { label: "Discover", icon: Compass, to: "/discover" },
  { label: "Find Creatives", icon: Users, to: "/creatives" },
  { label: "Messages", icon: MessageSquare, to: "/messages" },
  { label: "Collaboration Requests", icon: Handshake, to: "/requests" },
  { label: "Profile", icon: User, to: "/profile" },
];

const messages = [
  { name: "Sarah Williams", time: "20m", text: "Sent you a request to collaborate..." },
  { name: "Michal Chen", time: "20m", text: "Declaning a video, so just..." },
  { name: "Emily Davis", time: "1h", text: "Team a very producing film..." },
];

const requests = [
  { title: "Film Project Collaboration", by: "Sarah Williams & Cinematographer." },
  { title: "Upcoming Short Film", by: "Michael Chen, Sing Actor." },
  { title: "Music Video Production", by: "Emily Davis Collaborator." },
];

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070B16] dark:text-white">
      {/* subtle background glow */}
      <div className="pointer-events-none fixed inset-0 opacity-70 dark:opacity-100">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-[#1a2b6b]/25 blur-3xl" />
        <div className="absolute top-40 -right-20 h-[520px] w-[520px] rounded-full bg-[#00b3c7]/12 blur-3xl" />
      </div>

      <div className="relative flex">
        {/* SIDEBAR */}
        <aside className="w-[280px] min-h-screen border-r border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl">
          <div className="px-6 py-6">
            <h1 className="text-xl font-semibold tracking-wide text-slate-900 dark:text-white">
              Meet My Crew
            </h1>
          </div>

          <nav className="px-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={[
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px]",
                    "text-slate-700 hover:bg-white/60 hover:text-slate-900",
                    "dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white",
                    item.active ? "bg-white/70 dark:bg-white/10 text-slate-900 dark:text-white" : "",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 opacity-80" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-3 py-6">
            <button
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-[15px]
              text-slate-700 hover:bg-white/60 hover:text-slate-900
              dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <LogOut className="h-5 w-5 opacity-80" />
              Log Out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1">
          {/* TOP BAR */}
          <header className="h-[76px] border-b border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-xl">
            <div className="h-full px-8 flex items-center justify-between">
              <h2 className="text-3xl font-light tracking-wide text-slate-900 dark:text-white/90">
                Dashboard
              </h2>

              <div className="flex items-center gap-3">
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10
                  bg-white/60 px-4 py-2 text-sm text-slate-800 hover:bg-white
                  dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4 text-[#00b3c7]" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-[#1f66ff]" />
                      Dark
                    </>
                  )}
                </button>

                {/* User menu */}
                <div
                  className="flex items-center gap-3 rounded-2xl border border-white/10
                  bg-white/50 px-4 py-2 dark:bg-white/10"
                >
                  <img
                    src="https://i.pravatar.cc/80?img=13"
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Alex Johnson
                    </div>
                    <div className="text-xs text-slate-600 dark:text-white/60">Director</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500 dark:text-white/60" />
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="px-8 py-8 grid grid-cols-12 gap-6">
            {/* LEFT BIG PANEL */}
            <section className="col-span-12 lg:col-span-8">
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white/90">
                  Welcome back, Alex!
                </h3>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Quick search */}
                  <div className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 p-5">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white/85">
                      Quick Search
                    </h4>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="text-sm text-slate-700 dark:text-white/70">Location</label>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/10 px-3 py-2">
                          <MapPin className="h-4 w-4 text-[#00b3c7]" />
                          <input
                            className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40"
                            placeholder="Enter city or region"
                          />
                          <ChevronDown className="h-4 w-4 text-slate-500 dark:text-white/60" />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm text-slate-700 dark:text-white/70">Role</label>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/10 px-3 py-2">
                          <BadgeCheck className="h-4 w-4 text-[#1f66ff]" />
                          <input
                            className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/40"
                            placeholder="Select role"
                          />
                          <ChevronDown className="h-4 w-4 text-slate-500 dark:text-white/60" />
                        </div>
                      </div>

                      <button
                        className="w-full rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white py-3 font-semibold
                        shadow-lg shadow-[#1f66ff]/20 flex items-center justify-center gap-2"
                      >
                        <Search className="h-4 w-4" />
                        Search
                      </button>

                      <p className="text-sm text-slate-600 dark:text-white/60">
                        Or browse all creatives <span className="text-[#00b3c7]">›</span>
                      </p>
                    </div>
                  </div>

                  {/* Recent messages */}
                  <div className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 p-5">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white/85">
                      Recent Messages
                    </h4>

                    <div className="mt-4 space-y-4">
                      {messages.map((m) => (
                        <div
                          key={m.name}
                          className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/60 dark:bg-white/10 p-3"
                        >
                          <img
                            src={`https://i.pravatar.cc/50?u=${encodeURIComponent(m.name)}`}
                            className="h-10 w-10 rounded-full"
                            alt=""
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                              <div className="text-xs text-slate-500 dark:text-white/50">{m.time}</div>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-white/60">{m.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Collaboration requests list */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white/85">
                      Collaboration Requests
                    </h4>
                    <button className="text-sm text-[#00b3c7] hover:underline">See All</button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {requests.map((r) => (
                      <div
                        key={r.title}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/60 dark:bg-white/10 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://i.pravatar.cc/44?u=${encodeURIComponent(r.title)}`}
                            className="h-10 w-10 rounded-full"
                            alt=""
                          />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{r.title}</div>
                            <div className="text-sm text-slate-600 dark:text-white/60">{r.by}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-4 py-2 text-sm font-semibold">
                            Accept
                          </button>
                          <button className="rounded-xl bg-white/50 hover:bg-white text-slate-800 px-4 py-2 text-sm font-semibold
                          dark:bg-white/10 dark:hover:bg-white/15 dark:text-white">
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* RIGHT PROFILE CARD */}
            <aside className="col-span-12 lg:col-span-4">
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl overflow-hidden">
                <div className="p-6">
                  <img
                    src="https://i.pravatar.cc/300?img=12"
                    alt=""
                    className="w-full h-48 object-cover rounded-2xl"
                  />

                  <div className="mt-5">
                    <div className="text-2xl font-semibold text-slate-900 dark:text-white">Alex Johnson</div>
                    <div className="text-sm text-slate-600 dark:text-white/60">Director</div>

                    <div className="mt-4 h-px bg-white/10" />

                    <div className="mt-4 flex items-center gap-2 text-slate-700 dark:text-white/70">
                      <MapPin className="h-4 w-4 text-[#00b3c7]" />
                      Accra, Ghana
                    </div>

                    <div className="mt-5">
                      <div className="text-sm text-slate-700 dark:text-white/70 mb-2">Skills:</div>
                      <div className="flex flex-wrap gap-2">
                        {["Video Directing", "Scriptwriting", "Editing"].map((s) => (
                          <span
                            key={s}
                            className="rounded-lg border border-white/10 bg-white/60 dark:bg-white/10 px-3 py-1 text-sm text-slate-800 dark:text-white/80"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <button className="w-full rounded-xl bg-white/60 hover:bg-white text-slate-900 py-3 font-semibold
                      dark:bg-white/10 dark:hover:bg-white/15 dark:text-white">
                        View Portfolio
                      </button>
                      <button className="w-full rounded-xl bg-[#00b3c7] hover:bg-[#0097aa] text-white py-3 font-semibold shadow-lg shadow-[#00b3c7]/15">
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
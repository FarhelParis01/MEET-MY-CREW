import { MapPin, BadgeCheck, ChevronDown, Search } from "lucide-react";

const messages = [
  { name: "Sarah Williams", time: "20m", text: "Sent you a request to collaborate..." },
  { name: "Michal Chen", time: "20m", text: "Declining a video, so just..." },
  { name: "Emily Davis", time: "1h", text: "Team a very producing film..." },
];

const requests = [
  { title: "Film Project Collaboration", by: "Sarah Williams & Cinematographer." },
  { title: "Upcoming Short Film", by: "Michael Chen, Actor." },
  { title: "Music Video Production", by: "Emily Davis Collaborator." },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">

      {/* LEFT CONTENT */}
      <section className="col-span-12 lg:col-span-8">

        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/1 backdrop-blur-xl p-6">

          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white/90">
            Welcome back!
          </h3>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* QUICK SEARCH */}
            <div className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 p-5">

              <h4 className="text-lg font-semibold text-slate-900 dark:text-white/85">
                Quick Search
              </h4>

              <div className="mt-4 space-y-4">

                <div>
                  <label className="text-sm text-slate-700 dark:text-white/70">
                    Location
                  </label>

                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/10 px-3 py-2">
                    <MapPin className="h-4 w-4 text-[#00b3c7]" />
                    <input
                      className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
                      placeholder="Enter city or region"
                    />
                    <ChevronDown className="h-4 w-4 text-slate-500 dark:text-white/60" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-700 dark:text-white/70">
                    Role
                  </label>

                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/60 dark:bg-white/10 px-3 py-2">
                    <BadgeCheck className="h-4 w-4 text-[#1f66ff]" />
                    <input
                      className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
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

              </div>
            </div>


            {/* RECENT MESSAGES */}
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
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {m.name}
                        </div>

                        <div className="text-xs text-slate-500 dark:text-white/50">
                          {m.time}
                        </div>
                      </div>

                      <div className="text-sm text-slate-600 dark:text-white/60">
                        {m.text}
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>


          {/* COLLABORATION REQUESTS */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 p-5">

            <div className="flex items-center justify-between">

              <h4 className="text-lg font-semibold text-slate-900 dark:text-white/85">
                Collaboration Requests
              </h4>

              <button className="text-sm text-[#00b3c7] hover:underline">
                See All
              </button>

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
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {r.title}
                      </div>

                      <div className="text-sm text-slate-600 dark:text-white/60">
                        {r.by}
                      </div>
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

              <div className="text-2xl font-semibold text-slate-900 dark:text-white">
                Alex Johnson
              </div>

              <div className="text-sm text-slate-600 dark:text-white/60">
                Director
              </div>

              <div className="mt-4 h-px bg-white/10" />

              <div className="mt-4 flex items-center gap-2 text-slate-700 dark:text-white/70">
                <MapPin className="h-4 w-4 text-[#00b3c7]" />
                Yaounde, Centre
              </div>

              <div className="mt-5">

                <div className="text-sm text-slate-700 dark:text-white/70 mb-2">
                  Skills:
                </div>

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
  );
}
import {
  MapPin,
  Mail,
  Globe,
  MessageSquare,
  Star,
  Camera,
  Linkedin,
  Twitter,
  Instagram,
  Play,
} from "lucide-react";

export default function Profile() {

  const user =
    JSON.parse(localStorage.getItem("mmc_user") || "null") || {
      full_name: "Alex Johnson",
      role: "Director",
      city: "Yaounde",
      region: "Centre",
      email: "alex@email.com",
    };

  const skills = ["Video Directing", "Scriptwriting", "Editing", "Producing"];

  const portfolio = [
    { title: "Short Film - The Last Scene" },
    { title: "Commercial - Urban Sneakers" },
    { title: 'Music Video - "Neon Lights"' },
    { title: "Narrative Film Project" },
  ];

  const reviews = [
    {
      name: "Sarah Williams",
      role: "Cinematographer",
      text:
        "Working with Alex was a fantastic experience. His eye for detail and creative direction elevated our project.",
      stars: 5,
    },
    {
      name: "Emily Davis",
      role: "Collaborator",
      text:
        "Alex is a talented director who knows how to get the best out of the team. Highly recommended.",
      stars: 5,
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">

      {/* MAIN PROFILE CARD */}
      <div className="col-span-12 lg:col-span-8">

        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white backdrop-blur-sm p-6">

          {/* HEADER SECTION */}
          <div className="flex gap-6 items-start">

            {/* PROFILE PHOTO */}
            <div className="relative">

              <img
                src="https://i.pravatar.cc/300?img=12"
                alt=""
                className="w-56 h-56 object-cover rounded-2xl"
              />

              <button className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                <Camera size={16} />
                Change Photo
              </button>

            </div>


            {/* USER INFO */}
            <div className="flex-1">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-3xl font-semibold">
                    {user.full_name}
                  </h2>

                  <div className="flex items-center gap-2 mt-2 text-slate-600 dark:text-white/70">
                    {user.role}
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-slate-600 dark:text-white/70">
                    <MapPin size={16} />
                    {user.city}, {user.region}
                  </div>
                </div>

                <button className="bg-[#1f66ff] hover:bg-[#1b59db] text-white px-4 py-2 rounded-xl flex items-center gap-2">
                  <MessageSquare size={16} />
                  Message
                </button>

              </div>


              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 mt-6">

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-semibold">254</div>
                  <div className="text-sm text-white/60">
                    Total Connections
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-semibold">12</div>
                  <div className="text-sm text-white/60">
                    Projects Completed
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-semibold">8</div>
                  <div className="text-sm text-white/60">
                    Years Experience
                  </div>
                </div>

              </div>

            </div>

          </div>


          {/* ABOUT */}
          <div className="mt-8">

            <h3 className="text-lg font-semibold">
              About Me
            </h3>

            <p className="text-white/70 mt-2">
              Hi, I'm {user.full_name}. I specialize in directing and collaborating
              with creative professionals. I’m open to projects and building
              strong creative teams.
            </p>

          </div>


          {/* SKILLS */}
          <div className="mt-6">

            <h3 className="text-lg font-semibold">
              Skills
            </h3>

            <div className="flex flex-wrap gap-2 mt-3">

              {skills.map((s) => (
                <span
                  key={s}
                  className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-sm"
                >
                  {s}
                </span>
              ))}

            </div>

          </div>


          {/* PORTFOLIO */}
          <div className="mt-8">

            <h3 className="text-lg font-semibold">
              Portfolio
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-4">

              {portfolio.map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl border border-white/10 bg-white/10 overflow-hidden"
                >

                  <div className="h-32 bg-black/40 flex items-center justify-center">
                    <Play size={22} />
                  </div>

                  <div className="p-3 text-sm">
                    {p.title}
                  </div>

                </div>
              ))}

            </div>

            <button className="mt-4 w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl">
              View All Projects
            </button>

          </div>


          {/* REVIEWS */}
          <div className="mt-10">

            <h3 className="text-lg font-semibold">
              Recent Reviews
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-4">

              {reviews.map((r) => (
                <div
                  key={r.name}
                  className="rounded-xl border border-white/10 bg-white/10 p-4"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20"></div>

                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-white/60">
                          {r.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {Array.from({ length: r.stars }).map((_, i) => (
                        <Star key={i} size={14} className="text-yellow-400" />
                      ))}
                    </div>

                  </div>

                  <p className="text-sm text-white/70 mt-3">
                    {r.text}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>


      {/* CONTACT CARD */}
      <aside className="col-span-12 lg:col-span-4">

        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6">

          <h3 className="text-lg font-semibold mb-4">
            Contact
          </h3>

          <div className="space-y-3 text-white/70">

            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {user.city}, {user.region}
            </div>

            <div className="flex items-center gap-2">
              <Mail size={16} />
              {user.email}
            </div>

            <div className="flex items-center gap-2">
              <Globe size={16} />
              www.meetmycrew.cm
            </div>

          </div>

          <div className="mt-6 border-t border-white/10 pt-4">

            <h4 className="text-sm font-semibold mb-3">
              Social Media
            </h4>

            <div className="flex gap-3">

              <button className="bg-white/10 p-2 rounded-lg">
                <Instagram size={16} />
              </button>

              <button className="bg-white/10 p-2 rounded-lg">
                <Twitter size={16} />
              </button>

              <button className="bg-white/10 p-2 rounded-lg">
                <Linkedin size={16} />
              </button>

            </div>

          </div>

          <div className="mt-6 border-t border-white/10 pt-4">

            <h4 className="text-sm font-semibold mb-2">
              Availability
            </h4>

            <div className="bg-white/10 px-4 py-3 rounded-xl">
              Open to new projects
            </div>

          </div>

        </div>

      </aside>

    </div>
  );
}
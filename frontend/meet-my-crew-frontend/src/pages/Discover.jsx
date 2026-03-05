import { useMemo, useState } from "react";
import { MapPin, Search, UserRound } from "lucide-react";

const creatives = [
  {
    id: 1,
    full_name: "Sarah Williams",
    role: "Cinematographer",
    city: "Yaounde",
    region: "Centre",
    skills: ["Lighting", "Camera Operation", "Color Grading"],
    profile_image: "https://i.pravatar.cc/200?img=31",
  },
  {
    id: 2,
    full_name: "Michael Chen",
    role: "Actor",
    city: "Douala",
    region: "Littoral",
    skills: ["Improvisation", "Voice Control", "Script Analysis"],
    profile_image: "https://i.pravatar.cc/200?img=12",
  },
  {
    id: 3,
    full_name: "Emily Davis",
    role: "Editor",
    city: "Buea",
    region: "South West",
    skills: ["Premiere Pro", "Story Pacing", "Sound Sync"],
    profile_image: "https://i.pravatar.cc/200?img=25",
  },
  {
    id: 4,
    full_name: "Alex Johnson",
    role: "Director",
    city: "Bamenda",
    region: "North West",
    skills: ["Storyboarding", "Scriptwriting", "Team Leadership"],
    profile_image: "https://i.pravatar.cc/200?img=54",
  },
  {
    id: 5,
    full_name: "Amina Nfor",
    role: "Producer",
    city: "Bafoussam",
    region: "West",
    skills: ["Scheduling", "Budget Planning", "Negotiation"],
    profile_image: "https://i.pravatar.cc/200?img=47",
  },
  {
    id: 6,
    full_name: "Jordan Ekani",
    role: "Sound Designer",
    city: "Douala",
    region: "Littoral",
    skills: ["Foley", "Audio Mixing", "Dialogue Cleanup"],
    profile_image: "https://i.pravatar.cc/200?img=61",
  },
];

export default function Discover() {
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return creatives;

    return creatives.filter((user) => {
      const roleMatch = user.role.toLowerCase().includes(term);
      const skillMatch = user.skills.some((skill) =>
        skill.toLowerCase().includes(term)
      );
      return roleMatch || skillMatch;
    });
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-5 md:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white/90">
              Discover Creatives
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/65">
              Search by role or skill to find the right collaborators.
            </p>
          </div>

          <div className="w-full sm:w-[360px]">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-3 py-2">
              <Search className="h-4 w-4 text-[#1f66ff]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
                placeholder="Search role or skill..."
              />
            </div>
          </div>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 text-center text-slate-600 dark:text-white/70">
          No creatives found for this search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.profile_image}
                  alt={user.full_name}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {user.full_name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-white/65">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-white/70">
                <MapPin className="h-4 w-4 text-[#00b3c7]" />
                <span>
                  {user.city}, {user.region}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={`${user.id}-${skill}`}
                    className="rounded-lg border border-white/10 bg-white/65 dark:bg-white/10 px-2.5 py-1 text-xs text-slate-800 dark:text-white/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button className="flex-1 rounded-xl bg-white/70 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white py-2.5 text-sm font-semibold border border-white/10 inline-flex items-center justify-center gap-2">
                  <UserRound size={15} />
                  View Profile
                </button>
                <button className="flex-1 rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white py-2.5 text-sm font-semibold shadow-lg shadow-[#1f66ff]/20">
                  Send Request
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}


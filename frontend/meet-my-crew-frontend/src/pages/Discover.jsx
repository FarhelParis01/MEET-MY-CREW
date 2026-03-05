import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, UserRound } from "lucide-react";
import { fetchCreatives, sendCollaborationRequest } from "../services/api";

export default function Discover() {
  const [query, setQuery] = useState("");
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetchCreatives()
      .then((res) => {
        const users = Array.isArray(res.users) ? res.users : [];
        setCreatives(users);
      })
      .catch((err) => {
        setError(err.message || "Failed to load creatives");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return creatives;

    return creatives.filter((user) => {
      const roleMatch = user.role.toLowerCase().includes(term);
      const skills = Array.isArray(user.skills)
        ? user.skills
        : String(user.skills || "")
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
      const skillMatch = skills.some((skill) => skill.toLowerCase().includes(term));
      return roleMatch || skillMatch;
    });
  }, [query, creatives]);

  async function sendRequest(targetUser) {
    try {
      await sendCollaborationRequest({
        receiver_id: targetUser.user_id,
        message: `Hi ${targetUser.full_name}, I would like to collaborate with you.`,
      });
      setNotice(`Request sent to ${targetUser.full_name}.`);
    } catch (err) {
      setError(err.message || "Failed to send request");
    }
  }

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

      {notice && (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-100/60 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          {notice}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 text-center text-slate-600 dark:text-white/70">
          Loading creatives...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 text-center text-slate-600 dark:text-white/70">
          No creatives found for this search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredUsers.map((user) => (
            <article
              key={user.user_id}
              className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.photo ||
                    `https://i.pravatar.cc/200?u=${encodeURIComponent(user.full_name)}`
                  }
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
                {(Array.isArray(user.skills)
                  ? user.skills
                  : String(user.skills || "")
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean)
                ).map((skill) => (
                  <span
                    key={`${user.user_id}-${skill}`}
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
                <button
                  onClick={() => sendRequest(user)}
                  className="flex-1 rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white py-2.5 text-sm font-semibold shadow-lg shadow-[#1f66ff]/20"
                >
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

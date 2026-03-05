import { useEffect, useMemo, useState } from "react";
import { MapPin, BadgeCheck, ChevronDown, Search } from "lucide-react";
import { getProfile, respondCollaborationRequest } from "../services/api";

const DEFAULT_USER = {
  full_name: "User",
  role: "Creative",
  city: "",
  region: "",
  skills: "",
  photo: "",
};

function parseSkills(skills) {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    return skills.split(",").map((skill) => skill.trim()).filter(Boolean);
  }
  return [];
}

function formatTimeLabel(isoText) {
  if (!isoText) return "";
  const dt = new Date(isoText);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [user, setUser] = useState(DEFAULT_USER);
  const [inbox, setInbox] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    getProfile()
      .then((res) => {
        const merged = {
          ...DEFAULT_USER,
          ...(res.user || {}),
          ...(res.profile || {}),
        };
        setUser(merged);
      })
      .catch(() => {
        setUser(DEFAULT_USER);
      });

    fetch("http://localhost/meet-my-crew/backend/public/my-inbox.php", {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load messages");
        setInbox(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch((err) => {
        setInbox([]);
        setMessagesError(err.message || "Failed to load messages");
      })
      .finally(() => {
        setMessagesLoading(false);
      });

    fetch("http://localhost/meet-my-crew/backend/public/my-requests.php", {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load requests");
        setRequests(Array.isArray(data.requests) ? data.requests : []);
      })
      .catch((err) => {
        setRequests([]);
        setRequestsError(err.message || "Failed to load requests");
      })
      .finally(() => {
        setRequestsLoading(false);
      });
  }, []);

  const skills = useMemo(() => {
    const parsed = parseSkills(user.skills);
    return parsed.length > 0 ? parsed : ["No skills added yet"];
  }, [user.skills]);

  async function respondToRequest(requestId, action) {
    try {
      await respondCollaborationRequest({ request_id: requestId, action });
      setRequests((prev) =>
        prev.map((request) =>
          request.request_id === requestId
            ? { ...request, status: action }
            : request
        )
      );
    } catch {
      // ignore for now
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 lg:col-span-8">
        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/1 backdrop-blur-xl p-6">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white/90">
            Welcome back{user.full_name ? `, ${user.full_name}` : ""}!
          </h3>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
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

                <button className="w-full rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white py-3 font-semibold shadow-lg shadow-[#1f66ff]/20 flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 p-5">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white/85">
                Recent Messages
              </h4>

              <div className="mt-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-sm text-slate-600 dark:text-white/60">Loading messages...</div>
                ) : messagesError ? (
                  <div className="text-sm text-red-600 dark:text-red-300">{messagesError}</div>
                ) : inbox.length === 0 ? (
                  <div className="text-sm text-slate-600 dark:text-white/60">No messages yet.</div>
                ) : (
                  inbox.slice(0, 4).map((m) => (
                    <div
                      key={m.message_id}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/60 dark:bg-white/10 p-3"
                    >
                      <img
                        src={`https://i.pravatar.cc/50?u=${encodeURIComponent(m.sender_name || "user")}`}
                        className="h-10 w-10 rounded-full"
                        alt=""
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {m.sender_name}
                          </div>

                          <div className="text-xs text-slate-500 dark:text-white/50">
                            {formatTimeLabel(m.sent_at)}
                          </div>
                        </div>

                        <div className="text-sm text-slate-600 dark:text-white/60">
                          {m.message_text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white/85">
                Collaboration Requests
              </h4>
            </div>

            <div className="mt-4 space-y-3">
              {requestsLoading ? (
                <div className="text-sm text-slate-600 dark:text-white/60">Loading requests...</div>
              ) : requestsError ? (
                <div className="text-sm text-red-600 dark:text-red-300">{requestsError}</div>
              ) : requests.length === 0 ? (
                <div className="text-sm text-slate-600 dark:text-white/60">No requests yet.</div>
              ) : (
                requests.slice(0, 5).map((r) => (
                  <div
                    key={r.request_id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/60 dark:bg-white/10 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://i.pravatar.cc/44?u=${encodeURIComponent(r.sender_name || "sender")}`}
                        className="h-10 w-10 rounded-full"
                        alt=""
                      />

                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {r.sender_name}
                        </div>

                        <div className="text-sm text-slate-600 dark:text-white/60">
                          {r.message || "Sent a collaboration request"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={r.status !== "pending"}
                        onClick={() => respondToRequest(r.request_id, "accepted")}
                        className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Accept
                      </button>

                      <button
                        disabled={r.status !== "pending"}
                        onClick={() => respondToRequest(r.request_id, "declined")}
                        className="rounded-xl bg-white/50 hover:bg-white text-slate-800 px-4 py-2 text-sm font-semibold dark:bg-white/10 dark:hover:bg-white/15 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <aside className="col-span-12 lg:col-span-4">
        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="p-6">
            <img
              src={
                user.photo ||
                `https://i.pravatar.cc/300?u=${encodeURIComponent(user.full_name || "user")}`
              }
              alt=""
              className="w-full h-48 object-cover rounded-2xl"
            />

            <div className="mt-5">
              <div className="text-2xl font-semibold text-slate-900 dark:text-white">
                {user.full_name}
              </div>

              <div className="text-sm text-slate-600 dark:text-white/60">
                {user.role || "Creative"}
              </div>

              <div className="mt-4 h-px bg-white/10" />

              <div className="mt-4 flex items-center gap-2 text-slate-700 dark:text-white/70">
                <MapPin className="h-4 w-4 text-[#00b3c7]" />
                {user.city || ""}{user.city && user.region ? ", " : ""}{user.region || ""}
              </div>

              <div className="mt-5">
                <div className="text-sm text-slate-700 dark:text-white/70 mb-2">
                  Skills:
                </div>

                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-white/10 bg-white/60 dark:bg-white/10 px-3 py-1 text-sm text-slate-800 dark:text-white/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

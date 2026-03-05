import { useEffect, useState } from "react";
import { MapPin, Search, UserRound, FolderPlus, X } from "lucide-react";
import { searchCreatives, sendRequest } from "../api/apiClient";

const MY_PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/my-projects.php";
const INVITE_USER_URL = "http://localhost/meet-my-crew/backend/public/invite-user.php";

export default function Discover() {
  const [query, setQuery] = useState("");
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [projectsCreated, setProjectsCreated] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    let isMounted = true;

    searchCreatives(query.trim())
      .then((res) => {
        if (!isMounted) return;
        const users = Array.isArray(res.users) ? res.users : [];
        setCreatives(users);
      })
      .catch((err) => {
        if (!isMounted) return;
        setCreatives([]);
        setError(err.message || "Failed to load creatives");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  async function handleConnect(targetUser) {
    try {
      await sendRequest(targetUser.user_id);
      setError("");
      setNotice(`Request sent to ${targetUser.full_name}.`);
    } catch (err) {
      setNotice("");
      setError(err.message || "Failed to send request");
    }
  }

  async function openInviteModal(user) {
    setSelectedCreative(user);
    setIsInviteModalOpen(true);
    setProjectsCreated([]);
    setSelectedProjectId("");
    setInvitationMessage("Hi, I would like to collaborate with you.");
    setInviteError("");
    setProjectsLoading(true);

    try {
      const res = await fetch(MY_PROJECTS_URL, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load your projects");
      }

      const created = Array.isArray(data.projects_created)
        ? data.projects_created
        : [];

      setProjectsCreated(created);
      if (created.length > 0) {
        setSelectedProjectId(String(created[0].id));
      }
    } catch (err) {
      setProjectsCreated([]);
      setInviteError(err.message || "Failed to load your projects");
    } finally {
      setProjectsLoading(false);
    }
  }

  function closeInviteModal() {
    setIsInviteModalOpen(false);
    setSelectedCreative(null);
    setProjectsCreated([]);
    setSelectedProjectId("");
    setInvitationMessage("");
    setInviteError("");
    setSendingInvite(false);
  }

  async function handleSendInvitation() {
    if (!selectedCreative) return;

    if (!selectedProjectId) {
      setInviteError("Please select a project.");
      return;
    }

    setInviteError("");
    setSendingInvite(true);

    try {
      const res = await fetch(INVITE_USER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          project_id: Number(selectedProjectId),
          receiver_id: selectedCreative.user_id,
          message: invitationMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send invitation");
      }

      setNotice("Invitation Sent");
      closeInviteModal();
    } catch (err) {
      setInviteError(err.message || "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-5 md:p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
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
                  onChange={(e) => {
                    setError("");
                    setLoading(true);
                    setQuery(e.target.value);
                  }}
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-slate-100"
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
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-8 text-center text-slate-600 dark:text-white/70">
            Loading creatives...
          </div>
        ) : creatives.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-8 text-center text-slate-600 dark:text-white/70">
            No creatives found for this search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {creatives.map((user) => (
              <article
                key={user.user_id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-5"
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
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
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

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button className="rounded-xl bg-white/70 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white py-2.5 text-sm font-semibold border border-white/10 inline-flex items-center justify-center gap-2">
                    <UserRound size={15} />
                    View Profile
                  </button>

                  <button
                    onClick={() => handleConnect(user)}
                    className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white py-2.5 text-sm font-semibold shadow-lg shadow-[#1f66ff]/20"
                  >
                    Connect
                  </button>

                  <button
                    onClick={() => openInviteModal(user)}
                    className="sm:col-span-2 rounded-xl bg-[#00b3c7] hover:bg-[#0098a8] text-white py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <FolderPlus size={15} />
                    Invite to Project
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-100 dark:bg-slate-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Invite to Project
              </h3>
              <button
                onClick={closeInviteModal}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 dark:text-white/70 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-600 dark:text-white/65">
              Invite {selectedCreative?.full_name || "this creative"} to one of your projects.
            </p>

            {inviteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                {inviteError}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-700 dark:text-white/70">
                Select Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={projectsLoading || projectsCreated.length === 0}
                className="w-full rounded-xl border border-white/10 bg-white dark:bg-white/10 px-3 py-2 text-slate-900 dark:text-slate-100 outline-none"
              >
                {projectsLoading ? (
                  <option value="">Loading projects...</option>
                ) : projectsCreated.length === 0 ? (
                  <option value="">No projects created yet</option>
                ) : (
                  projectsCreated.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-slate-700 dark:text-white/70">
                Invitation Message
              </label>
              <textarea
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white dark:bg-white/10 px-3 py-2 text-slate-900 dark:text-slate-100 outline-none"
                placeholder="Write a short invitation message"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={closeInviteModal}
                className="rounded-xl border border-white/10 bg-white/70 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvitation}
                disabled={sendingInvite || projectsLoading || projectsCreated.length === 0}
                className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white"
              >
                {sendingInvite ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


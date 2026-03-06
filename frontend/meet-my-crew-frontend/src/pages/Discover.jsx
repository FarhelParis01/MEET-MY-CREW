import { useEffect, useState } from "react";
import { MapPin, Search, UserRound, FolderPlus, X } from "lucide-react";
import { searchCreatives, sendRequest } from "../api/apiClient";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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
        setCreatives(Array.isArray(res.users) ? res.users : []);
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
      const res = await fetch(MY_PROJECTS_URL, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load your projects");

      const created = Array.isArray(data.projects_created) ? data.projects_created : [];
      setProjectsCreated(created);
      if (created.length > 0) setSelectedProjectId(String(created[0].id));
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
    if (!selectedCreative || !selectedProjectId) {
      setInviteError("Please select a project.");
      return;
    }

    setInviteError("");
    setSendingInvite(true);

    try {
      const res = await fetch(INVITE_USER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          project_id: Number(selectedProjectId),
          receiver_id: selectedCreative.user_id,
          message: invitationMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitation");

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
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Discover Creatives</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search by role or skill to find collaborators.</p>
        </div>

        <Card>
          <div className="flex items-center gap-4">
            <Search size={16} className="text-slate-500 dark:text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setError("");
                setLoading(true);
                setQuery(e.target.value);
              }}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Search role or skill..."
            />
          </div>
        </Card>

        {notice ? (
          <Card className="p-4 border-emerald-200 dark:border-emerald-700">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{notice}</p>
          </Card>
        ) : null}

        {error ? (
          <Card className="p-4 border-red-200 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </Card>
        ) : null}

        {loading ? (
          <Card><p className="text-sm text-slate-500 dark:text-slate-400">Loading creatives...</p></Card>
        ) : creatives.length === 0 ? (
          <Card><p className="text-sm text-slate-500 dark:text-slate-400">No creatives found.</p></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {creatives.map((user) => (
              <Card key={user.user_id} className="p-4" as="article">
                <div className="flex items-center gap-4">
                  <img
                    src={user.photo || `https://i.pravatar.cc/200?u=${encodeURIComponent(user.full_name)}`}
                    alt={user.full_name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.full_name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin size={14} className="text-teal-500" />
                  <span>{user.city}, {user.region}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4">
                  {(Array.isArray(user.skills)
                    ? user.skills
                    : String(user.skills || "").split(",").map((s) => s.trim()).filter(Boolean)
                  ).slice(0, 4).map((skill) => (
                    <span
                      key={`${user.user_id}-${skill}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="neutral">
                      <UserRound size={16} />
                      View Profile
                    </Button>
                    <Button variant="primary" onClick={() => handleConnect(user)}>Connect</Button>
                  </div>
                  <Button variant="secondary" onClick={() => openInviteModal(user)}>
                    <FolderPlus size={16} />
                    Invite to Project
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isInviteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6">
          <Card className="w-full max-w-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Invite to Project</h2>
              <button
                onClick={closeInviteModal}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Invite {selectedCreative?.full_name || "this creative"} to one of your projects.
            </p>

            {inviteError ? (
              <Card className="mt-4 p-4 border-red-200 dark:border-red-700">
                <p className="text-sm text-red-700 dark:text-red-300">{inviteError}</p>
              </Card>
            ) : null}

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400">Select Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  disabled={projectsLoading || projectsCreated.length === 0}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {projectsLoading ? (
                    <option value="">Loading projects...</option>
                  ) : projectsCreated.length === 0 ? (
                    <option value="">No projects created yet</option>
                  ) : (
                    projectsCreated.map((project) => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400">Invitation Message</label>
                <textarea
                  rows={4}
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="neutral" onClick={closeInviteModal}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleSendInvitation}
                disabled={sendingInvite || projectsLoading || projectsCreated.length === 0}
              >
                {sendingInvite ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}

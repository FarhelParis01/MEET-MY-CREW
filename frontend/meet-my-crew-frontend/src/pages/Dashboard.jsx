import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderPlus, Compass, FolderOpen, MessageCircle, Clock3 } from "lucide-react";

const MY_PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/my-projects.php";
const MY_INVITES_URL = "http://localhost/meet-my-crew/backend/public/my-invites.php";
const MY_INBOX_URL = "http://localhost/meet-my-crew/backend/public/my-inbox.php";
const RESPOND_INVITE_URL = "http://localhost/meet-my-crew/backend/public/respond-invite.php";
const PROJECT_MESSAGES_URL = "http://localhost/meet-my-crew/backend/public/project-messages.php";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function projectIdOf(project) {
  return project?.id || project?.project_id || null;
}

function inviteIdOf(invite) {
  return invite?.id || invite?.invite_id || null;
}

function formatWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countUnread(messages) {
  return asArray(messages).filter((msg) => {
    if (msg.is_read === 0 || msg.is_read === "0" || msg.is_read === false) return true;
    if (msg.read_at === null || msg.read_at === undefined || msg.read_at === "") return true;
    return false;
  }).length;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [invites, setInvites] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [recentChats, setRecentChats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteActionLoadingId, setInviteActionLoadingId] = useState(null);

  async function fetchInvitesOnly() {
    const res = await fetch(MY_INVITES_URL, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load invites");
    setInvites(asArray(data));
    return asArray(data);
  }

  async function fetchRecentChats(projects) {
    const unique = [];
    const seen = new Set();

    projects.forEach((project) => {
      const pid = projectIdOf(project);
      if (!pid || seen.has(pid)) return;
      seen.add(pid);
      unique.push(project);
    });

    const previews = await Promise.all(
      unique.map(async (project) => {
        const pid = projectIdOf(project);
        try {
          const res = await fetch(
            `${PROJECT_MESSAGES_URL}?project_id=${encodeURIComponent(pid)}`,
            { credentials: "include" }
          );
          const data = await res.json();
          if (!res.ok) return null;
          const list = asArray(data);
          if (list.length === 0) return null;
          const last = list[list.length - 1];
          return {
            project_id: pid,
            title: project.title || `Project #${pid}`,
            last_message: last.message || "",
            created_at: last.created_at || "",
          };
        } catch {
          return null;
        }
      })
    );

    const sorted = previews
      .filter(Boolean)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 3);

    setRecentChats(sorted);
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [projectsRes, invitesRes, inboxRes] = await Promise.all([
        fetch(MY_PROJECTS_URL, { credentials: "include" }),
        fetch(MY_INVITES_URL, { credentials: "include" }),
        fetch(MY_INBOX_URL, { credentials: "include" }),
      ]);

      const projectsData = await projectsRes.json();
      const invitesData = await invitesRes.json();
      const inboxData = await inboxRes.json();

      if (!projectsRes.ok) {
        throw new Error(projectsData.error || "Failed to load projects");
      }
      if (!invitesRes.ok) {
        throw new Error(invitesData.error || "Failed to load invites");
      }
      if (!inboxRes.ok) {
        throw new Error(inboxData.error || "Failed to load inbox");
      }

      const created = asArray(projectsData.projects_created);
      const joined = asArray(projectsData.projects_joined);
      const nextInvites = asArray(invitesData);
      const nextInbox = asArray(inboxData.messages);

      setCreatedProjects(created);
      setJoinedProjects(joined);
      setInvites(nextInvites);
      setInbox(nextInbox);

      await fetchRecentChats([...created, ...joined]);
    } catch (err) {
      setCreatedProjects([]);
      setJoinedProjects([]);
      setInvites([]);
      setInbox([]);
      setRecentChats([]);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function respondInvite(inviteId, action) {
    setInviteActionLoadingId(inviteId);
    setError("");

    try {
      const res = await fetch(RESPOND_INVITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ invite_id: inviteId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update invitation");

      await fetchInvitesOnly();
    } catch (err) {
      setError(err.message || "Failed to update invitation");
    } finally {
      setInviteActionLoadingId(null);
    }
  }

  const stats = useMemo(
    () => ({
      created_projects_count: createdProjects.length || 0,
      joined_projects_count: joinedProjects.length || 0,
      pending_invites_count: invites.length || 0,
      unread_messages_count: countUnread(inbox) || 0,
    }),
    [createdProjects, joinedProjects, invites, inbox]
  );

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/65">Overview of your projects and activity.</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-white/65">Created Projects</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.created_projects_count}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-white/65">Joined Projects</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.joined_projects_count}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-white/65">Pending Invites</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.pending_invites_count}</div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-4">
            <div className="text-sm text-slate-600 dark:text-white/65">Unread Messages</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{stats.unread_messages_count}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            to="/start-project"
            className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-4 py-3 font-semibold inline-flex items-center justify-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Start Project
          </Link>

          <Link
            to="/discover"
            className="rounded-xl bg-white/70 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-4 py-3 font-semibold border border-white/10 inline-flex items-center justify-center gap-2"
          >
            <Compass className="h-4 w-4" />
            Discover Creatives
          </Link>

          <Link
            to="/my-projects"
            className="rounded-xl bg-white/70 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-4 py-3 font-semibold border border-white/10 inline-flex items-center justify-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            My Projects
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pending Invitations</h3>

        {loading ? (
          <div className="mt-4 text-sm text-slate-600 dark:text-white/65">Loading invitations...</div>
        ) : invites.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600 dark:text-white/65">No pending invitations.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {invites.slice(0, 3).map((invite) => {
              const inviteId = inviteIdOf(invite);
              return (
                <div
                  key={inviteId}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{invite.title || "Project Invitation"}</div>
                    <div className="text-sm text-slate-600 dark:text-white/65">{invite.message || "You were invited to a project."}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={inviteActionLoadingId === inviteId}
                      onClick={() => respondInvite(inviteId, "accept")}
                      className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-3 py-2 text-sm font-semibold disabled:opacity-60"
                    >
                      Accept
                    </button>
                    <button
                      disabled={inviteActionLoadingId === inviteId}
                      onClick={() => respondInvite(inviteId, "reject")}
                      className="rounded-xl bg-white/70 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-3 py-2 text-sm font-semibold border border-white/10 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Project Chats</h3>

        {loading ? (
          <div className="mt-4 text-sm text-slate-600 dark:text-white/65">Loading project chats...</div>
        ) : recentChats.length === 0 ? (
          <div className="mt-4 text-sm text-slate-600 dark:text-white/65">No project chats yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {recentChats.slice(0, 3).map((chat) => (
              <div
                key={chat.project_id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{chat.title}</div>
                  <div className="text-sm text-slate-600 dark:text-white/65 line-clamp-1">{chat.last_message}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-white/55">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatWhen(chat.created_at)}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/project/${chat.project_id}`)}
                  className="rounded-xl bg-white/70 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-3 py-2 text-sm font-semibold border border-white/10 inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


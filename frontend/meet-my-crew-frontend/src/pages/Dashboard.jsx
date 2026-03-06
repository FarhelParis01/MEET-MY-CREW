import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock3, MessageCircle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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

  useEffect(() => {
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

        if (!projectsRes.ok) throw new Error(projectsData.error || "Failed to load projects");
        if (!invitesRes.ok) throw new Error(invitesData.error || "Failed to load invites");
        if (!inboxRes.ok) throw new Error(inboxData.error || "Failed to load inbox");

        const created = asArray(projectsData.projects_created);
        const joined = asArray(projectsData.projects_joined);

        setCreatedProjects(created);
        setJoinedProjects(joined);
        setInvites(asArray(invitesData));
        setInbox(asArray(inboxData.messages));

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
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Overview of your projects and activity.</p>
      </div>

      {error ? (
        <Card className="p-4 border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ["Created Projects", stats.created_projects_count],
          ["Joined Projects", stats.joined_projects_count],
          ["Pending Invites", stats.pending_invites_count],
          ["Unread Messages", stats.unread_messages_count],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="primary" onClick={() => navigate("/start-project")}>Start Project</Button>
          <Button variant="secondary" onClick={() => navigate("/discover")}>Discover Creatives</Button>
          <Button variant="neutral" onClick={() => navigate("/my-projects")}>My Projects</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pending Invitations</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading invitations...</p>
        ) : invites.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No pending invitations.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {invites.slice(0, 3).map((invite) => {
              const inviteId = inviteIdOf(invite);
              return (
                <Card key={inviteId} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{invite.title || "Project Invitation"}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{invite.message || "You were invited to a project."}</p>
                    </div>
                    <div className="flex gap-4">
                      <Button
                        variant="primary"
                        disabled={inviteActionLoadingId === inviteId}
                        onClick={() => respondInvite(inviteId, "accept")}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="neutral"
                        disabled={inviteActionLoadingId === inviteId}
                        onClick={() => respondInvite(inviteId, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Project Chats</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading project chats...</p>
        ) : recentChats.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No project chats yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {recentChats.map((chat) => (
              <Card key={chat.project_id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{chat.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{chat.last_message}</p>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Clock3 size={14} />
                      {formatWhen(chat.created_at)}
                    </div>
                  </div>
                  <Button variant="neutral" onClick={() => navigate(`/project/${chat.project_id}`)}>
                    <MessageCircle size={16} />
                    Open
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

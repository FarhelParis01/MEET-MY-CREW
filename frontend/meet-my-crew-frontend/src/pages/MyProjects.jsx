import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, Inbox, MapPin } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const MY_PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/my-projects.php";
const MY_INVITES_URL = "http://localhost/meet-my-crew/backend/public/my-invites.php";
const RESPOND_INVITE_URL = "http://localhost/meet-my-crew/backend/public/respond-invite.php";

function normalizeProjects(payload) {
  return {
    projectsCreated: Array.isArray(payload?.projects_created) ? payload.projects_created : [],
    projectsJoined: Array.isArray(payload?.projects_joined) ? payload.projects_joined : [],
  };
}

function normalizeInvites(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.invites)) return payload.invites;
  if (Array.isArray(payload?.pending_invites)) return payload.pending_invites;
  return [];
}

function formatDeadline(deadline) {
  if (!deadline) return "No deadline";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return deadline;
  return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function ProjectItem({ project, onClick }) {
  return (
    <Card className="p-4 cursor-pointer" as="article">
      <button onClick={onClick} className="w-full text-left">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {project.title || "Untitled Project"}
        </h3>
        <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={14} className="text-blue-600" />
            <span>{project.project_type || "No type"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-teal-500" />
            <span>{project.location || "No location"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-blue-600" />
            <span>{formatDeadline(project.deadline)}</span>
          </div>
        </div>
      </button>
    </Card>
  );
}

export default function MyProjects() {
  const navigate = useNavigate();
  const [projectsCreated, setProjectsCreated] = useState([]);
  const [projectsJoined, setProjectsJoined] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingInviteId, setActingInviteId] = useState(null);

  async function fetchInvites() {
    const res = await fetch(MY_INVITES_URL, { credentials: "include" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load invitations");
    setInvites(normalizeInvites(data));
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [projectsRes, invitesRes] = await Promise.all([
          fetch(MY_PROJECTS_URL, { credentials: "include" }),
          fetch(MY_INVITES_URL, { credentials: "include" }),
        ]);

        const projectsData = await projectsRes.json();
        const invitesData = await invitesRes.json();

        if (!projectsRes.ok) throw new Error(projectsData.error || "Failed to load projects");
        if (!invitesRes.ok) throw new Error(invitesData.error || "Failed to load invitations");

        if (!mounted) return;
        const normalized = normalizeProjects(projectsData);
        setProjectsCreated(normalized.projectsCreated);
        setProjectsJoined(normalized.projectsJoined);
        setInvites(normalizeInvites(invitesData));
      } catch (err) {
        if (!mounted) return;
        setProjectsCreated([]);
        setProjectsJoined([]);
        setInvites([]);
        setError(err.message || "Failed to load project data");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleInviteAction(inviteId, action) {
    setError("");
    setNotice("");
    setActingInviteId(inviteId);

    try {
      const res = await fetch(RESPOND_INVITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ invite_id: inviteId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to respond to invitation");

      setNotice(data.message || (action === "accept" ? "Invitation accepted" : "Invitation rejected"));
      await fetchInvites();
    } catch (err) {
      setError(err.message || "Failed to respond to invitation");
    } finally {
      setActingInviteId(null);
    }
  }

  function goToProject(project) {
    const projectId = project.id || project.project_id;
    if (projectId) navigate(`/project/${projectId}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">My Projects</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Projects you created, joined, and pending invites.</p>
      </div>

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
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading project data...</p>
        </Card>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects I Created</h2>
            {projectsCreated.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 dark:text-slate-400">You have not created any projects yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projectsCreated.map((project) => (
                  <ProjectItem
                    key={project.id || project.project_id || project.title}
                    project={project}
                    onClick={() => goToProject(project)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects I Joined</h2>
            {projectsJoined.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 dark:text-slate-400">You have not joined any projects yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projectsJoined.map((project) => (
                  <ProjectItem
                    key={project.id || project.project_id || project.title}
                    project={project}
                    onClick={() => goToProject(project)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pending Invitations</h2>
            {invites.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 dark:text-slate-400">No pending invitations.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {invites.map((invite) => {
                  const inviteId = invite.id || invite.invite_id;
                  return (
                    <Card key={inviteId} className="p-4" as="article">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Inbox size={14} className="text-teal-500" />
                        Pending invitation
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {invite.title || invite.project_title || "Project Invitation"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {invite.message || "You have been invited to collaborate on this project."}
                      </p>
                      <div className="mt-4 flex gap-4">
                        <Button
                          variant="primary"
                          disabled={actingInviteId === inviteId}
                          onClick={() => handleInviteAction(inviteId, "accept")}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="neutral"
                          disabled={actingInviteId === inviteId}
                          onClick={() => handleInviteAction(inviteId, "reject")}
                        >
                          Reject
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

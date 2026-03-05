import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, CalendarDays, Inbox, MapPin } from "lucide-react";

const MY_PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/my-projects.php";
const MY_INVITES_URL = "http://localhost/meet-my-crew/backend/public/my-invites.php";
const RESPOND_INVITE_URL = "http://localhost/meet-my-crew/backend/public/respond-invite.php";

function normalizeProjects(payload) {
  return {
    projectsCreated: Array.isArray(payload?.projects_created)
      ? payload.projects_created
      : [],
    projectsJoined: Array.isArray(payload?.projects_joined)
      ? payload.projects_joined
      : [],
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

function ProjectCard({ project, onClick }) {
  return (
    <article
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5 cursor-pointer hover:bg-white/55 dark:hover:bg-white/10 transition-colors"
    >
      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
        {project.title || "Untitled Project"}
      </h4>

      <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-white/70">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-[#1f66ff]" />
          <span>{project.project_type || "No type"}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#00b3c7]" />
          <span>{project.location || "No location"}</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#1f66ff]" />
          <span>{formatDeadline(project.deadline)}</span>
        </div>
      </div>
    </article>
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

    if (!res.ok) {
      throw new Error(data.error || "Failed to load invitations");
    }

    setInvites(normalizeInvites(data));
  }

  useEffect(() => {
    let isMounted = true;

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

        if (!projectsRes.ok) {
          throw new Error(projectsData.error || "Failed to load projects");
        }

        if (!invitesRes.ok) {
          throw new Error(invitesData.error || "Failed to load invitations");
        }

        if (!isMounted) return;

        const normalizedProjects = normalizeProjects(projectsData);
        setProjectsCreated(normalizedProjects.projectsCreated);
        setProjectsJoined(normalizedProjects.projectsJoined);
        setInvites(normalizeInvites(invitesData));
      } catch (err) {
        if (!isMounted) return;
        setProjectsCreated([]);
        setProjectsJoined([]);
        setInvites([]);
        setError(err.message || "Failed to load project data");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleInviteAction(inviteId, action) {
    setError("");
    setNotice("");
    setActingInviteId(inviteId);

    try {
      const res = await fetch(RESPOND_INVITE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          invite_id: inviteId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to respond to invitation");
      }

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
    if (!projectId) return;
    navigate(`/project/${projectId}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white/90">My Projects</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/65">
          Review projects you created, projects you joined, and pending invitations.
        </p>
      </section>

      {notice ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-100/60 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 text-center text-slate-600 dark:text-white/70">
          Loading project data...
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white/90">Projects I Created</h3>

            {projectsCreated.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-600 dark:text-white/70">
                You have not created any projects yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {projectsCreated.map((project) => (
                  <ProjectCard
                    key={project.id || project.project_id || project.title}
                    project={project}
                    onClick={() => goToProject(project)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white/90">Projects I Joined</h3>

            {projectsJoined.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-600 dark:text-white/70">
                You have not joined any projects yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {projectsJoined.map((project) => (
                  <ProjectCard
                    key={project.id || project.project_id || project.title}
                    project={project}
                    onClick={() => goToProject(project)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white/90">Pending Invitations</h3>

            {invites.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-600 dark:text-white/70">
                No pending invitations.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {invites.map((invite) => {
                  const inviteId = invite.id || invite.invite_id;
                  return (
                    <article
                      key={inviteId}
                      className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5"
                    >
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/65">
                        <Inbox className="h-4 w-4 text-[#00b3c7]" />
                        Pending invitation
                      </div>

                      <h4 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {invite.title || invite.project_title || "Project Invitation"}
                      </h4>

                      <p className="mt-2 text-sm text-slate-700 dark:text-white/70">
                        {invite.message || "You have been invited to collaborate on this project."}
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          disabled={actingInviteId === inviteId}
                          onClick={() => handleInviteAction(inviteId, "accept")}
                          className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Accept
                        </button>

                        <button
                          disabled={actingInviteId === inviteId}
                          onClick={() => handleInviteAction(inviteId, "reject")}
                          className="rounded-xl bg-white/70 hover:bg-white text-slate-900 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white px-4 py-2 text-sm font-semibold border border-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </div>
                    </article>
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

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, BriefcaseBusiness, Inbox } from "lucide-react";

const PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/my-projects.php";
const INVITES_URL = "http://localhost/meet-my-crew/backend/public/my-invites.php";
const RESPOND_INVITE_URL = "http://localhost/meet-my-crew/backend/public/respond-invite.php";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeProjectsResponse(data) {
  return {
    created: asArray(
      data.created_projects ?? data.projects_created ?? data.created ?? data.my_projects
    ),
    joined: asArray(
      data.joined_projects ?? data.projects_joined ?? data.joined ?? data.member_projects
    ),
  };
}

function normalizeInvitesResponse(data) {
  const invites = asArray(data.pending_invites ?? data.invites ?? data.requests);
  return invites.filter((invite) => {
    const status = String(invite.status || "pending").toLowerCase();
    return status === "pending";
  });
}

function formatDeadline(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProjectCard({ project }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {project.title || "Untitled Project"}
      </h3>

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
  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actingInviteId, setActingInviteId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [projectsRes, invitesRes] = await Promise.all([
          fetch(PROJECTS_URL, { credentials: "include" }),
          fetch(INVITES_URL, { credentials: "include" }),
        ]);

        const projectsData = await projectsRes.json();
        const invitesData = await invitesRes.json();

        if (!projectsRes.ok) {
          throw new Error(projectsData.error || "Failed to load projects");
        }

        if (!invitesRes.ok) {
          throw new Error(invitesData.error || "Failed to load invitations");
        }

        const normalizedProjects = normalizeProjectsResponse(projectsData || {});
        const normalizedInvites = normalizeInvitesResponse(invitesData || {});

        if (!isMounted) return;
        setCreatedProjects(normalizedProjects.created);
        setJoinedProjects(normalizedProjects.joined);
        setPendingInvites(normalizedInvites);
      } catch (err) {
        if (!isMounted) return;
        setCreatedProjects([]);
        setJoinedProjects([]);
        setPendingInvites([]);
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

  async function respondToInvite(inviteId, action) {
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
        body: JSON.stringify({ invite_id: inviteId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update invitation");
      }

      setPendingInvites((prev) =>
        prev.filter((invite) => {
          const id = invite.invite_id ?? invite.id;
          return Number(id) !== Number(inviteId);
        })
      );

      setNotice(data.message || (action === "accept" ? "Invitation accepted" : "Invitation rejected"));
    } catch (err) {
      setError(err.message || "Failed to update invitation");
    } finally {
      setActingInviteId(null);
    }
  }

  const createdCount = useMemo(() => createdProjects.length, [createdProjects]);
  const joinedCount = useMemo(() => joinedProjects.length, [joinedProjects]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white/90">My Projects</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/65">
          Manage projects you created, projects you joined, and pending invitations.
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
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white/90">Projects I Created</h3>
              <span className="text-sm text-slate-600 dark:text-white/65">{createdCount}</span>
            </div>

            {createdProjects.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-600 dark:text-white/70">
                You have not created any projects yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {createdProjects.map((project) => (
                  <ProjectCard key={project.id || project.project_id || project.title} project={project} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white/90">Projects I Joined</h3>
              <span className="text-sm text-slate-600 dark:text-white/65">{joinedCount}</span>
            </div>

            {joinedProjects.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-600 dark:text-white/70">
                You have not joined any projects yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {joinedProjects.map((project) => (
                  <ProjectCard key={project.id || project.project_id || project.title} project={project} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white/90">Pending Invitations</h3>

            {pendingInvites.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-600 dark:text-white/70">
                No pending invitations.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingInvites.map((invite) => {
                  const inviteId = invite.invite_id ?? invite.id;
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
                        {invite.project_title || invite.title || "Project Invitation"}
                      </h4>

                      <p className="mt-2 text-sm text-slate-700 dark:text-white/70">
                        {invite.message || "You have been invited to collaborate on this project."}
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          disabled={actingInviteId === inviteId}
                          onClick={() => respondToInvite(inviteId, "accept")}
                          className="rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-4 py-2 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Accept
                        </button>
                        <button
                          disabled={actingInviteId === inviteId}
                          onClick={() => respondToInvite(inviteId, "reject")}
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

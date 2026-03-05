import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  Coins,
  MapPin,
  Users,
  UserRoundPlus,
} from "lucide-react";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProjectDetails() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `http://localhost/meet-my-crew/backend/public/project-details.php?id=${encodeURIComponent(id || "")}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load project details");
        }

        if (!isMounted) return;

        const nextProject = data.project || data.project_details || data.details || data;

        const nextMembers = Array.isArray(data.team_members)
          ? data.team_members
          : Array.isArray(data.members)
            ? data.members
            : [];

        const nextInvites = Array.isArray(data.pending_invitations)
          ? data.pending_invitations
          : Array.isArray(data.invitations)
            ? data.invitations
            : Array.isArray(data.invites)
              ? data.invites
              : [];

        setProject(nextProject);
        setTeamMembers(nextMembers);
        setPendingInvitations(nextInvites);
      } catch (err) {
        if (!isMounted) return;
        setProject(null);
        setTeamMembers([]);
        setPendingInvitations([]);
        setError(err.message || "Failed to load project details");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    if (!id) {
      setError("Project id is missing");
      setLoading(false);
      return;
    }

    loadProjectDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formattedDeadline = useMemo(() => {
    if (!project?.deadline) return "No deadline";
    const date = new Date(project.deadline);
    if (Number.isNaN(date.getTime())) return project.deadline;
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [project]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white/90">
          Project Details
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/65">
          View project information, team members, and invitation status.
        </p>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 text-center text-slate-600 dark:text-white/70">
          Loading project details...
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-xl p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {project?.title || "Untitled Project"}
            </h3>

            <p className="mt-3 text-sm text-slate-700 dark:text-white/70">
              {project?.description || "No description"}
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-white/70">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-[#1f66ff]" />
                <span>{project?.project_type || "No project type"}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#00b3c7]" />
                <span>{project?.location || "No location"}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#1f66ff]" />
                <span>{formattedDeadline}</span>
              </div>

              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#00b3c7]" />
                <span>{project?.budget ?? "No budget"}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white/90">
              Team Members
            </h3>

            {teamMembers.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-600 dark:text-white/70">
                No team members found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {teamMembers.map((member) => (
                  <article
                    key={member.user_id || member.id || member.email || member.name}
                    className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5"
                  >
                    <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-white/65">
                      <Users className="h-4 w-4 text-[#1f66ff]" />
                      Member
                    </div>

                    <h4 className="mt-2 font-semibold text-slate-900 dark:text-white">
                      {member.full_name || member.name || "Unnamed"}
                    </h4>

                    <p className="mt-1 text-sm text-slate-700 dark:text-white/70">
                      {member.role || "No role"}
                    </p>

                    <p className="mt-1 text-sm text-slate-700 dark:text-white/70">
                      {member.city || "Unknown city"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white/90">
              Pending Invitations
            </h3>

            {pendingInvitations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-6 text-sm text-slate-600 dark:text-white/70">
                No pending invitations.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {pendingInvitations.map((invite) => (
                  <article
                    key={invite.id || invite.invite_id || invite.receiver_id}
                    className="rounded-2xl border border-white/10 bg-white/45 dark:bg-white/5 backdrop-blur-xl p-5"
                  >
                    <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-white/65">
                      <UserRoundPlus className="h-4 w-4 text-[#00b3c7]" />
                      Invitation
                    </div>

                    <h4 className="mt-2 font-semibold text-slate-900 dark:text-white">
                      {invite.full_name || invite.name || "Unknown user"}
                    </h4>

                    <p className="mt-1 text-sm text-slate-700 dark:text-white/70 capitalize">
                      {invite.status || "pending"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

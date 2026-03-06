import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  Coins,
  MapPin,
  UserRoundPlus,
  Pencil,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const PROJECT_DETAILS_URL = "http://localhost/meet-my-crew/backend/public/project-details.php";
const PROJECT_MEMBERS_URL = "http://localhost/meet-my-crew/backend/public/project-members.php";
const PROJECT_INVITES_URL = "http://localhost/meet-my-crew/backend/public/project-invites.php";
const MY_PROFILE_URL = "http://localhost/meet-my-crew/backend/public/my-profile.php";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatDeadline(deadline) {
  if (!deadline) return "No deadline";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return deadline;
  return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function parseId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getCreatorId(project) {
  return parseId(project?.creator_id ?? project?.created_by ?? project?.owner_id);
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const projectId = parseId(id);

  const creatorId = useMemo(() => getCreatorId(project), [project]);
  const isCreator = useMemo(() => {
    if (!creatorId || !currentUserId) return false;
    return creatorId === currentUserId;
  }, [creatorId, currentUserId]);

  async function fetchCurrentUser() {
    const res = await fetch(MY_PROFILE_URL, { method: "GET", credentials: "include" });
    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data?.error || "Failed to load current user");
    }

    const uid = parseId(data?.user?.user_id ?? data?.user_id ?? data?.id);
    setCurrentUserId(uid);

    return uid;
  }

  async function fetchProjectHeader() {
    if (!projectId) return null;

    const res = await fetch(`${PROJECT_DETAILS_URL}?id=${encodeURIComponent(projectId)}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await safeJson(res);
    if (!res.ok) {
      throw new Error(data?.error || "Failed to load project details");
    }

    const resolvedProject = data?.project || data?.project_details || data?.details || null;
    setProject(resolvedProject);

    return { data, resolvedProject };
  }

  async function fetchMembers(fallbackDetailsData) {
    if (!projectId) return;

    try {
      const res = await fetch(`${PROJECT_MEMBERS_URL}?project_id=${encodeURIComponent(projectId)}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await safeJson(res);
      if (res.ok) {
        setMembers(asArray(data?.members ?? data));
        return;
      }
    } catch {
      // fallback below
    }

    setMembers(asArray(fallbackDetailsData?.members));
  }

  async function fetchPendingInvites(fallbackDetailsData) {
    if (!projectId) return;

    try {
      const res = await fetch(`${PROJECT_INVITES_URL}?project_id=${encodeURIComponent(projectId)}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await safeJson(res);
      if (res.ok) {
        setPendingInvites(
          asArray(data?.invites ?? data).filter((invite) => (invite?.status || "pending") === "pending")
        );
        return;
      }
    } catch {
      // fallback below
    }

    setPendingInvites(
      asArray(fallbackDetailsData?.invites).filter((invite) => (invite?.status || "pending") === "pending")
    );
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!projectId) {
        setError("Project id is missing");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setNotice("");

      try {
        const [{ data: details, resolvedProject }, uid] = await Promise.all([
          fetchProjectHeader(),
          fetchCurrentUser(),
        ]);

        if (!mounted) return;

        const resolvedCreatorId = getCreatorId(resolvedProject);
        const canManage = resolvedCreatorId && uid ? resolvedCreatorId === uid : false;

        await fetchMembers(details);

        if (canManage) {
          await fetchPendingInvites(details);
        } else {
          setPendingInvites([]);
        }
      } catch (err) {
        if (!mounted) return;
        setProject(null);
        setMembers([]);
        setPendingInvites([]);
        setCurrentUserId(null);
        setError(err.message || "Failed to load project details");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const deadline = useMemo(() => formatDeadline(project?.deadline), [project?.deadline]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Project Details</h1>

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
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading project details...</p>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {project?.title || "Untitled Project"}
                </h2>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="inline-flex items-center gap-2"><BriefcaseBusiness size={14} className="text-blue-600" /> {project?.project_type || "No project type"}</div>
                  <div className="inline-flex items-center gap-2"><MapPin size={14} className="text-teal-500" /> {project?.location || "No location"}</div>
                  <div className="inline-flex items-center gap-2"><CalendarDays size={14} className="text-blue-600" /> {deadline}</div>
                  <div className="inline-flex items-center gap-2"><Coins size={14} className="text-teal-500" /> {project?.budget ?? "No budget"}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/messages?project_id=${encodeURIComponent(projectId || "")}`)}
                >
                  Open Project Chat
                </Button>

                {isCreator ? (
                  <>
                    <Button variant="secondary" onClick={() => navigate(`/discover?project_id=${encodeURIComponent(projectId || "")}`)}>
                      Invite Collaborator
                    </Button>
                    <Button variant="neutral" onClick={() => setNotice("Edit Project flow can be connected to your edit endpoint/page.") }>
                      <Pencil size={16} />
                      Edit Project
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Overview</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {project?.description || "No project description available."}
              </p>

              <div className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <div>Project ID: {project?.id || projectId || "N/A"}</div>
                <div>Type: {project?.project_type || "No project type"}</div>
                <div>Location: {project?.location || "No location"}</div>
                <div>Deadline: {deadline}</div>
                <div>Budget: {project?.budget ?? "No budget"}</div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Members</h3>
              {members.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No members found.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {members.map((member) => {
                    const memberId = parseId(member.user_id ?? member.id);
                    const memberIsCreator = Boolean(creatorId && memberId && creatorId === memberId);

                    return (
                      <div
                        key={member.user_id || member.id || member.full_name}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{member.full_name || "Unnamed member"}</p>
                          {memberIsCreator ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Creator
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.role || "No role"}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.city || "Unknown city"}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {isCreator ? (
              <Card className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pending Invitations</h3>
                {pendingInvites.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No pending invitations.</p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id || invite.invite_id || `${invite.receiver_id}-${invite.full_name}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <UserRoundPlus size={14} className="text-teal-500" />
                          Invitation
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {invite.full_name || invite.receiver_name || "Invited user"}
                        </p>
                        <p className="text-sm capitalize text-slate-500 dark:text-slate-400">{invite.status || "pending"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

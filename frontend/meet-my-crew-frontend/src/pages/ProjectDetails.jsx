import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  Coins,
  MapPin,
  Users,
  UserRoundPlus,
  MessageCircle,
  Send,
} from "lucide-react";

export default function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  async function fetchMessages(projectId) {
    setMessagesLoading(true);
    setMessagesError("");

    try {
      const res = await fetch(
        `http://localhost/meet-my-crew/backend/public/project-messages.php?project_id=${encodeURIComponent(projectId)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load project messages");
      }

      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessages([]);
      setMessagesError(err.message || "Failed to load project messages");
    } finally {
      setMessagesLoading(false);
    }
  }

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
      setMessagesLoading(false);
      return;
    }

    loadProjectDetails();
    fetchMessages(id);

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleSendMessage(event) {
    event.preventDefault();

    const message = newMessage.trim();
    if (!message || !id) return;

    setSendingMessage(true);
    setMessagesError("");

    try {
      const res = await fetch(
        "http://localhost/meet-my-crew/backend/public/send-project-message.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            project_id: Number(id),
            message,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      await fetchMessages(id);
    } catch (err) {
      setMessagesError(err.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  }

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
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-8 text-center text-slate-600 dark:text-white/70">
          Loading project details...
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
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
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Team Members
            </h3>

            {teamMembers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6 text-sm text-slate-600 dark:text-white/70">
                No team members found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {teamMembers.map((member) => (
                  <article
                    key={member.user_id || member.id || member.email || member.name}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-5"
                  >
                    <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-white/65">
                      <Users className="h-4 w-4 text-[#1f66ff]" />
                      Member
                    </div>

                    <h4 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
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
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Pending Invitations
            </h3>

            {pendingInvitations.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-6 text-sm text-slate-600 dark:text-white/70">
                No pending invitations.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {pendingInvitations.map((invite) => (
                  <article
                    key={invite.id || invite.invite_id || invite.receiver_id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-5"
                  >
                    <div className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-white/65">
                      <UserRoundPlus className="h-4 w-4 text-[#00b3c7]" />
                      Invitation
                    </div>

                    <h4 className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
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

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Project Chat
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 p-4 md:p-5">
              {messagesError ? (
                <div className="mb-3 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  {messagesError}
                </div>
              ) : null}

              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {messagesLoading ? (
                  <div className="text-sm text-slate-600 dark:text-white/65">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-sm text-slate-600 dark:text-white/65">No messages yet.</div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={`${msg.created_at}-${index}`} className="flex">
                      <div className="max-w-[85%] rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 px-4 py-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/55">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span className="font-semibold text-slate-700 dark:text-white/80">
                            {msg.sender || "Unknown"}
                          </span>
                          <span>•</span>
                          <span>{msg.created_at || ""}</span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-800 dark:text-white/90">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 px-4 py-2.5 text-slate-900 dark:text-slate-100 outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1f66ff] hover:bg-[#1b59db] text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  {sendingMessage ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </section>
        </>
      )}
    </div>
  );
}


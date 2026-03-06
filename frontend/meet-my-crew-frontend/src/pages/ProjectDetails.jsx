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
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load project messages");
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessages([]);
      setMessagesError(err.message || "Failed to load project messages");
    } finally {
      setMessagesLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadProjectDetails() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `http://localhost/meet-my-crew/backend/public/project-details.php?id=${encodeURIComponent(id || "")}`,
          { method: "GET", credentials: "include" }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load project details");
        if (!mounted) return;

        setProject(data.project || data.project_details || data.details || data);
        setTeamMembers(Array.isArray(data.members) ? data.members : []);
        setPendingInvitations(Array.isArray(data.invites) ? data.invites : []);
      } catch (err) {
        if (!mounted) return;
        setProject(null);
        setTeamMembers([]);
        setPendingInvitations([]);
        setError(err.message || "Failed to load project details");
      } finally {
        if (!mounted) return;
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
      mounted = false;
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
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ project_id: Number(id), message }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

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
    return date.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  }, [project]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Project Details</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Project info, team, invites, and chat.</p>
      </div>

      {error ? (
        <Card className="p-4 border-red-200 dark:border-red-700">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </Card>
      ) : null}

      {loading ? (
        <Card><p className="text-sm text-slate-500 dark:text-slate-400">Loading project details...</p></Card>
      ) : (
        <>
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {project?.title || "Untitled Project"}
            </h2>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{project?.description || "No description"}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><BriefcaseBusiness size={14} className="text-blue-600" /> {project?.project_type || "No project type"}</div>
              <div className="flex items-center gap-2"><MapPin size={14} className="text-teal-500" /> {project?.location || "No location"}</div>
              <div className="flex items-center gap-2"><CalendarDays size={14} className="text-blue-600" /> {formattedDeadline}</div>
              <div className="flex items-center gap-2"><Coins size={14} className="text-teal-500" /> {project?.budget ?? "No budget"}</div>
            </div>
          </Card>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Team Members</h2>
            {teamMembers.length === 0 ? (
              <Card><p className="text-sm text-slate-500 dark:text-slate-400">No team members found.</p></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.user_id || member.id || member.full_name} className="p-4" as="article">
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Users size={14} className="text-blue-600" /> Member
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{member.full_name || "Unnamed"}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{member.role || "No role"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{member.city || "Unknown city"}</p>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pending Invitations</h2>
            {pendingInvitations.length === 0 ? (
              <Card><p className="text-sm text-slate-500 dark:text-slate-400">No pending invitations.</p></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pendingInvitations.map((invite) => (
                  <Card key={invite.id || invite.invite_id || invite.receiver_id} className="p-4" as="article">
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <UserRoundPlus size={14} className="text-teal-500" /> Invitation
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{invite.full_name || "Unknown user"}</h3>
                    <p className="text-sm capitalize text-slate-500 dark:text-slate-400">{invite.status || "pending"}</p>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Project Chat</h2>
            <Card>
              {messagesError ? (
                <Card className="p-4 border-red-200 dark:border-red-700">
                  <p className="text-sm text-red-700 dark:text-red-300">{messagesError}</p>
                </Card>
              ) : null}

              <div className="max-h-80 overflow-y-auto space-y-4">
                {messagesLoading ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet.</p>
                ) : (
                  messages.map((msg, index) => (
                    <Card key={`${msg.created_at}-${index}`} className="p-4" as="article">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <MessageCircle size={14} />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{msg.sender || "Unknown"}</span>
                        <span>•</span>
                        <span>{msg.created_at || ""}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-900 dark:text-slate-100">{msg.message}</p>
                    </Card>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="mt-6 flex items-center gap-4">
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <Button type="submit" variant="primary" disabled={sendingMessage || !newMessage.trim()}>
                  <Send size={16} />
                  {sendingMessage ? "Sending..." : "Send"}
                </Button>
              </form>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

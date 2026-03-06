import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare, Send, Users, ArrowLeft } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const MY_PROFILE_URL = "http://localhost/meet-my-crew/backend/public/my-profile.php";
const GET_MESSAGES_URL = "http://localhost/meet-my-crew/backend/public/get-messages.php";
const SEND_MESSAGE_URL = "http://localhost/meet-my-crew/backend/public/send-message.php";
const GET_PROJECT_MESSAGES_URL = "http://localhost/meet-my-crew/backend/public/get-project-messages.php";
const SEND_PROJECT_MESSAGE_URL = "http://localhost/meet-my-crew/backend/public/send-project-message.php";
const MY_PROJECTS_URL = "http://localhost/meet-my-crew/backend/public/my-projects.php";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatTimestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getDirectConversations(messages, currentUserId) {
  const map = new Map();

  asArray(messages).forEach((msg) => {
    const senderId = parseId(msg.sender_id);
    const receiverId = parseId(msg.receiver_id);

    if (!senderId || !receiverId || !currentUserId) return;

    const otherId = senderId === currentUserId ? receiverId : senderId;
    const otherName = senderId === currentUserId ? msg.receiver_name : msg.sender_name;

    if (!map.has(otherId)) {
      map.set(otherId, {
        id: otherId,
        name: otherName || `User #${otherId}`,
        lastAt: msg.sent_at || "",
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    return new Date(b.lastAt || 0) - new Date(a.lastAt || 0);
  });
}

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [directConversations, setDirectConversations] = useState([]);
  const [projectChats, setProjectChats] = useState([]);
  const [activeMode, setActiveMode] = useState("direct");
  const [activeId, setActiveId] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const selectedUserId = parseId(searchParams.get("user_id"));
  const selectedProjectId = parseId(searchParams.get("project_id"));

  const chatTitle = useMemo(() => {
    if (activeMode === "project") {
      const project = projectChats.find((p) => p.id === activeId);
      if (!project) return "Project Chat";
      const creatorName = project.creator_name || "Unknown creator";
      return `${project.title} - ${creatorName}`;
    }

    const direct = directConversations.find((d) => d.id === activeId);
    return direct?.name || "Direct Chat";
  }, [activeMode, activeId, directConversations, projectChats]);

  async function fetchProfile() {
    const res = await fetch(MY_PROFILE_URL, { credentials: "include" });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data?.error || "Failed to load profile");

    const uid = parseId(data?.user?.user_id ?? data?.user_id ?? data?.id);
    setCurrentUserId(uid);
    return uid;
  }

  async function fetchDirectConversationList(uid) {
    const res = await fetch(GET_MESSAGES_URL, { credentials: "include" });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data?.error || "Failed to load direct messages");

    const messages = asArray(data?.messages);
    setDirectConversations(getDirectConversations(messages, uid));
  }

  async function fetchProjectChatList(uid) {
    const res = await fetch(MY_PROJECTS_URL, { credentials: "include" });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data?.error || "Failed to load projects");

    const created = asArray(data?.projects_created);
    const joined = asArray(data?.projects_joined);
    const map = new Map();

    [...created, ...joined].forEach((project) => {
      const id = parseId(project.id ?? project.project_id);
      if (!id) return;
      if (!map.has(id)) {
        const creatorName =
          project.creator_name ||
          (parseId(project.creator_id) === uid ? "You" : `User #${project.creator_id || "?"}`);

        map.set(id, {
          id,
          title: project.title || `Project #${id}`,
          creator_name: creatorName,
        });
      }
    });

    setProjectChats(Array.from(map.values()));
  }

  async function loadDirectMessages(userId) {
    const res = await fetch(`${GET_MESSAGES_URL}?user_id=${encodeURIComponent(userId)}`, {
      credentials: "include",
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data?.error || "Failed to load direct conversation");

    const messages = asArray(data?.messages).map((msg) => ({
      id: msg.message_id,
      sender_id: parseId(msg.sender_id),
      sender: msg.sender_name,
      text: msg.message_text,
      timestamp: msg.sent_at,
    }));

    setChatMessages(messages);
  }

  async function loadProjectMessages(projectId) {
    const res = await fetch(`${GET_PROJECT_MESSAGES_URL}?project_id=${encodeURIComponent(projectId)}`, {
      credentials: "include",
    });
    const data = await parseJsonSafe(res);
    if (!res.ok) throw new Error(data?.error || "Failed to load project chat");

    const messages = asArray(data?.messages).map((msg, idx) => ({
      id: msg.id ?? `${projectId}-${idx}`,
      sender_id: parseId(msg.sender_id),
      sender: msg.sender,
      text: msg.message,
      timestamp: msg.created_at,
    }));

    setChatMessages(messages);
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setLoading(true);
      setError("");

      try {
        const uid = await fetchProfile();
        if (!mounted) return;

        await Promise.all([fetchDirectConversationList(uid), fetchProjectChatList(uid)]);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load conversations");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      setActiveMode("project");
      setActiveId(selectedProjectId);
      if (isMobileViewport()) setMobileShowChat(true);
      return;
    }

    if (selectedUserId) {
      setActiveMode("direct");
      setActiveId(selectedUserId);
      if (isMobileViewport()) setMobileShowChat(true);
      return;
    }

    if (directConversations.length > 0) {
      setActiveMode("direct");
      setActiveId(directConversations[0].id);
      setSearchParams({ user_id: String(directConversations[0].id) });
      return;
    }

    if (projectChats.length > 0) {
      setActiveMode("project");
      setActiveId(projectChats[0].id);
      setSearchParams({ project_id: String(projectChats[0].id) });
    }
  }, [selectedUserId, selectedProjectId, directConversations, projectChats, setSearchParams]);

  useEffect(() => {
    if (!activeId) {
      setChatMessages([]);
      return;
    }

    let canceled = false;

    async function loadCurrentChat() {
      setLoading(true);
      setError("");

      try {
        if (activeMode === "project") {
          await loadProjectMessages(activeId);
        } else {
          await loadDirectMessages(activeId);
        }
      } catch (err) {
        if (canceled) return;
        setChatMessages([]);
        setError(err.message || "Failed to load chat messages");
      } finally {
        if (canceled) return;
        setLoading(false);
      }
    }

    loadCurrentChat();

    return () => {
      canceled = true;
    };
  }, [activeMode, activeId]);

  function selectDirectConversation(userId) {
    setActiveMode("direct");
    setActiveId(userId);
    setSearchParams({ user_id: String(userId) });
    if (isMobileViewport()) setMobileShowChat(true);
  }

  function selectProjectChat(projectId) {
    setActiveMode("project");
    setActiveId(projectId);
    setSearchParams({ project_id: String(projectId) });
    if (isMobileViewport()) setMobileShowChat(true);
  }

  function goBackToConversations() {
    setMobileShowChat(false);
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;

    setSending(true);
    setError("");

    try {
      if (activeMode === "project") {
        const response = await fetch(SEND_PROJECT_MESSAGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            project_id: activeId,
            message: text,
          }),
        });

        const data = await parseJsonSafe(response);
        if (!response.ok) {
          throw new Error(data?.error || "Failed to send project message");
        }

        await loadProjectMessages(activeId);
      } else {
        const response = await fetch(SEND_MESSAGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            receiver_id: activeId,
            message_text: text,
          }),
        });

        const data = await parseJsonSafe(response);
        if (!response.ok) {
          throw new Error(data?.error || "Failed to send direct message");
        }

        await Promise.all([loadDirectMessages(activeId), fetchDirectConversationList(currentUserId)]);
      }

      setDraft("");
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-9rem)] min-h-[calc(100vh-9rem)]">
      <aside className={`${mobileShowChat ? "hidden" : "col-span-12 lg:col-span-4"}`}>
        <Card className="p-4 h-full">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Conversations</h2>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Direct Conversations
            </p>
            <div className="space-y-2">
              {directConversations.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 px-2">No direct chats yet.</p>
              ) : (
                directConversations.map((conversation) => (
                  <button
                    key={`direct-${conversation.id}`}
                    onClick={() => selectDirectConversation(conversation.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                      activeMode === "direct" && activeId === conversation.id
                        ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{conversation.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(conversation.lastAt)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Project Chats
            </p>
            <div className="space-y-2">
              {projectChats.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 px-2">No project chats available.</p>
              ) : (
                projectChats.map((project) => (
                  <button
                    key={`project-${project.id}`}
                    onClick={() => selectProjectChat(project.id)}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                      activeMode === "project" && activeId === project.id
                        ? "border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-900/20"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{project.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">by {project.creator_name}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </Card>
      </aside>

      <section className={`${mobileShowChat ? "col-span-12" : "hidden col-span-12 lg:block lg:col-span-8"}`}>
        <Card className="p-4 h-full flex flex-col">
          <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {activeMode === "project" ? <Users size={16} className="text-teal-500" /> : <MessageSquare size={16} className="text-blue-600" />}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{chatTitle}</h3>
              </div>

              <Button variant="neutral" className="px-3 py-1.5 text-sm" onClick={goBackToConversations}>
                <ArrowLeft size={14} />
                Back
              </Button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeMode === "project" ? "Project chat" : "Direct messages"}
            </p>
          </div>

          {error ? (
            <Card className="mt-3 p-3 border-red-200 dark:border-red-700">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </Card>
          ) : null}

          <div className="flex-1 mt-3 space-y-2 overflow-y-auto min-h-0">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading messages...</p>
            ) : !activeId ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Select a conversation to start chatting.</p>
            ) : chatMessages.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet.</p>
            ) : (
              chatMessages.map((message) => {
                const isMine = currentUserId && parseId(message.sender_id) === currentUserId;
                return (
                  <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 ${
                        isMine
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <p className="text-xs opacity-80">{message.sender || "Unknown"}</p>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-[11px] opacity-75 mt-1">{formatTimestamp(message.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-3">
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              <Button type="submit" variant="primary" disabled={sending || !draft.trim() || !activeId} className="px-3 py-2 text-sm">
                <Send size={14} />
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}



import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Send, UserRound } from "lucide-react";
import { getProfile } from "../services/api";

const MESSAGES_KEY = "mmc_messages";

const starterConversations = [
  {
    id: 101,
    full_name: "Sarah Williams",
    role: "Cinematographer",
    profile_image: "https://i.pravatar.cc/120?img=31",
  },
  {
    id: 102,
    full_name: "Michael Chen",
    role: "Actor",
    profile_image: "https://i.pravatar.cc/120?img=12",
  },
  {
    id: 103,
    full_name: "Emily Davis",
    role: "Editor",
    profile_image: "https://i.pravatar.cc/120?img=25",
  },
];

const DEFAULT_CURRENT_USER = {
  user_id: "guest-user",
  full_name: "Current User",
  role: "Creative",
};

function loadMessages() {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function formatTimestamp(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(DEFAULT_CURRENT_USER);
  const currentUserId = currentUser.user_id ?? currentUser.id ?? currentUser.full_name;

  const [messages, setMessages] = useState(loadMessages);
  const [activeConversationId, setActiveConversationId] = useState(
    starterConversations[0]?.id ?? null
  );
  const [draft, setDraft] = useState("");

  useEffect(() => {
    getProfile()
      .then((res) => {
        setCurrentUser(
          res.user ? { ...DEFAULT_CURRENT_USER, ...res.user } : DEFAULT_CURRENT_USER
        );
      })
      .catch(() => {
        setCurrentUser(DEFAULT_CURRENT_USER);
      });
  }, []);

  const conversationMap = useMemo(() => {
    const map = new Map(starterConversations.map((c) => [c.id, c]));

    messages.forEach((message) => {
      if (message.sender_id !== currentUserId && !map.has(message.sender_id)) {
        map.set(message.sender_id, {
          id: message.sender_id,
          full_name: message.sender_name || "Unknown User",
          role: "Creative",
          profile_image: `https://i.pravatar.cc/120?u=${encodeURIComponent(
            message.sender_name || String(message.sender_id)
          )}`,
        });
      }

      if (
        message.receiver_id !== currentUserId &&
        !map.has(message.receiver_id)
      ) {
        map.set(message.receiver_id, {
          id: message.receiver_id,
          full_name: message.receiver_name || "Unknown User",
          role: "Creative",
          profile_image: `https://i.pravatar.cc/120?u=${encodeURIComponent(
            message.receiver_name || String(message.receiver_id)
          )}`,
        });
      }
    });

    return map;
  }, [messages, currentUserId]);

  const conversations = useMemo(
    () => Array.from(conversationMap.values()),
    [conversationMap]
  );

  const activeConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === activeConversationId) ||
      conversations[0] ||
      null,
    [conversations, activeConversationId]
  );

  const filteredMessages = useMemo(() => {
    if (!activeConversation) return [];

    return messages.filter((message) => {
      const isOutgoing =
        message.sender_id === currentUserId &&
        message.receiver_id === activeConversation.id;
      const isIncoming =
        message.receiver_id === currentUserId &&
        message.sender_id === activeConversation.id;
      return isOutgoing || isIncoming;
    });
  }, [messages, currentUserId, activeConversation]);

  function sendMessage(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeConversation) return;

    const nextMessage = {
      id: `${currentUserId}-${activeConversation.id}-${messages.length + 1}`,
      sender: currentUser.full_name || "Current User",
      sender_id: currentUserId,
      sender_name: currentUser.full_name || "Current User",
      receiver_id: activeConversation.id,
      receiver_name: activeConversation.full_name,
      text,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, nextMessage];
    setMessages(nextMessages);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(nextMessages));
    setDraft("");
  }

  return (
    <div className="grid grid-cols-12 gap-6 min-h-[70vh]">
      <aside className="col-span-12 lg:col-span-4 rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-4">
        <h2 className="px-2 text-lg font-semibold text-slate-900 dark:text-white/90">
          Conversations
        </h2>

        <div className="mt-4 space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveConversationId(conversation.id)}
              className={`w-full text-left rounded-xl border px-3 py-3 transition ${
                activeConversation?.id === conversation.id
                  ? "border-[#1f66ff]/40 bg-[#1f66ff]/10"
                  : "border-white/10 bg-white/55 dark:bg-white/5 hover:bg-white/75 dark:hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={conversation.profile_image}
                  alt={conversation.full_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {conversation.full_name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-white/60">
                    {conversation.role}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="col-span-12 lg:col-span-8 rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-4 md:p-5 flex flex-col">
        {activeConversation ? (
          <>
            <div className="pb-4 border-b border-white/10 flex items-center gap-3">
              <img
                src={activeConversation.profile_image}
                alt={activeConversation.full_name}
                className="h-11 w-11 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {activeConversation.full_name}
                </div>
                <div className="text-xs text-slate-600 dark:text-white/60">
                  {activeConversation.role}
                </div>
              </div>
            </div>

            <div className="flex-1 py-4 space-y-3 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="h-full min-h-[260px] grid place-items-center text-center text-slate-600 dark:text-white/65">
                  <div>
                    <MessageSquare className="mx-auto mb-2 h-6 w-6 text-[#00b3c7]" />
                    No messages yet. Start the conversation.
                  </div>
                </div>
              ) : (
                filteredMessages.map((message) => {
                  const isMine = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          isMine
                            ? "bg-[#1f66ff] text-white"
                            : "bg-white/70 dark:bg-white/10 text-slate-900 dark:text-white"
                        }`}
                      >
                        <div className="text-xs opacity-80 mb-1">
                          {message.sender}
                        </div>
                        <div className="text-sm">{message.text}</div>
                        <div className="mt-1 text-[11px] opacity-75">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={sendMessage} className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/65 dark:bg-white/10 px-3 py-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#1f66ff] hover:bg-[#1b59db] text-white px-3 py-2 text-sm font-semibold"
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full min-h-[320px] grid place-items-center text-slate-600 dark:text-white/65">
            <div className="text-center">
              <UserRound className="mx-auto mb-2 h-6 w-6 text-[#00b3c7]" />
              No conversation selected.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

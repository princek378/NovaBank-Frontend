import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "../utils/api";

export default function SupportDesk() {
  const [pin, setPin] = useState(localStorage.getItem("support_pin") || "");
  const [unlocked, setUnlocked] = useState(!!localStorage.getItem("support_pin"));
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!unlocked) return;
    loadConversations();
    const t = setInterval(loadConversations, 8000);
    return () => clearInterval(t);
  }, [unlocked]);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected.id);
    const t = setInterval(() => loadMessages(selected.id), 4000);
    return () => clearInterval(t);
  }, [selected]);

  async function unlock(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${getApiUrl()}/api/chat/desk/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Wrong PIN");
      localStorage.setItem("support_pin", pin);
      setUnlocked(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadConversations() {
    try {
      const res = await fetch(
        `${getApiUrl()}/api/chat/desk/conversations?pin=${encodeURIComponent(pin || localStorage.getItem("support_pin") || "")}`
      );
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data);
    } catch (e) {
      console.log(e);
    }
  }

  async function loadMessages(userId) {
    try {
      const res = await fetch(`${getApiUrl()}/api/chat/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
      await fetch(`${getApiUrl()}/api/chat/read/${userId}`, { method: "PUT" });
    } catch (e) {
      console.log(e);
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return;
    const text = reply.trim();
    setReply("");
    try {
      await fetch(`${getApiUrl()}/api/chat/desk/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pin || localStorage.getItem("support_pin"),
          user_id: selected.id,
          message: text,
        }),
      });
      loadMessages(selected.id);
      loadConversations();
    } catch (e) {
      console.log(e);
    }
  }

  function lock() {
    localStorage.removeItem("support_pin");
    setUnlocked(false);
    setSelected(null);
    setMessages([]);
  }

  if (!unlocked) {
    return (
      <div style={s.page}>
        <Link to="/" style={s.link}>
          ← Home
        </Link>
        <div style={s.card}>
          <h1 style={s.title}>Support Desk</h1>
          <p style={s.sub}>Enter the support PIN to reply to guests (no full login).</p>
          <form onSubmit={unlock}>
            <input
              style={s.input}
              type="password"
              placeholder="Support PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            {error && <div style={s.err}>{error}</div>}
            <button style={s.btn} type="submit">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={s.title}>Support Desk</h1>
        <button style={s.lockBtn} onClick={lock}>
          Lock
        </button>
      </div>
      <div style={s.grid}>
        <div style={s.list}>
          <h3 style={{ color: "#38bdf8", marginTop: 0 }}>Conversations</h3>
          {conversations.length === 0 && (
            <p style={{ color: "#94a3b8" }}>No chats yet</p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              style={
                selected?.id === c.id
                  ? { ...s.item, ...s.itemActive }
                  : s.item
              }
              onClick={() => setSelected(c)}
            >
              <strong>{c.name}</strong>
              {c.unread > 0 && <span style={s.badge}>{c.unread}</span>}
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{c.email}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                {c.last_message?.slice(0, 40)}
              </div>
            </div>
          ))}
        </div>
        <div style={s.chat}>
          {!selected ? (
            <p style={{ color: "#94a3b8" }}>Select a conversation</p>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <strong>{selected.name}</strong>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>{selected.email}</div>
              </div>
              <div style={s.msgs}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={m.sender === "Admin" ? s.adminBubble : s.guestBubble}
                  >
                    {m.message}
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                      {m.sender} {m.time}
                    </div>
                  </div>
                ))}
              </div>
              <div style={s.replyRow}>
                <input
                  style={s.input}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                  placeholder="Reply..."
                />
                <button style={s.btn} onClick={sendReply}>
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "#f8fafc",
    fontFamily: "Inter, system-ui, sans-serif",
    padding: "24px 5%",
  },
  link: { color: "#94a3b8", textDecoration: "none" },
  card: {
    maxWidth: 400,
    margin: "60px auto",
    background: "#0f172a",
    borderRadius: 20,
    padding: 28,
    border: "1px solid rgba(148,163,184,0.2)",
  },
  title: { fontSize: 24, fontWeight: 800, margin: "0 0 8px" },
  sub: { color: "#94a3b8", marginBottom: 16 },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #334155",
    background: "#020617",
    color: "#f8fafc",
    boxSizing: "border-box",
    marginBottom: 10,
  },
  btn: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#38bdf8)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  err: {
    color: "#fca5a5",
    marginBottom: 10,
    fontSize: 14,
  },
  lockBtn: {
    background: "transparent",
    border: "1px solid #64748b",
    color: "#94a3b8",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 16,
    minHeight: 500,
  },
  list: {
    background: "#0f172a",
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(148,163,184,0.15)",
  },
  item: {
    padding: 12,
    borderRadius: 12,
    background: "#1e293b",
    marginBottom: 8,
    cursor: "pointer",
  },
  itemActive: {
    background: "linear-gradient(135deg,#2563eb,#38bdf8)",
  },
  badge: {
    marginLeft: 8,
    background: "#ef4444",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 12,
  },
  chat: {
    background: "#0f172a",
    borderRadius: 16,
    padding: 16,
    border: "1px solid rgba(148,163,184,0.15)",
    display: "flex",
    flexDirection: "column",
    minHeight: 500,
  },
  msgs: { flex: 1, overflowY: "auto", marginBottom: 12 },
  guestBubble: {
    background: "#334155",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "70%",
  },
  adminBubble: {
    background: "linear-gradient(135deg,#2563eb,#38bdf8)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "70%",
    marginLeft: "auto",
  },
  replyRow: { display: "flex", gap: 10 },
};

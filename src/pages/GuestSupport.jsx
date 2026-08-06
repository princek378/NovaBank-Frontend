import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "../utils/api";

export default function GuestSupport() {
  const [name, setName] = useState(localStorage.getItem("guest_name") || "");
  const [email, setEmail] = useState(localStorage.getItem("guest_email") || "");
  const [userId, setUserId] = useState(
    localStorage.getItem("guest_user_id")
      ? Number(localStorage.getItem("guest_user_id"))
      : null
  );
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    loadMessages();
    const t = setInterval(loadMessages, 3000);
    return () => clearInterval(t);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startChat(e) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Enter your name and email to start chatting.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/chat/guest/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not start chat");

      setUserId(data.user_id);
      localStorage.setItem("guest_user_id", String(data.user_id));
      localStorage.setItem("guest_name", data.name || name);
      localStorage.setItem("guest_email", data.email || email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    if (!userId) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/chat/${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } catch (e) {
      console.log(e);
    }
  }

  async function send() {
    if (!text.trim() || !userId) return;
    const msg = text.trim();
    setText("");
    try {
      await fetch(`${getApiUrl()}/api/chat/guest/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: msg }),
      });
      loadMessages();
    } catch (e) {
      console.log(e);
    }
  }

  function endSession() {
    localStorage.removeItem("guest_user_id");
    setUserId(null);
    setMessages([]);
  }

  // ---- Step 1: name + email ----
  if (!userId) {
    return (
      <div style={s.page}>
        <Link to="/" style={s.back}>
          ← Back to home
        </Link>
        <div style={s.card}>
          <h1 style={s.title}>💬 Live Support Chat</h1>
          <p style={s.sub}>
            No account needed. Start a live chat with NovaBank support.
          </p>
          <form onSubmit={startChat}>
            <div style={s.field}>
              <label style={s.label}>Your name</label>
              <input
                style={s.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                style={s.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>
            {error && <div style={s.err}>{error}</div>}
            <button style={s.submit} type="submit" disabled={loading}>
              {loading ? "Starting…" : "Start live chat"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- Step 2: live chat ----
  return (
    <div style={s.page}>
      <div style={s.topRow}>
        <Link to="/" style={s.back}>
          ← Home
        </Link>
        <button style={s.endBtn} onClick={endSession}>
          End chat
        </button>
      </div>

      <h1 style={s.title}>💬 Live Support</h1>
      <p style={s.sub}>
        Chatting as <strong>{name || "Guest"}</strong>
        {email ? ` (${email})` : ""}
      </p>

      <div style={s.chatBox}>
        <div style={s.messages}>
          {messages.length === 0 && (
            <p style={{ color: "#94a3b8", textAlign: "center" }}>
              Chat started. Send a message — support will reply here live.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              style={
                m.sender === "Admin" ? s.adminMsg : s.myMsg
              }
            >
              <p style={{ margin: 0 }}>{m.message}</p>
              <span style={s.meta}>
                {m.sender === "Admin" ? "Support" : "You"}
                {m.time ? ` · ${m.time}` : ""}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={s.inputRow}>
          <input
            style={s.chatInput}
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button style={s.sendBtn} onClick={send}>
            Send
          </button>
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
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  back: { color: "#94a3b8", textDecoration: "none", fontSize: 15 },
  endBtn: {
    background: "transparent",
    border: "1px solid #64748b",
    color: "#94a3b8",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
  },
  card: {
    maxWidth: 440,
    margin: "40px auto",
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 24,
    padding: 32,
  },
  title: { fontSize: 24, fontWeight: 800, margin: "0 0 8px" },
  sub: { color: "#94a3b8", marginBottom: 20 },
  field: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 6,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid rgba(148,163,184,0.25)",
    background: "rgba(2,6,23,0.7)",
    color: "#f8fafc",
    fontSize: 15,
    boxSizing: "border-box",
  },
  submit: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#38bdf8)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  err: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
  },
  chatBox: {
    maxWidth: 700,
    margin: "0 auto",
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 24,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    height: "70vh",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  myMsg: {
    alignSelf: "flex-end",
    background: "linear-gradient(135deg,#2563eb,#38bdf8)",
    color: "white",
    padding: "12px 16px",
    borderRadius: "16px 16px 4px 16px",
    maxWidth: "75%",
  },
  adminMsg: {
    alignSelf: "flex-start",
    background: "rgba(30,41,59,0.9)",
    color: "#e2e8f0",
    padding: "12px 16px",
    borderRadius: "16px 16px 16px 4px",
    maxWidth: "75%",
    border: "1px solid rgba(148,163,184,0.15)",
  },
  meta: { display: "block", fontSize: 11, opacity: 0.75, marginTop: 6 },
  inputRow: {
    display: "flex",
    gap: 10,
    padding: 16,
    borderTop: "1px solid rgba(148,163,184,0.12)",
  },
  chatInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    border: "1.5px solid rgba(148,163,184,0.25)",
    background: "rgba(2,6,23,0.7)",
    color: "#f8fafc",
    fontSize: 15,
  },
  sendBtn: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#38bdf8)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
};

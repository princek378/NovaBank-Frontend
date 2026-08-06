import { useState } from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "../utils/api";

export default function GuestSupport() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function send(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setOk(false);
      setStatus("Please fill in name, email and message.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch(`${getApiUrl()}/api/chat/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send");
      setOk(true);
      setStatus("Message sent. Our support team will reply by email or when you create an account.");
      setMessage("");
    } catch (err) {
      setOk(false);
      setStatus(err.message || "Could not send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <Link to="/" style={s.back}>
        ← Back to home
      </Link>
      <div style={s.card}>
        <h1 style={s.title}>Contact Support</h1>
        <p style={s.sub}>
          You do not need an account. Send a message and our team will help you.
        </p>
        <form onSubmit={send}>
          <div style={s.field}>
            <label style={s.label}>Your name</label>
            <input style={s.input} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Message</label>
            <textarea
              style={{ ...s.input, minHeight: 120, resize: "vertical" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
            />
          </div>
          <button style={s.submit} type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
        {status && (
          <div style={ok ? s.msgOk : s.msgErr}>{status}</div>
        )}
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
    padding: "32px 5%",
  },
  back: {
    display: "inline-block",
    color: "#94a3b8",
    textDecoration: "none",
    marginBottom: 24,
    fontSize: 15,
  },
  card: {
    maxWidth: 480,
    margin: "0 auto",
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 24,
    padding: 32,
  },
  title: { fontSize: 26, fontWeight: 800, margin: "0 0 8px" },
  sub: { color: "#94a3b8", marginBottom: 24 },
  field: { marginBottom: 18 },
  label: {
    display: "block",
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 8,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid rgba(148,163,184,0.25)",
    background: "rgba(2,6,23,0.7)",
    color: "#f8fafc",
    fontSize: 16,
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
    fontSize: 16,
    cursor: "pointer",
    marginTop: 8,
  },
  msgOk: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    background: "rgba(34,197,94,0.15)",
    color: "#86efac",
    textAlign: "center",
  },
  msgErr: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    background: "rgba(239,68,68,0.15)",
    color: "#fca5a5",
    textAlign: "center",
  },
};

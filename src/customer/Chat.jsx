import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";

export default function Chat() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!customer?.id) return;
    const t = setInterval(() => loadMessages(customer.id, false), 5000);
    return () => clearInterval(t);
  }, [customer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${getApiUrl()}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCustomer(data);
      loadMessages(data.id);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  }

  async function loadMessages(id, showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/chat/${id}`);
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!message.trim() || !customer) return;
    const text = message.trim();
    setMessage("");
    try {
      await fetch(`${getApiUrl()}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: customer.id,
          sender: "Customer",
          message: text,
        }),
      });
      loadMessages(customer.id, false);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate("/customer/dashboard")}>
        ← Back to dashboard
      </button>
      <h1 style={s.title}>💬 NovaBank Support</h1>

      <div style={s.container}>
        <div style={s.messages}>
          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>No conversation yet. Send us a message.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={msg.sender === "Customer" ? s.myMsg : s.adminMsg}
              >
                <p style={{ margin: 0 }}>{msg.message}</p>
                <span style={s.msgMeta}>{msg.sender}</span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div style={s.inputRow}>
          <input
            style={s.input}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button style={s.sendBtn} onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#020617", color: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", padding: "24px 5%" },
  back: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", marginBottom: 16, fontSize: 15 },
  title: { fontSize: 24, fontWeight: 800, color: "#f8fafc", marginBottom: 20 },
  container: { maxWidth: 700, margin: "0 auto", background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", height: "70vh" },
  messages: { flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 },
  myMsg: { alignSelf: "flex-end", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "white", padding: "12px 16px", borderRadius: "16px 16px 4px 16px", maxWidth: "75%" },
  adminMsg: { alignSelf: "flex-start", background: "rgba(30,41,59,0.9)", color: "#e2e8f0", padding: "12px 16px", borderRadius: "16px 16px 16px 4px", maxWidth: "75%", border: "1px solid rgba(148,163,184,0.15)" },
  msgMeta: { display: "block", fontSize: 11, opacity: 0.75, marginTop: 6 },
  inputRow: { display: "flex", gap: 10, padding: 16, borderTop: "1px solid rgba(148,163,184,0.12)" },
  input: { flex: 1, padding: "12px 16px", borderRadius: 12, border: "1.5px solid rgba(148,163,184,0.25)", background: "rgba(2,6,23,0.7)", color: "#f8fafc", fontSize: 15 },
  sendBtn: { padding: "12px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "white", fontWeight: 700, cursor: "pointer" },
};

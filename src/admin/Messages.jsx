import { useEffect, useState } from "react";
import { getApiUrl } from "../utils/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Messages() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadByUser, setUnreadByUser] = useState({});

  useEffect(() => {
    loadUsers();
    const t = setInterval(loadUsers, 15000);
    return () => clearInterval(t);
  }, []);

  async function loadUsers() {
    try {
      const response = await fetch(`${getApiUrl()}/api/admin/customers`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
    }
  }

  async function markRead(userId) {
    try {
      await fetch(`${getApiUrl()}/api/chat/read/${userId}`, { method: "PUT" });
    } catch (error) {
      console.log(error);
    }
  }

  async function loadMessages(user) {
    setSelectedUser(user.id);
    setSelectedCustomer(user);
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/chat/${user.id}`);
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
      await markRead(user.id);
      setUnreadByUser((prev) => ({ ...prev, [user.id]: 0 }));
    } catch (error) {
      console.log(error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selectedUser) return;
    try {
      await fetch(`${getApiUrl()}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedUser,
          sender: "Admin",
          message: reply,
        }),
      });
      setReply("");
      if (selectedCustomer) loadMessages(selectedCustomer);
    } catch (error) {
      console.log(error);
      alert("Failed to send reply");
    }
  }

  return (
    <div style={s.layout}>
      <Sidebar />

      <div style={s.main}>
        <Topbar />

        <h1 style={s.pageTitle}>Customer Messages</h1>

        <div style={s.grid}>
          {/* Customer list */}
          <div style={s.panel}>
            <h2 style={s.panelTitle}>Customers</h2>
            {users.length === 0 ? (
              <p style={{ color: "#94a3b8", padding: 12 }}>No customers yet</p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  style={
                    selectedUser === user.id
                      ? { ...s.customerItem, ...s.customerActive }
                      : s.customerItem
                  }
                  onClick={() => loadMessages(user)}
                >
                  <h3 style={{ margin: 0, fontSize: 16, color: "#f8fafc" }}>
                    {user.name}
                    {unreadByUser[user.id] > 0 ? (
                      <span style={s.badge}>{unreadByUser[user.id]}</span>
                    ) : null}
                  </h3>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "#94a3b8" }}>
                    {user.email}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Conversation */}
          <div style={s.conversation}>
            {selectedUser ? (
              <>
                <div style={s.chatHeader}>
                  <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 20 }}>
                    {selectedCustomer?.name}
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 14 }}>
                    Customer conversation
                  </p>
                </div>

                <div style={s.conversationBox}>
                  {loading ? (
                    <p style={{ color: "#94a3b8" }}>Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p style={{ color: "#94a3b8" }}>No messages yet</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        style={
                          msg.sender === "Admin" ? s.adminMsg : s.customerMsg
                        }
                      >
                        <p style={{ margin: 0, fontSize: 15 }}>{msg.message}</p>
                        <span style={s.msgMeta}>
                          {msg.sender}
                          {msg.time ? ` · ${msg.time}` : ""}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div style={s.replyBox}>
                  <input
                    style={s.replyInput}
                    placeholder="Reply to customer..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendReply();
                    }}
                  />
                  <button style={s.sendBtn} onClick={sendReply}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div style={s.empty}>
                <h2 style={{ color: "#94a3b8", fontWeight: 600 }}>
                  Select a customer to view messages
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#020617",
    color: "#f8fafc",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  main: {
    flex: 1,
    padding: "20px 28px",
    overflowX: "hidden",
    width: "100%",
  },
  pageTitle: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: 800,
    margin: "16px 0 20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 20,
    minHeight: 580,
  },
  panel: {
    background: "linear-gradient(145deg, #0f172a, #1e293b)",
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
  },
  panelTitle: {
    color: "#38bdf8",
    marginBottom: 16,
    fontSize: 18,
  },
  customerItem: {
    padding: 15,
    borderRadius: 14,
    background: "#172554",
    marginBottom: 12,
    cursor: "pointer",
    color: "white",
  },
  customerActive: {
    background: "linear-gradient(135deg, #2563eb, #38bdf8)",
  },
  badge: {
    marginLeft: 8,
    background: "#ef4444",
    color: "white",
    borderRadius: 999,
    padding: "2px 8px",
    fontSize: 12,
  },
  conversation: {
    display: "flex",
    flexDirection: "column",
    height: 620,
    background: "linear-gradient(145deg, #0f172a, #1e293b)",
    borderRadius: 20,
    padding: 20,
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 15px 30px rgba(0,0,0,0.3)",
  },
  chatHeader: {
    paddingBottom: 15,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  conversationBox: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 5px",
  },
  customerMsg: {
    maxWidth: "65%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 15,
    color: "white",
    background: "#334155",
    borderBottomLeftRadius: 5,
  },
  adminMsg: {
    maxWidth: "65%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 15,
    color: "white",
    background: "linear-gradient(135deg, #2563eb, #38bdf8)",
    marginLeft: "auto",
    borderBottomRightRadius: 5,
  },
  msgMeta: {
    display: "block",
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
  },
  replyBox: {
    display: "flex",
    gap: 12,
    paddingTop: 15,
  },
  replyInput: {
    flex: 1,
    padding: 15,
    borderRadius: 14,
    border: "1.5px solid rgba(148,163,184,0.25)",
    outline: "none",
    background: "#020617",
    color: "white",
    fontSize: 15,
  },
  sendBtn: {
    background: "linear-gradient(135deg, #2563eb, #38bdf8)",
    color: "white",
    border: "none",
    padding: "0 28px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
  },
  empty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
};

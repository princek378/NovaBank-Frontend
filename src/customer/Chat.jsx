import { useEffect, useState, useRef } from "react";
import { getApiUrl } from "../utils/api";
import "./Chat.css";

export default function Chat() {
  const [customer, setCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    if (!customer?.id) return;

    const interval = setInterval(() => {
      loadMessages(customer.id, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [customer]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${getApiUrl()}/api/customer/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setCustomer(data);
      loadMessages(data.id);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function loadMessages(id, showLoading = true) {
    if (showLoading) setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/chat/${id}`);
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: customer.id,
          sender: "Customer",
          message: text,
        }),
      });

      // Reload messages after sending
      loadMessages(customer.id, false);
    } catch (error) {
      console.log(error);
      alert("Failed to send message");
    }
  }

  return (
    <div className="customer-chat">
      <h1>💬 NovaBank Support</h1>

      <div className="chat-container">
        <div className="chat-messages">
          {loading ? (
            <h3>Loading messages...</h3>
          ) : messages.length === 0 ? (
            <p>No conversation yet. Send us a message.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.sender === "Customer" ? "my-message" : "admin-message"
                }
              >
                <p>{msg.message}</p>
                <span>
                  {msg.sender}
                  {msg.time ? ` · ${msg.time}` : ""}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input">
          <input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

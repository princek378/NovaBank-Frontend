import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getApiUrl } from "../utils/api";

export default function Settings() {
  const [settings, setSettings] = useState({
    admin_name: "",
    email: "",
    bank_name: "",
    currency: "",
    imf_code: "IMF-0000",
    cot_code: "COT-0000",
    require_imf: true,
    require_cot: true,
  });
  const [creds, setCreds] = useState({
    name: "",
    email: "",
    current_password: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [credMessage, setCredMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch(`${getApiUrl()}/api/settings`);
      const data = await response.json();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.log(error);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  function handleCredChange(e) {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  }

  async function saveSettings() {
    try {
      const response = await fetch(`${getApiUrl()}/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      setMessage(data.message || "Settings saved");
    } catch {
      setMessage("Failed to save settings");
    }
  }

  async function saveCredentials(e) {
    e.preventDefault();
    setCredMessage("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${getApiUrl()}/api/admin/change-credentials`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(creds),
      });
      const data = await response.json();
      if (!response.ok) {
        setCredMessage(data.message || "Failed to update credentials");
        return;
      }
      setCredMessage("Credentials updated successfully.");
      setCreds({ name: "", email: "", current_password: "", password: "" });
    } catch {
      setCredMessage("Server error while updating credentials");
    }
  }

  const card = {
    background: "rgba(15,23,42,.85)",
    padding: 28,
    borderRadius: 20,
    marginBottom: 28,
  };
  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,0.3)",
    background: "#0f172a",
    color: "#f8fafc",
    marginBottom: 12,
    boxSizing: "border-box",
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <h1>⚙️ Bank Settings</h1>
          <p style={{ color: "#94a3b8" }}>Bank identity, IMF/COT codes, and admin login</p>
        </div>

        <div style={card}>
          <h2 style={{ marginBottom: 16 }}>General</h2>
          <div style={{ maxWidth: 420 }}>
            <input name="admin_name" placeholder="Admin display name" value={settings.admin_name || ""} onChange={handleChange} style={input} />
            <input name="email" placeholder="Contact email" value={settings.email || ""} onChange={handleChange} style={input} />
            <input name="bank_name" placeholder="Bank name" value={settings.bank_name || ""} onChange={handleChange} style={input} />
            <input name="currency" placeholder="Currency" value={settings.currency || ""} onChange={handleChange} style={input} />
          </div>
        </div>

        <div style={card}>
          <h2 style={{ marginBottom: 8 }}>Transfer security (IMF / COT)</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>
            Customers must enter these codes when transferring (if enabled). Turn off for faster transfers.
          </p>
          <div style={{ maxWidth: 420 }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>IMF code (shown to admin only)</label>
            <input name="imf_code" value={settings.imf_code || ""} onChange={handleChange} style={input} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#e2e8f0" }}>
              <input type="checkbox" name="require_imf" checked={!!settings.require_imf} onChange={handleChange} />
              Require IMF code on transfers
            </label>

            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>COT code (shown to admin only)</label>
            <input name="cot_code" value={settings.cot_code || ""} onChange={handleChange} style={input} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#e2e8f0" }}>
              <input type="checkbox" name="require_cot" checked={!!settings.require_cot} onChange={handleChange} />
              Require COT code on transfers
            </label>

            <button onClick={saveSettings} className="btn btn-primary" style={{ maxWidth: 180, padding: "12px 18px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Save Settings
            </button>
            {message && <p style={{ color: "#86efac", marginTop: 12 }}>{message}</p>}
          </div>
        </div>

        <div style={card}>
          <h2 style={{ marginBottom: 8 }}>Change Admin Login</h2>
          <form onSubmit={saveCredentials} style={{ maxWidth: 420 }}>
            <input name="name" placeholder="New display name (optional)" value={creds.name} onChange={handleCredChange} style={input} />
            <input name="email" type="email" placeholder="New login email (optional)" value={creds.email} onChange={handleCredChange} style={input} />
            <input name="current_password" type="password" placeholder="Current password (required)" value={creds.current_password} onChange={handleCredChange} required style={input} />
            <input name="password" type="password" placeholder="New password (optional)" value={creds.password} onChange={handleCredChange} style={input} />
            <button type="submit" style={{ maxWidth: 220, padding: "12px 18px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Update Credentials
            </button>
            {credMessage && (
              <p style={{ color: credMessage.includes("success") ? "#86efac" : "#fca5a5", marginTop: 12 }}>
                {credMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";

export default function Withdraw() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function withdrawMoney() {
    if (!amount || Number(amount) <= 0) {
      setOk(false);
      setMessage("Enter a valid amount");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${getApiUrl()}/api/transactions/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          account_number: localStorage.getItem("account_number"),
          amount: amount,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setOk(true);
        setMessage(data.message || "Withdrawal successful");
        setAmount("");
      } else {
        setOk(false);
        setMessage(data.message || "Withdrawal failed");
      }
    } catch {
      setOk(false);
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate("/customer/dashboard")}>
        ← Back to dashboard
      </button>
      <div style={s.card}>
        <h1 style={s.title}>Withdraw money</h1>
        <p style={s.sub}>Take funds out of your NovaBank account</p>
        <div style={s.field}>
          <label style={s.label}>Amount (USD)</label>
          <input
            style={s.input}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button style={s.submit} onClick={withdrawMoney} disabled={loading}>
          {loading ? "Processing…" : "Withdraw"}
        </button>
        {message && (
          <div style={ok ? s.msgOk : s.msgErr}>{message}</div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#020617", color: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", padding: "32px 5%" },
  back: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", marginBottom: 24, fontSize: 15 },
  card: { maxWidth: 440, margin: "0 auto", background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 24, padding: 32 },
  title: { fontSize: 26, fontWeight: 800, color: "#f8fafc", margin: "0 0 8px" },
  sub: { color: "#94a3b8", marginBottom: 24 },
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 600 },
  input: { width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid rgba(148,163,184,0.25)", background: "rgba(2,6,23,0.7)", color: "#f8fafc", fontSize: 16, boxSizing: "border-box" },
  submit: { width: "100%", padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer", marginTop: 8 },
  msgOk: { marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.15)", color: "#86efac", textAlign: "center" },
  msgErr: { marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(239,68,68,0.15)", color: "#fca5a5", textAlign: "center" },
};

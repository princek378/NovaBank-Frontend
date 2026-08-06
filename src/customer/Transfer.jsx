import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Nigeria", "Ghana", "Kenya",
  "South Africa", "India", "China", "Japan", "Germany", "France", "Italy",
  "Spain", "Netherlands", "UAE", "Saudi Arabia", "Australia", "Brazil",
  "Mexico", "Philippines", "Singapore", "Malaysia", "Other",
];

export default function Transfer() {
  const navigate = useNavigate();
  const [step, setStep] = useState("type"); // type | form | codes | receipt
  const [transferType, setTransferType] = useState("");
  const [myAccount, setMyAccount] = useState(localStorage.getItem("account_number") || "");
  const [rules, setRules] = useState({ require_imf: true, require_cot: true });
  const [receiver, setReceiver] = useState("");
  const [country, setCountry] = useState("");
  const [bankName, setBankName] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [imf, setImf] = useState("");
  const [cot, setCot] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await fetch(`${getApiUrl()}/api/customer/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.account?.account_number) {
            setMyAccount(data.account.account_number);
            localStorage.setItem("account_number", data.account.account_number);
          }
        }
        const r = await fetch(`${getApiUrl()}/api/settings/transfer-rules`);
        if (r.ok) {
          const rulesData = await r.json();
          setRules({
            require_imf: !!rulesData.require_imf,
            require_cot: !!rulesData.require_cot,
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
    load();
  }, []);

  function goToCodes() {
    setMessage("");
    if (!myAccount) {
      setOk(false);
      setMessage("Account not found. Please log in again.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setOk(false);
      setMessage("Enter a valid amount");
      return;
    }
    if (transferType === "local") {
      if (!receiver) {
        setOk(false);
        setMessage("Enter receiver NovaBank account number");
        return;
      }
      // Local: go to codes if required, else transfer now
      if (rules.require_imf || rules.require_cot) {
        setStep("codes");
      } else {
        makeTransfer();
      }
      return;
    }
    // International
    if (!country) {
      setOk(false);
      setMessage("Select a country");
      return;
    }
    if (!bankName.trim()) {
      setOk(false);
      setMessage("Enter the bank name");
      return;
    }
    if (!receiver) {
      setOk(false);
      setMessage("Enter beneficiary account number");
      return;
    }
    if (rules.require_imf || rules.require_cot) {
      setStep("codes");
    } else {
      makeTransfer();
    }
  }

  async function makeTransfer() {
    if (rules.require_imf && !imf.trim()) {
      setOk(false);
      setMessage("IMF code is required");
      return;
    }
    if (rules.require_cot && !cot.trim()) {
      setOk(false);
      setMessage("COT code is required");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const bankLabel =
        transferType === "international"
          ? `${bankName.trim()}${country ? ` (${country})` : ""}`
          : "NovaBank";

      const response = await fetch(`${getApiUrl()}/api/transactions/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          from_account: myAccount,
          to_account: receiver,
          amount,
          transfer_type: transferType,
          bank_name: bankLabel,
          beneficiary_name: beneficiary,
          imf_code: imf,
          cot_code: cot,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setOk(true);
        setReceipt(data);
        setStep("receipt");
      } else {
        setOk(false);
        setMessage(data.message || data.error || "Transfer failed");
      }
    } catch {
      setOk(false);
      setMessage("Cannot reach server");
    } finally {
      setLoading(false);
    }
  }

  function downloadPdf() {
    if (!receipt) return;
    const win = window.open("", "_blank");
    const html = `<!DOCTYPE html><html><head><title>Receipt ${receipt.reference}</title>
<style>body{font-family:Arial;padding:40px}.box{max-width:480px;margin:auto;border:1px solid #ccc;padding:28px;border-radius:12px}
h1{font-size:22px}.ok{color:#16a34a;font-weight:700}table{width:100%;margin-top:16px}td{padding:8px 0;border-bottom:1px solid #eee}
td:last-child{text-align:right;font-weight:600}</style></head><body>
<div class="box"><h1>NovaBank Transfer Receipt</h1>
<p class="ok">✓ ${receipt.status || "Completed"}</p>
<table>
<tr><td>Reference</td><td>${receipt.reference || ""}</td></tr>
<tr><td>Type</td><td>${receipt.transfer_type === "local" ? "Local" : "International"}</td></tr>
<tr><td>From</td><td>${receipt.from_account || ""}</td></tr>
<tr><td>To</td><td>${receipt.to_account || ""}</td></tr>
${receipt.bank_name ? `<tr><td>Bank</td><td>${receipt.bank_name}</td></tr>` : ""}
<tr><td>Amount</td><td>$${Number(receipt.amount || 0).toLocaleString(undefined,{minimumFractionDigits:2})}</td></tr>
</table>
<p style="text-align:center;font-size:12px;color:#666;margin-top:20px">Print → Save as PDF</p>
</div><script>window.onload=function(){window.print()}</script></body></html>`;
    win.document.write(html);
    win.document.close();
  }

  if (step === "type") {
    return (
      <div style={s.page}>
        <button style={s.back} onClick={() => navigate("/customer/dashboard")}>← Back</button>
        <div style={s.card}>
          <h1 style={s.title}>Transfer money</h1>
          <p style={s.sub}>From: <strong>{myAccount || "Loading…"}</strong></p>
          <button style={s.choice} onClick={() => { setTransferType("local"); setStep("form"); }}>
            <strong>Local transfer</strong>
            <span style={s.choiceSub}>Between NovaBank customers</span>
          </button>
          <button style={s.choice} onClick={() => { setTransferType("international"); setStep("form"); }}>
            <strong>International transfer</strong>
            <span style={s.choiceSub}>Send to a bank in any country</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === "codes") {
    return (
      <div style={s.page}>
        <button style={s.back} onClick={() => setStep("form")}>← Back to details</button>
        <div style={s.card}>
          <h1 style={s.title}>Security verification</h1>
          <p style={s.sub}>
            Enter your IMF and COT codes to complete this transfer of{" "}
            <strong>${Number(amount).toLocaleString()}</strong>
          </p>

          {rules.require_imf && (
            <div style={s.field}>
              <label style={s.label}>IMF code *</label>
              <input
                style={s.input}
                value={imf}
                onChange={(e) => setImf(e.target.value)}
                placeholder="Enter IMF code"
              />
            </div>
          )}
          {rules.require_cot && (
            <div style={s.field}>
              <label style={s.label}>COT code *</label>
              <input
                style={s.input}
                value={cot}
                onChange={(e) => setCot(e.target.value)}
                placeholder="Enter COT code"
              />
            </div>
          )}

          <button
            type="button"
            style={s.linkBtn}
            onClick={() => navigate("/customer/chat")}
          >
            Request IMF / COT code from support (live chat)
          </button>

          <button style={s.submit} onClick={makeTransfer} disabled={loading}>
            {loading ? "Processing…" : "Complete transfer"}
          </button>
          {message && <div style={ok ? s.msgOk : s.msgErr}>{message}</div>}
        </div>
      </div>
    );
  }

  if (step === "receipt" && receipt) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, color: "#22c55e" }}>✓</div>
            <h1 style={s.title}>Transfer successful</h1>
          </div>
          <Row label="Reference" value={receipt.reference} />
          <Row label="Type" value={receipt.transfer_type === "local" ? "Local" : "International"} />
          <Row label="From" value={receipt.from_account} />
          <Row label="To" value={receipt.to_account} />
          {receipt.bank_name && <Row label="Bank" value={receipt.bank_name} />}
          <Row
            label="Amount"
            value={`$${Number(receipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          />
          <Row label="Status" value={receipt.status || "Completed"} />
          <button style={{ ...s.submit, marginTop: 16 }} onClick={downloadPdf}>
            Download receipt (PDF)
          </button>
          <button
            style={{ ...s.submit, background: "transparent", border: "1px solid #64748b", marginTop: 10 }}
            onClick={() => navigate("/customer/dashboard")}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  // form step
  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => setStep("type")}>← Change type</button>
      <div style={s.card}>
        <h1 style={s.title}>
          {transferType === "local" ? "Local transfer" : "International transfer"}
        </h1>
        <p style={s.sub}>From: <strong>{myAccount || "…"}</strong></p>

        {transferType === "international" && (
          <>
            <div style={s.field}>
              <label style={s.label}>Country *</label>
              <select style={s.input} value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Bank name *</label>
              <input
                style={s.input}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Type the bank name"
              />
            </div>
          </>
        )}

        <div style={s.field}>
          <label style={s.label}>
            {transferType === "local" ? "Receiver NovaBank account *" : "Account number *"}
          </label>
          <input
            style={s.input}
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder={transferType === "local" ? "NB1234567890" : "Beneficiary account number"}
          />
        </div>

        {transferType === "international" && (
          <div style={s.field}>
            <label style={s.label}>Beneficiary name (optional)</label>
            <input
              style={s.input}
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
            />
          </div>
        )}

        <div style={s.field}>
          <label style={s.label}>Amount (USD) *</label>
          <input
            style={s.input}
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <button style={s.submit} onClick={goToCodes} disabled={loading}>
          Continue
        </button>
        {message && <div style={ok ? s.msgOk : s.msgErr}>{message}</div>}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid rgba(148,163,184,0.15)",
      }}
    >
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
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
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    marginBottom: 24,
    fontSize: 15,
  },
  card: {
    maxWidth: 460,
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
  linkBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(56,189,248,0.5)",
    background: "rgba(56,189,248,0.1)",
    color: "#7dd3fc",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    marginBottom: 12,
  },
  choice: {
    width: "100%",
    textAlign: "left",
    padding: 18,
    marginBottom: 12,
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.25)",
    background: "rgba(2,6,23,0.6)",
    color: "#f8fafc",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  choiceSub: { fontSize: 13, color: "#94a3b8", fontWeight: 400 },
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

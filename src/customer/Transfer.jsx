import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";

const BANKS = [
  "PayPal", "Opay", "eBay", "Cash App", "Venmo", "Zelle", "Wise", "Western Union",
  "MoneyGram", "Chase", "Bank of America", "Wells Fargo", "Citi", "Capital One",
  "TD Bank", "HSBC", "Barclays", "Revolut", "Alipay", "WeChat Pay", "GTBank",
  "Access Bank", "Zenith Bank", "First Bank", "UBA", "Kuda", "PalmPay", "Chipper Cash",
  "Other Bank / Wallet",
];

export default function Transfer() {
  const navigate = useNavigate();
  const [step, setStep] = useState("type"); // type | form | receipt
  const [transferType, setTransferType] = useState(""); // local | international
  const [rules, setRules] = useState({ require_imf: true, require_cot: true });
  const [receiver, setReceiver] = useState("");
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
    fetch(`${getApiUrl()}/api/settings/transfer-rules`)
      .then((r) => r.json())
      .then(setRules)
      .catch(() => {});
  }, []);

  async function makeTransfer() {
    if (!amount || Number(amount) <= 0) {
      setOk(false);
      setMessage("Enter a valid amount");
      return;
    }
    if (transferType === "local" && !receiver) {
      setOk(false);
      setMessage("Enter receiver NovaBank account number");
      return;
    }
    if (transferType === "international") {
      if (!bankName) {
        setOk(false);
        setMessage("Select a bank / payment service");
        return;
      }
      if (!receiver) {
        setOk(false);
        setMessage("Enter beneficiary account or wallet ID");
        return;
      }
    }
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
      const response = await fetch(`${getApiUrl()}/api/transactions/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          from_account: localStorage.getItem("account_number"),
          to_account: receiver,
          amount,
          transfer_type: transferType,
          bank_name: bankName,
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
        setMessage(data.message || "Transfer failed");
      }
    } catch {
      setOk(false);
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  }

  function downloadPdf() {
    if (!receipt) return;
    const win = window.open("", "_blank");
    const html = `
<!DOCTYPE html><html><head><title>Transfer Receipt ${receipt.reference}</title>
<style>
  body{font-family:Arial,sans-serif;padding:40px;color:#0f172a}
  .box{max-width:480px;margin:0 auto;border:1px solid #cbd5e1;border-radius:12px;padding:28px}
  h1{font-size:22px;margin:0 0 8px}
  .ok{color:#16a34a;font-weight:700}
  table{width:100%;margin-top:20px;border-collapse:collapse}
  td{padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:14px}
  td:last-child{text-align:right;font-weight:600}
  .foot{margin-top:24px;font-size:12px;color:#64748b;text-align:center}
</style></head><body>
<div class="box">
  <h1>NovaBank Transfer Receipt</h1>
  <p class="ok">✓ ${receipt.status || "Completed"} — Transfer successful</p>
  <table>
    <tr><td>Reference</td><td>${receipt.reference || ""}</td></tr>
    <tr><td>Type</td><td>${receipt.transfer_type === "local" ? "Local (NovaBank)" : "International"}</td></tr>
    <tr><td>From</td><td>${receipt.from_account || ""}</td></tr>
    <tr><td>To</td><td>${receipt.to_account || ""}</td></tr>
    ${receipt.bank_name ? `<tr><td>Bank / Service</td><td>${receipt.bank_name}</td></tr>` : ""}
    ${receipt.beneficiary_name ? `<tr><td>Beneficiary</td><td>${receipt.beneficiary_name}</td></tr>` : ""}
    <tr><td>Amount</td><td>$${Number(receipt.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
    <tr><td>Date</td><td>${receipt.date ? new Date(receipt.date).toLocaleString() : new Date().toLocaleString()}</td></tr>
    <tr><td>Sender</td><td>${receipt.sender_name || ""}</td></tr>
  </table>
  <p class="foot">NovaBank · Keep this receipt for your records<br/>Use Print → Save as PDF to download</p>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
    win.document.write(html);
    win.document.close();
  }

  if (step === "type") {
    return (
      <div style={s.page}>
        <button style={s.back} onClick={() => navigate("/customer/dashboard")}>← Back</button>
        <div style={s.card}>
          <h1 style={s.title}>Transfer money</h1>
          <p style={s.sub}>Choose transfer type</p>
          <button
            style={s.choice}
            onClick={() => { setTransferType("local"); setStep("form"); }}
          >
            <strong>Local transfer</strong>
            <span style={s.choiceSub}>Between NovaBank customers</span>
          </button>
          <button
            style={s.choice}
            onClick={() => { setTransferType("international"); setStep("form"); }}
          >
            <strong>International transfer</strong>
            <span style={s.choiceSub}>PayPal, Opay, banks & wallets worldwide</span>
          </button>
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
            <p style={s.sub}>Your transfer has been completed</p>
          </div>
          <div style={s.receiptBox}>
            <Row label="Reference" value={receipt.reference} />
            <Row label="Type" value={receipt.transfer_type === "local" ? "Local (NovaBank)" : "International"} />
            <Row label="From" value={receipt.from_account} />
            <Row label="To" value={receipt.to_account} />
            {receipt.bank_name && <Row label="Bank / Service" value={receipt.bank_name} />}
            {receipt.beneficiary_name && <Row label="Beneficiary" value={receipt.beneficiary_name} />}
            <Row label="Amount" value={`$${Number(receipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
            <Row label="Date" value={receipt.date ? new Date(receipt.date).toLocaleString() : "—"} />
            <Row label="Status" value={receipt.status || "Completed"} />
          </div>
          <button style={s.submit} onClick={downloadPdf}>Download receipt (PDF)</button>
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

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => setStep("type")}>← Change type</button>
      <div style={s.card}>
        <h1 style={s.title}>
          {transferType === "local" ? "Local transfer" : "International transfer"}
        </h1>
        <p style={s.sub}>
          {transferType === "local"
            ? "Send to another NovaBank account"
            : "Send to external bank or wallet"}
        </p>

        {transferType === "international" && (
          <div style={s.field}>
            <label style={s.label}>Bank / payment service</label>
            <select style={s.input} value={bankName} onChange={(e) => setBankName(e.target.value)}>
              <option value="">Select bank or service</option>
              {BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        )}

        <div style={s.field}>
          <label style={s.label}>
            {transferType === "local" ? "Receiver NovaBank account" : "Account / wallet ID"}
          </label>
          <input
            style={s.input}
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder={transferType === "local" ? "NB1234567890" : "Account number or email"}
          />
        </div>

        {transferType === "international" && (
          <div style={s.field}>
            <label style={s.label}>Beneficiary name (optional)</label>
            <input style={s.input} value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} />
          </div>
        )}

        <div style={s.field}>
          <label style={s.label}>Amount (USD)</label>
          <input style={s.input} type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        {rules.require_imf && (
          <div style={s.field}>
            <label style={s.label}>IMF code</label>
            <input style={s.input} value={imf} onChange={(e) => setImf(e.target.value)} placeholder="Enter IMF code" />
          </div>
        )}
        {rules.require_cot && (
          <div style={s.field}>
            <label style={s.label}>COT code</label>
            <input style={s.input} value={cot} onChange={(e) => setCot(e.target.value)} placeholder="Enter COT code" />
          </div>
        )}

        <button style={s.submit} onClick={makeTransfer} disabled={loading}>
          {loading ? "Processing…" : "Confirm transfer"}
        </button>
        {message && <div style={ok ? s.msgOk : s.msgErr}>{message}</div>}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(148,163,184,0.15)" }}>
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "#020617", color: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif", padding: "32px 5%" },
  back: { background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", marginBottom: 24, fontSize: 15 },
  card: { maxWidth: 460, margin: "0 auto", background: "rgba(15,23,42,0.95)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 24, padding: 32 },
  title: { fontSize: 26, fontWeight: 800, color: "#f8fafc", margin: "0 0 8px" },
  sub: { color: "#94a3b8", marginBottom: 24 },
  field: { marginBottom: 18 },
  label: { display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 600 },
  input: { width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.5px solid rgba(148,163,184,0.25)", background: "rgba(2,6,23,0.7)", color: "#f8fafc", fontSize: 16, boxSizing: "border-box" },
  submit: { width: "100%", padding: 14, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2563eb,#38bdf8)", color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer", marginTop: 8 },
  choice: { width: "100%", textAlign: "left", padding: 18, marginBottom: 12, borderRadius: 14, border: "1px solid rgba(148,163,184,0.25)", background: "rgba(2,6,23,0.6)", color: "#f8fafc", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 },
  choiceSub: { fontSize: 13, color: "#94a3b8", fontWeight: 400 },
  receiptBox: { marginBottom: 20 },
  msgOk: { marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.15)", color: "#86efac", textAlign: "center" },
  msgErr: { marginTop: 16, padding: 12, borderRadius: 10, background: "rgba(239,68,68,0.15)", color: "#fca5a5", textAlign: "center" },
};

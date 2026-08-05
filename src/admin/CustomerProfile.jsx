import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const s = {
  layout: { display: "flex", minHeight: "100vh", background: "#020617", color: "#f8fafc" },
  main: { flex: 1, padding: "20px 24px", overflowX: "auto" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  sub: { color: "#94a3b8", marginBottom: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 },
  card: {
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 12,
    padding: 16,
  },
  h2: { fontSize: 16, marginBottom: 12, color: "#38bdf8" },
  label: { display: "block", fontSize: 12, color: "#94a3b8", marginBottom: 4 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(148,163,184,0.3)",
    background: "#0f172a",
    color: "#f8fafc",
    marginBottom: 10,
    boxSizing: "border-box",
  },
  btn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    marginRight: 8,
    marginTop: 6,
  },
  primary: { background: "#2563eb", color: "#fff" },
  success: { background: "#16a34a", color: "#fff" },
  danger: { background: "#dc2626", color: "#fff" },
  warn: { background: "#ca8a04", color: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 },
  th: { textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #334155", color: "#94a3b8" },
  td: { padding: "8px 6px", borderBottom: "1px solid #1e293b" },
  msg: { marginTop: 10, padding: 10, borderRadius: 8, background: "#0f172a" },
};

function toDateInput(iso) {
  if (!iso) return "";
  try {
    return iso.slice(0, 16);
  } catch {
    return "";
  }
}

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({});
  const [money, setMoney] = useState({ amount: "", description: "", to_account: "" });
  const [editTx, setEditTx] = useState(null);

  const api = getApiUrl();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${api}/api/admin/customers/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Customer not found");
        setCustomer(null);
        return;
      }
      setCustomer(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        status: data.status || "Active",
        created_at: toDateInput(data.created_at),
        account_number: data.account?.account_number || "",
        account_type: data.account?.account_type || "Savings",
        currency: data.account?.currency || "USD",
        account_status: data.account?.status || "Active",
        account_created_at: toDateInput(data.account?.created_at),
        balance: data.account?.balance ?? 0,
        password: "",
      });
    } catch {
      setError("Cannot connect to server");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function saveDetails(e) {
    e.preventDefault();
    setMsg("");
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      const res = await fetch(`${api}/api/admin/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setMsg(data.message || "Saved");
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function doMoney(action) {
    setMsg("");
    try {
      const res = await fetch(`${api}/api/admin/customers/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: money.amount,
          description: money.description,
          to_account: money.to_account,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMsg(data.message || "Success");
      setMoney({ amount: "", description: "", to_account: "" });
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function saveTx(e) {
    e.preventDefault();
    if (!editTx) return;
    setMsg("");
    try {
      const res = await fetch(`${api}/api/admin/transactions/${editTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTx),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMsg("Transaction updated");
      setEditTx(null);
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function deleteTx(txId) {
    if (!window.confirm("Delete this transaction?")) return;
    setMsg("");
    try {
      const res = await fetch(`${api}/api/admin/transactions/${txId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMsg("Transaction deleted");
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  if (loading) {
    return (
      <div style={s.layout}>
        <Sidebar />
        <div style={s.main}>
          <Topbar />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={s.layout}>
        <Sidebar />
        <div style={s.main}>
          <Topbar />
          <h2>Customer not found</h2>
          <p>{error}</p>
          <button style={{ ...s.btn, ...s.primary }} onClick={() => navigate("/admin/customers")}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.layout}>
      <Sidebar />
      <div style={s.main}>
        <Topbar />
        <h1 style={s.title}>{customer.name}</h1>
        <p style={s.sub}>Edit profile · money · transactions</p>

        {msg && <div style={s.msg}>{msg}</div>}

        <div style={s.grid}>
          {/* Edit details */}
          <form style={s.card} onSubmit={saveDetails}>
            <h2 style={s.h2}>Customer & account details</h2>
            <label style={s.label}>Name</label>
            <input style={s.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label style={s.label}>Email</label>
            <input style={s.input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label style={s.label}>Phone</label>
            <input style={s.input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <label style={s.label}>Address</label>
            <input style={s.input} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <label style={s.label}>Status</label>
            <select style={s.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Frozen">Frozen</option>
            </select>
            <label style={s.label}>Customer created date</label>
            <input
              style={s.input}
              type="datetime-local"
              value={form.created_at}
              onChange={(e) => setForm({ ...form, created_at: e.target.value })}
            />
            <label style={s.label}>Account number</label>
            <input
              style={s.input}
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
            />
            <label style={s.label}>Account type</label>
            <input
              style={s.input}
              value={form.account_type}
              onChange={(e) => setForm({ ...form, account_type: e.target.value })}
            />
            <label style={s.label}>Currency</label>
            <input style={s.input} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            <label style={s.label}>Balance (set directly)</label>
            <input
              style={s.input}
              type="number"
              step="0.01"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
            <label style={s.label}>Account created date</label>
            <input
              style={s.input}
              type="datetime-local"
              value={form.account_created_at}
              onChange={(e) => setForm({ ...form, account_created_at: e.target.value })}
            />
            <label style={s.label}>New password (optional)</label>
            <input
              style={s.input}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit" style={{ ...s.btn, ...s.primary }}>
              Save details
            </button>
          </form>

          {/* Money actions */}
          <div style={s.card}>
            <h2 style={s.h2}>Deposit / Withdraw / Transfer</h2>
            <p style={{ color: "#94a3b8", marginBottom: 10 }}>
              Current balance: <strong>${Number(customer.account?.balance || 0).toLocaleString()}</strong>
            </p>
            <label style={s.label}>Amount</label>
            <input
              style={s.input}
              type="number"
              step="0.01"
              value={money.amount}
              onChange={(e) => setMoney({ ...money, amount: e.target.value })}
            />
            <label style={s.label}>Description</label>
            <input
              style={s.input}
              value={money.description}
              onChange={(e) => setMoney({ ...money, description: e.target.value })}
            />
            <label style={s.label}>To account (transfer only)</label>
            <input
              style={s.input}
              value={money.to_account}
              onChange={(e) => setMoney({ ...money, to_account: e.target.value })}
              placeholder="Receiver account number"
            />
            <button style={{ ...s.btn, ...s.success }} onClick={() => doMoney("deposit")}>
              Deposit
            </button>
            <button style={{ ...s.btn, ...s.warn }} onClick={() => doMoney("withdraw")}>
              Withdraw
            </button>
            <button style={{ ...s.btn, ...s.primary }} onClick={() => doMoney("transfer")}>
              Transfer
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div style={{ ...s.card, marginTop: 16 }}>
          <h2 style={s.h2}>Transaction history</h2>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Date</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Description</th>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(customer.transactions || []).map((tx) => (
                <tr key={tx.id}>
                  <td style={s.td}>{tx.date ? new Date(tx.date).toLocaleString() : "-"}</td>
                  <td style={s.td}>{tx.type}</td>
                  <td style={s.td}>{tx.description}</td>
                  <td style={s.td}>${Number(tx.amount).toLocaleString()}</td>
                  <td style={s.td}>{tx.status}</td>
                  <td style={s.td}>
                    <button style={{ ...s.btn, ...s.primary, padding: "6px 10px" }} onClick={() => setEditTx({ ...tx })}>
                      Edit
                    </button>
                    <button style={{ ...s.btn, ...s.danger, padding: "6px 10px" }} onClick={() => deleteTx(tx.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {(!customer.transactions || customer.transactions.length === 0) && (
                <tr>
                  <td style={s.td} colSpan={6}>
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {editTx && (
            <form onSubmit={saveTx} style={{ marginTop: 16, borderTop: "1px solid #334155", paddingTop: 12 }}>
              <h2 style={s.h2}>Edit transaction #{editTx.id}</h2>
              <label style={s.label}>Description</label>
              <input
                style={s.input}
                value={editTx.description || ""}
                onChange={(e) => setEditTx({ ...editTx, description: e.target.value })}
              />
              <label style={s.label}>Amount</label>
              <input
                style={s.input}
                type="number"
                step="0.01"
                value={editTx.amount}
                onChange={(e) => setEditTx({ ...editTx, amount: e.target.value })}
              />
              <label style={s.label}>Type</label>
              <input
                style={s.input}
                value={editTx.type || ""}
                onChange={(e) => setEditTx({ ...editTx, type: e.target.value })}
              />
              <label style={s.label}>Status</label>
              <input
                style={s.input}
                value={editTx.status || ""}
                onChange={(e) => setEditTx({ ...editTx, status: e.target.value })}
              />
              <label style={s.label}>Reference</label>
              <input
                style={s.input}
                value={editTx.reference || ""}
                onChange={(e) => setEditTx({ ...editTx, reference: e.target.value })}
              />
              <label style={s.label}>Date</label>
              <input
                style={s.input}
                type="datetime-local"
                value={toDateInput(editTx.date)}
                onChange={(e) => setEditTx({ ...editTx, date: e.target.value })}
              />
              <button type="submit" style={{ ...s.btn, ...s.primary }}>
                Save transaction
              </button>
              <button type="button" style={{ ...s.btn, ...s.warn }} onClick={() => setEditTx(null)}>
                Cancel
              </button>
            </form>
          )}
        </div>

        <button style={{ ...s.btn, ...s.primary, marginTop: 16 }} onClick={() => navigate("/admin/customers")}>
          ← Back to Customers
        </button>
      </div>
    </div>
  );
}

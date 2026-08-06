import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";

function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadProfile() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/customer/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile");
      }
      setCustomer(data);
    } catch (err) {
      console.log(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("account_number");
    navigate("/login");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#94a3b8" }}>Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <h2 style={{ color: "#f8fafc" }}>Couldn’t load dashboard</h2>
        <p style={{ color: "#94a3b8" }}>{error}</p>
        <button style={styles.btnPrimary} onClick={logout}>
          Back to Login
        </button>
      </div>
    );
  }

  const balance = Number(customer?.account?.balance || 0);
  const accountNumber = customer?.account?.account_number || "—";
  const accountType = customer?.account?.account_type || "Savings";
  const currency = customer?.account?.currency || "USD";
  const transactions = customer?.transactions || [];
  const createdAt =
    customer?.account?.created_at || customer?.created_at || null;

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <header style={styles.topbar}>
        <div style={styles.brand}>
          Nova<span style={{ color: "#38bdf8" }}>Bank</span>
        </div>
        <div style={styles.topActions}>
          <span style={styles.chip}>● Online</span>
          <button
            style={styles.btnGhost}
            onClick={() => navigate("/customer/chat")}
          >
            Support
          </button>
          <button style={styles.btnDanger} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={styles.greeting}>
            Welcome back, {customer?.name?.split(" ")[0] || "Customer"}
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 6 }}>
            Here’s an overview of your NovaBank account
          </p>
        </div>

        {/* Balance card */}
        <div style={styles.balanceCard}>
          <div style={{ opacity: 0.9, marginBottom: 8, fontSize: 14 }}>
            Available balance
          </div>
          <div style={styles.balanceAmount}>
            $
            {balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div style={styles.balanceMeta}>
            <div>
              <div style={styles.metaLabel}>Account number</div>
              <div style={styles.metaValue}>{accountNumber}</div>
            </div>
            <div>
              <div style={styles.metaLabel}>Account type</div>
              <div style={styles.metaValue}>{accountType}</div>
            </div>
            <div>
              <div style={styles.metaLabel}>Currency</div>
              <div style={styles.metaValue}>{currency}</div>
            </div>
            <div>
              <div style={styles.metaLabel}>Status</div>
              <div style={styles.metaValue}>{customer?.status || "Active"}</div>
            </div>
            <div>
              <div style={styles.metaLabel}>Account created</div>
              <div style={styles.metaValue}>{formatDate(createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={styles.action}
            onClick={() => navigate("/customer/transfer")}
          >
            <div style={styles.actionIcon}>↗</div>
            <span>Transfer</span>
          </button>
          <button
            style={styles.action}
            onClick={() => navigate("/customer/deposit")}
          >
            <div style={styles.actionIcon}>↓</div>
            <span>Deposit</span>
          </button>
          <button
            style={styles.action}
            onClick={() => navigate("/customer/withdraw")}
          >
            <div style={styles.actionIcon}>↑</div>
            <span>Withdraw</span>
          </button>
          <button
            style={styles.action}
            onClick={() => navigate("/customer/chat")}
          >
            <div style={styles.actionIcon}>💬</div>
            <span>Chat</span>
          </button>
        </div>

        {/* Info */}
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <h4 style={styles.infoLabel}>Email</h4>
            <p style={styles.infoValue}>{customer?.email || "—"}</p>
          </div>
          <div style={styles.infoCard}>
            <h4 style={styles.infoLabel}>Phone</h4>
            <p style={styles.infoValue}>{customer?.phone || "Not set"}</p>
          </div>
          <div style={styles.infoCard}>
            <h4 style={styles.infoLabel}>Account created</h4>
            <p style={styles.infoValue}>{formatDate(createdAt)}</p>
          </div>
        </div>

        {/* Transactions */}
        <section style={styles.section}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc" }}>
              Recent transactions
            </h2>
            <span style={{ color: "#64748b", fontSize: 14 }}>
              {transactions.length} shown
            </span>
          </div>

          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
              <p>
                No transactions yet. Make a deposit or transfer to get started.
              </p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} style={styles.txRow}>
                <div>
                  <div style={{ fontWeight: 600, color: "#f8fafc" }}>
                    {tx.description || tx.type || "Transaction"}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    {tx.type || tx.transaction_type || "—"}
                    {tx.date
                      ? ` · ${new Date(tx.date).toLocaleDateString()}`
                      : ""}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                  ${Number(tx.amount || 0).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

/* ===== INLINE STYLES (always apply) ===== */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "#f8fafc",
    fontFamily: "Inter, system-ui, sans-serif",
    paddingBottom: 48,
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 5%",
    background: "rgba(15,23,42,0.95)",
    borderBottom: "1px solid rgba(148,163,184,0.15)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  brand: {
    fontSize: 22,
    fontWeight: 900,
    color: "#f8fafc",
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  chip: {
    padding: "6px 14px",
    borderRadius: 999,
    background: "rgba(56,189,248,0.15)",
    color: "#7dd3fc",
    fontSize: 14,
    fontWeight: 600,
  },
  btnGhost: {
    padding: "10px 18px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.3)",
    background: "rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "10px 18px",
    borderRadius: 12,
    border: "1px solid rgba(239,68,68,0.4)",
    background: "rgba(239,68,68,0.2)",
    color: "#fca5a5",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnPrimary: {
    padding: "12px 24px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#2563eb,#38bdf8)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 16,
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 5% 0",
  },
  greeting: {
    fontSize: 32,
    fontWeight: 800,
    color: "#f8fafc",
    margin: 0,
  },
  balanceCard: {
    borderRadius: 28,
    padding: 32,
    background: "linear-gradient(145deg,#1e3a8a,#2563eb,#0ea5e9)",
    boxShadow: "0 20px 40px rgba(37,99,235,0.35)",
    marginBottom: 28,
    color: "white",
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 900,
    marginBottom: 20,
    color: "white",
  },
  balanceMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px 32px",
  },
  metaLabel: {
    fontSize: 12,
    opacity: 0.85,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: 700,
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 28,
  },
  action: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "22px 16px",
    borderRadius: 20,
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.2)",
    cursor: "pointer",
    color: "#f8fafc",
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    background: "linear-gradient(135deg,#2563eb,#38bdf8)",
    color: "white",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 28,
  },
  infoCard: {
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 18,
    padding: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f1f5f9",
    margin: 0,
  },
  section: {
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(148,163,184,0.15)",
    borderRadius: 22,
    padding: 24,
  },
  txRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid rgba(148,163,184,0.1)",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#020617",
    color: "#e2e8f0",
  },
};

export default CustomerDashboard;

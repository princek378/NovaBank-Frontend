import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "./CustomerProfile.css";

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${getApiUrl()}/api/admin/customers/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Customer not found");
        setCustomer(null);
        return;
      }

      setCustomer(data);
    } catch (err) {
      console.log("Customer loading error:", err);
      setError("Cannot connect to server");
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <h2 style={{ padding: 20 }}>Loading customer...</h2>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="admin-layout">
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <div style={{ padding: 20 }}>
            <h2>Customer not found</h2>
            <p style={{ color: "#94a3b8", marginTop: 8 }}>
              {error || "This customer does not exist."}
            </p>
            <button
              className="view-btn"
              style={{ marginTop: 16 }}
              onClick={() => navigate("/admin/customers")}
            >
              ← Back to Customers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="profile-header">
          <h1>{customer.name}</h1>
          <p>Customer Profile</p>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <h2>Personal Information</h2>

            <p>
              <strong>Email:</strong> {customer.email}
            </p>
            <p>
              <strong>Phone:</strong> {customer.phone || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {customer.address || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {customer.status || "Active"}
            </p>
          </div>

          <div className="profile-card">
            <h2>Account Information</h2>

            <p>
              <strong>Account Number:</strong>{" "}
              {customer.account?.account_number ||
                customer.account_number ||
                "N/A"}
            </p>
            <p>
              <strong>Account Type:</strong>{" "}
              {customer.account?.account_type ||
                customer.account_type ||
                "N/A"}
            </p>
            <p>
              <strong>Balance:</strong> $
              {Number(
                customer.account?.balance ?? customer.balance ?? 0
              ).toLocaleString()}
            </p>
            <p>
              <strong>Currency:</strong>{" "}
              {customer.account?.currency || customer.currency || "USD"}
            </p>
          </div>
        </div>

        <button
          className="view-btn"
          style={{ marginTop: 20 }}
          onClick={() => navigate("/admin/customers")}
        >
          ← Back to Customers
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";
import "../styles/auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // email | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed");
        return;
      }
      setSuccess("If that email exists, a code was sent. Check your inbox.");
      setStep("reset");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed");
        return;
      }
      setSuccess("Password updated! Redirecting to login…");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="auth-back">
          ← Back to login
        </Link>
        <div className="auth-header">
          <div className="logo">
            Nova<span>Bank</span>
          </div>
          <h1>Reset password</h1>
          <p>We will email a code to your Gmail / email address</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {step === "email" ? (
          <form className="auth-form" onSubmit={sendCode}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Sending…" : "Send reset code"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={resetPassword}>
            <div className="form-group">
              <label>OTP code</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
            </div>
            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

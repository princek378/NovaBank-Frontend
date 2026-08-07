import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiUrl } from "../utils/api";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState("form"); // form | otp
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function requestOtp(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/register/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not send code");
        return;
      }
      setSuccess("We sent a 6-digit code to your email. Enter it below.");
      setStep("otp");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid code");
        return;
      }
      setSuccess(
        `Account created! Account number: ${data.account_number}. Redirecting to login…`
      );
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <Link to="/" className="auth-back">
          ← Back to home
        </Link>
        <div className="auth-header">
          <div className="logo">
            Nova<span>Bank</span>
          </div>
          <span className="auth-badge">New Customer</span>
          <h1>{step === "form" ? "Create your account" : "Verify your email"}</h1>
          <p>
            {step === "form"
              ? "We will send a verification code to your email"
              : `Code sent to ${form.email}`}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {step === "form" ? (
          <form className="auth-form" onSubmit={requestOtp}>
            <div className="form-row">
              <div className="form-group">
                <label>First name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Phone (optional)</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Address (optional)</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Sending code…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={verifyOtp}>
            <div className="form-group">
              <label>6-digit OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Verifying…" : "Verify & create account"}
            </button>
            <button
              type="button"
              className="auth-submit"
              style={{ marginTop: 10, background: "transparent", border: "1px solid #64748b" }}
              onClick={() => setStep("form")}
            >
              Back
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

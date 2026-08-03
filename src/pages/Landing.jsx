import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">
          Nova<span>Bank</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="btn btn-outline">
            Customer Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Open an Account
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <h1>
            Banking that feels
            <br />
            <span className="highlight">modern & secure</span>
          </h1>
          <p>
            NovaBank gives you full control of your money — instant transfers,
            real-time balances, and a clean experience built for everyday life.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Open an Account
            </Link>
            <Link to="/login" className="btn btn-outline">
              Sign In
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-label">Available Balance</div>
          <div className="card-balance">$12,480.50</div>
          <div className="card-row">
            <span>Account</span>
            <span>•••• 4829</span>
          </div>
          <div className="card-row">
            <span>Type</span>
            <span>Savings</span>
          </div>
          <div className="card-row">
            <span>Status</span>
            <span>Active</span>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why choose NovaBank</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Transfers</h3>
            <p>Send money between accounts in seconds with clear receipts and history.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Bank-grade Security</h3>
            <p>Protected sessions and account freeze tools keep your funds safe.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Clear Insights</h3>
            <p>See balances, deposits, withdrawals and transfers in one dashboard.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Live Support Chat</h3>
            <p>Message the bank team directly from your customer portal anytime.</p>
          </div>
        </div>
      </section>

      <section className="portal-section">
        <h2>Get started with NovaBank</h2>
        <p>Create an account or sign in to manage your money securely.</p>
        <div className="portal-grid">
          <div className="portal-card">
            <div className="portal-icon">👤</div>
            <h3>Customer</h3>
            <p>
              Create an account, log in, transfer, deposit, withdraw and chat with support.
            </p>
            <Link to="/register" className="btn btn-primary" style={{ marginRight: 8 }}>
              Create Account
            </Link>
            <Link to="/login" className="btn btn-outline">
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} NovaBank — Secure Digital Banking
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Home.css';

export default function Home() {
  const { userToken } = useAuth();

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="home-brand">
          <span className="brand-icon">◈</span>
          <span>LoanTrack</span>
        </div>
        <div className="home-nav-links">
          {userToken ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/auth" className="btn btn-ghost">Sign In</Link>
              <Link to="/auth?mode=signup" className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <main className="home-hero">
        <div className="hero-badge">Loan Tracker — Roll No. 5533</div>
        <h1 className="hero-heading">
          Track your loans.<br />
          <span className="hero-accent">Understand the trend.</span>
        </h1>
        <p className="hero-sub">
          One place to manage all your loans — see exactly how much interest you're
          accumulating, whether you're ahead of schedule, and what your repayment
          pattern looks like over time.
        </p>

        <div className="hero-cta">
          <Link to={userToken ? '/dashboard' : '/auth?mode=signup'} className="btn btn-primary hero-btn">
            {userToken ? 'View Dashboard' : 'Start Tracking'}
          </Link>
          <Link to="/auth" className="btn btn-ghost hero-btn">Sign In</Link>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>EMI Calculator</h3>
            <p>Auto-computed monthly installments using the standard compound interest formula.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Repayment Trend</h3>
            <p>Visual comparison of your actual payments vs the expected repayment curve.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Status Tracking</h3>
            <p>Loans auto-update to active, completed, or overdue based on real-time data.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Interest Analysis</h3>
            <p>See how much interest you've paid and how much still remains on each loan.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-text">
            <span className="eyebrow">Kenya Logistics Platform</span>
            <h1>
              Connect Drivers with Cargo Owners — <span className="hero-highlight">Instantly</span>
            </h1>
            <p>
            </p>

            <div className="hero-kpis" aria-label="Platform highlights">
              <div className="kpi">
                <div className="kpi-value">Real-time</div>
                <div className="kpi-label">Job feed</div>
              </div>
              <div className="kpi">
                <div className="kpi-value">Bid &amp; Accept</div>
                <div className="kpi-label">Direct matching</div>
              </div>
              <div className="kpi">
                <div className="kpi-value">Trusted</div>
                <div className="kpi-label">Ratings &amp; reviews</div>
              </div>
            </div>

            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Create Account
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card hero-steps">
              <h3>How it works</h3>
              <ol className="steps">
                <li>
                  <strong>Cargo owners</strong> post freight details online
                </li>
                <li>
                  <strong>Drivers</strong> browse real-time job listings
                </li>
                <li>
                  <strong>Drivers</strong> bid or accept jobs directly
                </li>
                <li>
                  <strong>Both parties</strong> rate each other after delivery
                </li>
              </ol>
            </div>

            <div className="hero-card hero-metrics" aria-label="Quick benefits">
              <h3>Why Truck Connect</h3>
              <ul className="metric-list">
                <li>Reduce waiting time &amp; improve load visibility</li>
                <li>Transparent job details from pickup to drop-off</li>
                <li>JWT-protected access with role-based flows</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>
            Built for Kenya&apos;s <span className="section-highlight">Transport Sector</span>
          </h2>
          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="16" y2="14" /><line x1="8" y1="18" x2="12" y2="18" /></svg></div>
              <h3>Real-Time Job Posting</h3>
              <p>Cargo owners post pickup, destination, and weight details in seconds.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" /></svg></div>
              <h3>Driver Job Feed</h3>
              <p>Drivers see available loads instantly — no more days at roadside hubs.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg></div>
              <h3>Secure &amp; Verified</h3>
              <p>JWT authentication and profile verification build trust between parties.</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg></div>
              <h3>Ratings &amp; Feedback</h3>
              <p>Rate completed jobs to maintain accountability across the platform.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

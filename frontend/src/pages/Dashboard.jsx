import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Welcome, {user.name}</h1>
            <p className="text-muted">
              {user.role === 'driver'
                ? 'Browse available cargo jobs and submit bids.'
                : 'Post cargo jobs and manage driver bids.'}
            </p>
          </div>
          <span className={`role-badge role-${user.role}`}>
            {user.role === 'driver' ? 'Driver' : 'Cargo Owner'}
          </span>
        </div>

        <div className="dashboard-grid">
          {user.role === 'driver' ? (
            <>
              <Link to="/jobs" className="dash-card">
                <span className="dash-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="16" y2="14" /></svg></span>
                <h3>Job Feed</h3>
                <p>Browse open cargo jobs in real time</p>
              </Link>
              <Link to="/profile" className="dash-card">
                <span className="dash-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg></span>
                <h3>My Profile</h3>
                <p>Update vehicle details and contact info</p>
              </Link>
            </>
          ) : (
            <>
              <Link to="/post-job" className="dash-card">
                <span className="dash-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg></span>
                <h3>Post a Job</h3>
                <p>List new cargo for drivers to bid on</p>
              </Link>
              <Link to="/my-jobs" className="dash-card">
                <span className="dash-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27,6.96 12,12.01 20.73,6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg></span>
                <h3>My Jobs</h3>
                <p>Track posted jobs and manage bids</p>
              </Link>
            </>
          )}
          <Link to="/notifications" className="dash-card">
            <span className="dash-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg></span>
            <h3>Notifications</h3>
            <p>View job alerts and bid updates</p>
          </Link>

        </div>

        {user.averageRating > 0 && (
          <div className="rating-banner">
            ⭐ Your rating: <strong>{user.averageRating.toFixed(1)}</strong> / 5
          </div>
        )}
      </div>
    </div>
  );
}

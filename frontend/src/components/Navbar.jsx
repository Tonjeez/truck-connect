import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    api
      .get('/notifications/unread-count')
      .then(({ data }) => setUnreadCount(data.count))
      .catch(() => {});

    const interval = setInterval(() => {
      api
        .get('/notifications/unread-count')
        .then(({ data }) => setUnreadCount(data.count))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </span>
          Truck Connect
        </Link>

        <nav className="nav-links">
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              {user.role === 'client' && <NavLink to="/post-job">Post Job</NavLink>}
              {user.role === 'driver' && <NavLink to="/jobs">Job Feed</NavLink>}
              <NavLink to="/notifications" className="notif-link">
                Notifications
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Get Started
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

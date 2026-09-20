import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = () => {
    api
      .get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container container-narrow">
        <div className="page-header">
          <h1>Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <button type="button" className="btn btn-ghost" onClick={markAllRead}>
              Mark all read
            </button>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>No notifications yet. Activity on your jobs will appear here.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`notif-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => !notif.read && markRead(notif._id)}
                onKeyDown={(e) => e.key === 'Enter' && !notif.read && markRead(notif._id)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <p>{notif.message}</p>
                  <span className="text-muted">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                {notif.relatedJob && (
                  <Link
                    to={`/jobs/${notif.relatedJob._id}`}
                    className="btn btn-sm btn-outline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Job
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

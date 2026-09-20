import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const statusLabels = {
  open: 'Open',
  assigned: 'Assigned',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function JobFeed() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/jobs')
      .then(({ data }) => setJobs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === 'all' ? jobs : jobs.filter((job) => job.status === filter);

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Driver Job Feed</h1>
          <p className="text-muted">Available cargo jobs posted by cargo owners</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="filter-bar">
          {['all', 'open', 'assigned', 'completed'].map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All Jobs' : statusLabels[status]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No jobs found. Check back later for new cargo listings.</p>
          </div>
        ) : (
          <div className="job-grid">
            {filtered.map((job) => (
              <Link key={job._id} to={`/jobs/${job._id}`} className="job-card">
                <div className="job-card-header">
                  <span className={`status-badge status-${job.status}`}>
                    {statusLabels[job.status]}
                  </span>
                  {job.budget && <span className="job-budget">KES {job.budget.toLocaleString()}</span>}
                </div>
                <h3>
                  {job.pickupLocation} → {job.dropoffLocation}
                </h3>
                <p className="job-meta">
                  <span>⚖️ {job.cargoWeight}</span>
                  <span>📦 {job.cargoDescription.slice(0, 60)}...</span>
                </p>
                <p className="job-client">
                  Posted by {job.client?.name}
                  {job.client?.phone ? (
                    <span className="text-muted"> · Phone: {job.client.phone}</span>
                  ) : null}
                </p>

              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

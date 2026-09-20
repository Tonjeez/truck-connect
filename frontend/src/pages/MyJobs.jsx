import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const statusLabels = {
  open: 'Open',
  assigned: 'Assigned',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/jobs')
      .then(({ data }) => setJobs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
          <div>
            <h1>My Posted Jobs</h1>
            <p className="text-muted">Manage your cargo listings and review driver bids</p>
          </div>
          <Link to="/post-job" className="btn btn-primary">
            + Post New Job
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>You haven&apos;t posted any jobs yet.</p>
            <Link to="/post-job" className="btn btn-primary">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="job-grid">
            {jobs.map((job) => (
              <Link key={job._id} to={`/jobs/${job._id}`} className="job-card">
                <div className="job-card-header">
                  <span className={`status-badge status-${job.status}`}>
                    {statusLabels[job.status]}
                  </span>
                </div>
                <h3>
                  {job.pickupLocation} → {job.dropoffLocation}
                </h3>
                <p className="job-meta">⚖️ {job.cargoWeight}</p>
                {job.assignedDriver && (
                  <p className="job-client">Driver: {job.assignedDriver.name}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const statusLabels = {
  open: 'Open',
  assigned: 'Assigned',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bidForm, setBidForm] = useState({ amount: '', message: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJob = () => {
    api
      .get(`/jobs/${id}`)
      .then(({ data }) => {
        setJob(data.job);
        setBids(data.bids);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const isOwner = job?.client?._id === user?._id;
  const isAssignedDriver = job?.assignedDriver?._id === user?._id;
  const hasBid = bids.some((b) => b.driver?._id === user?._id);

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);
    try {
      await api.post(`/jobs/${id}/bids`, {
        amount: bidForm.amount ? Number(bidForm.amount) : undefined,
        message: bidForm.message,
      });
      setSuccess('Bid submitted successfully!');
      setBidForm({ amount: '', message: '' });
      fetchJob();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    setError('');
    setActionLoading(true);
    try {
      await api.put(`/jobs/${id}/bids/${bidId}/accept`);
      setSuccess('Bid accepted! Driver has been assigned.');
      fetchJob();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setError('');
    setActionLoading(true);
    try {
      await api.put(`/jobs/${id}/complete`);
      setSuccess('Job marked as completed.');
      fetchJob();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this job?')) return;
    setError('');
    setActionLoading(true);
    try {
      await api.put(`/jobs/${id}/cancel`);
      setSuccess('Job cancelled.');
      fetchJob();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      await api.post('/reviews', {
        jobId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setSuccess('Review submitted. Thank you!');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page">
        <div className="container">
          <div className="alert alert-error">Job not found</div>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container container-narrow">
        <Link to={user.role === 'client' ? '/my-jobs' : '/jobs'} className="back-link">
          ← Back
        </Link>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="card job-detail">
          <div className="job-detail-header">
            <span className={`status-badge status-${job.status}`}>{statusLabels[job.status]}</span>
            {job.budget && <span className="job-budget">Budget: KES {job.budget.toLocaleString()}</span>}
          </div>

          <h1>
            {job.pickupLocation} → {job.dropoffLocation}
          </h1>

          <div className="detail-grid">
            <div>
              <strong>Cargo Weight</strong>
              <p>{job.cargoWeight}</p>
            </div>
            <div>
              <strong>Posted By</strong>
              <p>{job.client?.name}</p>
              {job.client?.phone ? (
                <p className="text-muted">Phone: {job.client.phone}</p>
              ) : null}
            </div>

            {job.assignedDriver && (
              <div>
                <strong>Assigned Driver</strong>
                <p>{job.assignedDriver.name}</p>
                {job.assignedDriver.phone ? (
                  <p className="text-muted">Phone: {job.assignedDriver.phone}</p>
                ) : null}
              </div>
            )}

            <div>
              <strong>Posted</strong>
              <p>{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="detail-section">
            <strong>Description</strong>
            <p>{job.cargoDescription}</p>
          </div>

          {isOwner && job.status === 'open' && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              Cancel Job
            </button>
          )}

          {(isOwner || isAssignedDriver) && job.status === 'assigned' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={actionLoading}
            >
              Mark as Completed
            </button>
          )}
        </div>

        {user.role === 'driver' && job.status === 'open' && !hasBid && (
          <div className="card">
            <h2>Submit a Bid</h2>
            <form onSubmit={handleBid} className="form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Your Price (KES, optional)</label>
                  <input
                    id="amount"
                    type="number"
                    min="0"
                    value={bidForm.amount}
                    onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="message">Message (optional)</label>
                <textarea
                  id="message"
                  rows={3}
                  value={bidForm.message}
                  onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                  placeholder="Introduce yourself or note availability..."
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Submitting...' : 'Submit Bid'}
              </button>
            </form>
          </div>
        )}

        {hasBid && job.status === 'open' && (
          <div className="alert alert-info">You have already bid on this job.</div>
        )}

        {isOwner && bids.length > 0 && (
          <div className="card">
            <h2>Driver Bids ({bids.length})</h2>
            <div className="bid-list">
              {bids.map((bid) => (
                <div key={bid._id} className="bid-item">
                  <div>
                    <strong>{bid.driver?.name}</strong>
                    {bid.driver?.vehicleDetails?.plateNumber && (
                      <span className="text-muted"> · {bid.driver.vehicleDetails.plateNumber}</span>
                    )}
                    {bid.driver?.averageRating > 0 && (
                      <span> · ⭐ {bid.driver.averageRating}</span>
                    )}
                    {bid.amount && <p>KES {bid.amount.toLocaleString()}</p>}
                    {bid.message && <p className="text-muted">{bid.message}</p>}
                    <span className={`status-badge status-${bid.status}`}>{bid.status}</span>
                  </div>
                  {job.status === 'open' && bid.status === 'pending' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAcceptBid(bid._id)}
                      disabled={actionLoading}
                    >
                      Accept Bid
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {job.status === 'completed' && (isOwner || isAssignedDriver) && (
          <div className="card">
            <h2>Leave a Review</h2>
            <form onSubmit={handleReview} className="form">
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment (optional)</label>
                <textarea
                  id="comment"
                  rows={3}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

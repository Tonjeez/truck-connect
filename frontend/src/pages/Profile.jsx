import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
    plateNumber: user?.vehicleDetails?.plateNumber || '',
    truckType: user?.vehicleDetails?.truckType || '',
    capacity: user?.vehicleDetails?.capacity || '',
  });
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      api
        .get(`/reviews/user/${user._id}`)
        .then(({ data }) => setReviews(data))
        .catch(() => {});
    }
  }, [user?._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = { name: form.name, phone: form.phone };
    if (user.role === 'client') {
      payload.companyName = form.companyName;
    } else {
      payload.vehicleDetails = {
        plateNumber: form.plateNumber,
        truckType: form.truckType,
        capacity: form.capacity,
      };
    }

    try {
      const { data } = await api.put('/users/profile', payload);
      updateUser(data);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container container-narrow">
        <div className="page-header">
          <h1>My Profile</h1>
          <span className={`role-badge role-${user.role}`}>
            {user.role === 'driver' ? 'Driver' : 'Cargo Owner'}
          </span>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="form card">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={user.email} disabled className="input-disabled" />
          </div>

          {user.role === 'client' ? (
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
              />
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="plateNumber">Plate Number</label>
                <input
                  id="plateNumber"
                  name="plateNumber"
                  value={form.plateNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="truckType">Truck Type</label>
                <input id="truckType" name="truckType" value={form.truckType} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="capacity">Capacity</label>
                <input id="capacity" name="capacity" value={form.capacity} onChange={handleChange} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {user.averageRating > 0 && (
          <div className="card rating-summary">
            <h2>Your Rating</h2>
            <p className="rating-big">⭐ {user.averageRating.toFixed(1)} / 5</p>
            <p className="text-muted">{user.reviewCount || reviews.length} review(s)</p>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="card">
            <h2>Reviews</h2>
            <div className="review-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <strong>{review.reviewer?.name}</strong>
                    <span>⭐ {review.rating}</span>
                  </div>
                  {review.comment && <p>{review.comment}</p>}
                  <p className="text-muted">
                    {review.job?.pickupLocation} → {review.job?.dropoffLocation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

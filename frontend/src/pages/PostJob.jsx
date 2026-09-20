import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    cargoWeight: '',
    cargoDescription: '',
    budget: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...form };
      if (payload.budget) payload.budget = Number(payload.budget);
      else delete payload.budget;

      const { data } = await api.post('/jobs', payload);
      navigate(`/jobs/${data._id}`);
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
          <h1>Post a Cargo Job</h1>
          <p className="text-muted">Describe your freight so drivers can bid on it</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form card">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location</label>
              <input
                id="pickupLocation"
                name="pickupLocation"
                value={form.pickupLocation}
                onChange={handleChange}
                required
                placeholder="e.g. Nakuru Industrial Area"
              />
            </div>
            <div className="form-group">
              <label htmlFor="dropoffLocation">Drop-off Location</label>
              <input
                id="dropoffLocation"
                name="dropoffLocation"
                value={form.dropoffLocation}
                onChange={handleChange}
                required
                placeholder="e.g. Rongai, Kajiado"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cargoWeight">Cargo Weight</label>
              <input
                id="cargoWeight"
                name="cargoWeight"
                value={form.cargoWeight}
                onChange={handleChange}
                required
                placeholder="e.g. 10 tons"
              />
            </div>
            <div className="form-group">
              <label htmlFor="budget">Budget (KES, optional)</label>
              <input
                id="budget"
                name="budget"
                type="number"
                min="0"
                value={form.budget}
                onChange={handleChange}
                placeholder="e.g. 25000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cargoDescription">Cargo Description</label>
            <textarea
              id="cargoDescription"
              name="cargoDescription"
              value={form.cargoDescription}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the cargo type, handling requirements, etc."
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}

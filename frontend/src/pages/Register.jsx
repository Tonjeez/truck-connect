import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'driver',
  companyName: '',
  plateNumber: '',
  truckType: '',
  capacity: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: form.role,
    };

    if (form.role === 'client') {
      payload.companyName = form.companyName;
    } else {
      payload.vehicleDetails = {
        plateNumber: form.plateNumber,
        truckType: form.truckType,
        capacity: form.capacity,
      };
    }

    try {
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join Truck Connect as a driver or cargo owner</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="role-selector">
            <label className={`role-option ${form.role === 'driver' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="driver"
                checked={form.role === 'driver'}
                onChange={handleChange}
              />
              <span>🚛 Truck Driver</span>
            </label>
            <label className={`role-option ${form.role === 'client' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="client"
                checked={form.role === 'client'}
                onChange={handleChange}
              />
              <span>📦 Cargo Owner</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          {form.role === 'client' ? (
            <div className="form-group">
              <label htmlFor="companyName">Company Name (optional)</label>
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
                <label htmlFor="capacity">Capacity (tons)</label>
                <input id="capacity" name="capacity" value={form.capacity} onChange={handleChange} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

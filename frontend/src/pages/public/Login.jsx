import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Alert from '../../components/common/Alert';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome back</h2>
          <p className="text-muted mt-4 mb-2">Please enter your details to sign in.</p>
        </div>

        <Alert type="error" message={error} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your EmailAddress"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }} className="text-primary">Forgot Password?</Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter your Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full mb-3" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-muted">
          Don't have an account? <Link to="/register" className="text-primary" style={{ fontWeight: 500, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

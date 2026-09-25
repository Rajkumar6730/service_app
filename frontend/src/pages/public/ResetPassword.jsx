import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import Alert from '../../components/common/Alert';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await authService.resetPassword(token, formData.newPassword);
      setSuccess(res.message || 'Password updated successfully.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Reset Password</h2>
          <p className="text-muted mt-4 mb-2">Enter your new password below.</p>
        </div>
        
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {token && !success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="form-control"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-control"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full mb-3" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
        
        <p className="text-center text-muted mt-3">
          <Link to="/login" className="text-primary" style={{ fontWeight: 500, textDecoration: 'none' }}>Return to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;

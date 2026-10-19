import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import Alert from '../../components/common/Alert';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 4) {
      const err = 'Password must be at least 4 characters long.';
      setError(err);
      toast.error(err, 'Validation Error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      const err = 'Passwords do not match. Please verify both fields.';
      setError(err);
      toast.error(err, 'Validation Error');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authService.resetPassword(token, formData.newPassword);
      const msg = res.message || 'Password updated successfully!';
      setSuccess(msg);
      toast.success(msg, 'Password Reset Successful');
      setTimeout(() => {
        navigate('/login', {
          state: {
            email: emailParam,
            message: 'Password updated successfully! Please sign in with your new password.'
          }
        });
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Something went wrong. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, 'Reset Failed');
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
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  className="form-control"
                  placeholder="Enter new password (min. 4 characters)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full mb-3" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password & Proceed to Login'}
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


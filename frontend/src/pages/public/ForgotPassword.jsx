import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import Alert from '../../components/common/Alert';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1); // 1: Verify Email, 2: Set New Password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Validate Email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authService.forgotPassword(email);
      if (res.reset_token) {
        setResetToken(res.reset_token);
        setStep(2);
        const msg = 'Email verified successfully! Please enter your new password below.';
        setSuccess(msg);
        toast.success(msg, 'Email Verified');
      } else {
        const msg = res.message || 'Password reset instructions have been generated.';
        setSuccess(msg);
        toast.info(msg, 'Reset Instructions');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'No account found with this email address.';
      setError(errorMsg);
      toast.error(errorMsg, 'Verification Failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.newPassword.length < 4) {
      const err = 'Password must be at least 4 characters long.';
      setError(err);
      toast.error(err, 'Validation Error');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      const err = 'Passwords do not match. Please verify both fields.';
      setError(err);
      toast.error(err, 'Validation Error');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(resetToken, passwords.newPassword);
      const msg = 'Password updated successfully! Redirecting to login page...';
      setSuccess(msg);
      toast.success(msg, 'Password Reset Successful');
      setTimeout(() => {
        navigate('/login', {
          state: {
            email: email,
            message: 'Password updated successfully! Please sign in with your new password.'
          }
        });
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update password. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, 'Reset Failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">
            {step === 1 ? 'Forgot Password' : 'Reset Your Password'}
          </h2>
          <p className="text-muted mt-4 mb-2">
            {step === 1
              ? "Enter your registered email address to verify your account."
              : `Creating a new password for ${email}`}
          </p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {step === 1 ? (
          <form onSubmit={handleVerifyEmail}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full mb-3" disabled={isLoading}>
              {isLoading ? 'Verifying Email...' : 'Verify Email & Reset Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#EFF6FF',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.25rem',
              border: '1px solid #BFDBFE'
            }}>
              <CheckCircle2 size={18} color="#2563EB" />
              <span style={{ fontSize: '0.875rem', color: '#1E40AF', fontWeight: 500 }}>
                Verified account: <strong>{email}</strong>
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  className="form-control"
                  placeholder="Enter new password (min. 4 characters)"
                  value={passwords.newPassword}
                  onChange={(e) => {
                    setPasswords({ ...passwords, newPassword: e.target.value });
                    if (error) setError('');
                  }}
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
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm your new password"
                  value={passwords.confirmPassword}
                  onChange={(e) => {
                    setPasswords({ ...passwords, confirmPassword: e.target.value });
                    if (error) setError('');
                  }}
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
              {isLoading ? 'Updating Password...' : 'Set New Password & Proceed to Login'}
            </button>

            <button
              type="button"
              className="btn btn-outline btn-full mb-3"
              onClick={() => {
                setStep(1);
                setError('');
                setSuccess('');
              }}
              disabled={isLoading}
              style={{ fontSize: '0.875rem' }}
            >
              Change Email
            </button>
          </form>
        )}

        <p className="text-center text-muted mt-3">
          Remember your password? <Link to="/login" className="text-primary" style={{ fontWeight: 500, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import Alert from '../../components/common/Alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await authService.forgotPassword(email);
      setSuccess(res.message || 'If the account exists, password reset instructions have been generated.');
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
          <h2 className="auth-title">Forgot Password</h2>
          <p className="text-muted mt-4 mb-2">Enter your email address and we'll send you instructions to reset your password.</p>
        </div>
        
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full mb-3" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Request Password Reset'}
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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Alert from '../../components/common/Alert';

const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message, 'Notice');
    }
  }, [location.state?.message, toast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = await login(formData.email, formData.password);
      const successMsg = user?.name 
        ? `Welcome back, ${user.name}! Login successful.` 
        : 'Login successful! Redirecting to dashboard...';
      
      setSuccess(successMsg);
      toast.success(successMsg, 'Login Successful');

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      const errorMsg = err.message || 'Invalid email or password credentials. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, 'Login Failed');
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

        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}

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
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-control"
                placeholder="Enter your Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Alert from '../../components/common/Alert';

const Register = () => {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      await register(formData);
      const successMsg = 'Account created successfully! Logging you in...';
      setSuccess(successMsg);
      toast.success(successMsg, 'Registration Successful');
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg, 'Registration Failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h2 className="auth-title">Create an Account</h2>
          <p className="text-muted mt-4 mb-2">Join ServiceHub today.</p>
        </div>

        {success && <Alert type="success" message={success} />}
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="YourEmailAddress@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-control"
              placeholder="YourPhoneNumber"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-control"
                placeholder="Create a 4-digit strong password"
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-muted">
          Already have an account? <Link to="/login" className="text-primary" style={{ fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


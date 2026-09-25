import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <Wrench size={24} />
          <span>ServiceHub</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" style={{ fontWeight: 600 }}>
                Welcome Service App🙂
              </Link>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '0.35rem 1rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

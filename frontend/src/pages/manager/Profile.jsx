import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>My Profile</h1>
        <p className="text-muted">View your administrative account details.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <h2 className="card-title">Account Details</h2>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" value={user?.name || ''} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={user?.email || ''} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-control" value={user?.phone || 'Not provided'} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input type="text" className="form-control" value={user?.role || ''} disabled />
          </div>
          <div className="mt-4">
            <button className="btn btn-primary" disabled>Update Profile</button>
            <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>* Profile updates are restricted.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

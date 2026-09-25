import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ClipboardList, Clock, Activity, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  const { user } = useAuth();
  
  // Dummy data for the dashboard UI since we aren't connecting to the backend for this yet
  const stats = {
    total: 12,
    pending: 2,
    inProgress: 1,
    completed: 9
  };

  const recentRequests = [
    { id: 'SR-1004', title: 'Leaking Pipe in Kitchen', date: '2026-09-15', status: 'Pending' },
    { id: 'SR-1003', title: 'AC Not Cooling', date: '2026-09-10', status: 'In Progress' },
    { id: 'SR-1002', title: 'Broken Light Switch', date: '2026-08-22', status: 'Completed' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="badge badge-pending">Pending</span>;
      case 'In Progress': return <span className="badge badge-progress">In Progress</span>;
      case 'Completed': return <span className="badge badge-completed">Completed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-muted">Here is what's happening with your service requests today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Requests</h4>
            <p>{stats.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Pending</h4>
            <p>{stats.pending}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon info">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h4>In Progress</h4>
            <p>{stats.inProgress}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Completed</h4>
            <p>{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Requests</h2>
          <Link to="/customer/requests" className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
            View All
          </Link>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Title</th>
                <th>Date Submitted</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map(req => (
                <tr key={req.id}>
                  <td style={{ fontWeight: 500 }}>{req.id}</td>
                  <td>{req.title}</td>
                  <td>{req.date}</td>
                  <td>{getStatusBadge(req.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

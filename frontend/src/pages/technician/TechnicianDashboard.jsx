import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ClipboardList, Activity, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { technicianService } from '../../services/technicianService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assigned: 0, accepted: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await technicianService.getAssignedRequests({ size: 100 });
        const reqs = response.items || [];
        setStats({
          assigned: reqs.filter(r => r.status === 'ASSIGNED').length,
          accepted: reqs.filter(r => r.status === 'ACCEPTED').length,
          inProgress: reqs.filter(r => r.status === 'IN_PROGRESS').length,
          completed: reqs.filter(r => r.status === 'COMPLETED').length
        });
      } catch (err) {
        console.error("Failed to load technician stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." fullScreen />;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-muted">Here is your current workload.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon warning">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <h4>New Assignments</h4>
            <p>{loading ? '-' : stats.assigned}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>Accepted</h4>
            <p>{loading ? '-' : stats.accepted}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h4>In Progress</h4>
            <p>{loading ? '-' : stats.inProgress}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Completed</h4>
            <p>{loading ? '-' : stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/technician/requests" className="btn btn-primary">View My Work Queue</Link>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;

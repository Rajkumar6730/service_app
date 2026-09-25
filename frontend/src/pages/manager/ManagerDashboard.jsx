import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Wrench, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  Star 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { managerService } from '../../services/managerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await managerService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading analytics..." fullScreen />;
  }

  if (!stats) {
    return <div className="p-4"><Alert type="error" message="Failed to load analytics data." /></div>;
  }

  const STATUS_COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];
  const CATEGORY_COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B'];

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Manager Overview
        </h1>
        <p className="text-muted">Real-time platform statistics and analytics.</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Requests</h4>
            <p>{stats.total_requests}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h4>New & Pending</h4>
            <p>{stats.new_requests}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h4>Completed</h4>
            <p>{stats.completed_requests}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
            <Star size={24} />
          </div>
          <div className="stat-info">
            <h4>Avg Rating</h4>
            <p>{stats.average_rating} / 5.0</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#F3E8FF', color: '#6B21A8' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Customers</h4>
            <p>{stats.total_customers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
            <Wrench size={24} />
          </div>
          <div className="stat-info">
            <h4>Total Technicians</h4>
            <p>{stats.total_technicians}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Request Status Distribution</h2>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            {stats.status_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.status_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {stats.status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No data available</div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Requests by Category</h2>
          </div>
          <div className="card-body" style={{ height: '300px' }}>
            {stats.category_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.category_distribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]}>
                    {stats.category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No data available</div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h2 className="card-title">Monthly Request Volume</h2>
          </div>
          <div className="card-body" style={{ height: '350px' }}>
            {stats.monthly_requests.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthly_requests} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="requests" name="Total Requests" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No data available</div>
            )}
          </div>
        </div>

        {/* Technician Workload */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h2 className="card-title">Active Technician Workload (Assigned & In Progress)</h2>
          </div>
          <div className="card-body" style={{ height: '350px' }}>
            {stats.technician_workload.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.technician_workload} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" name="Active Tasks" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No data available</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;

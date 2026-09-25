import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { requestService } from '../../services/requestService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const CATEGORY_MAP = {
  1: 'General Maintenance',
  2: 'Plumbing',
  3: 'Electrical',
  4: 'Painting',
  5: 'Carpentry',
  6: 'Appliance Repair',
  7: 'HVAC',
  8: 'Cleaning',
  9: 'Pest Control',
  10: 'Other',
};

const MyRequests = () => {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, searchTerm, statusFilter, priorityFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        size: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      };

      const response = await requestService.getMyRequests(params);
      setData(response);
    } catch (err) {
      setError('Failed to fetch your requests.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
      case 'Pending': return <span className="badge badge-pending">Pending</span>;
      case 'ASSIGNED': return <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>Assigned</span>;
      case 'ACCEPTED': return <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>Accepted</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress">In Progress</span>;
      case 'COMPLETED': return <span className="badge badge-completed">Completed</span>;
      default: return <span className="badge" style={{ backgroundColor: '#E5E7EB', color: '#374151' }}>{status}</span>;
    }
  };

  return (
    <div>
      <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>My Requests</h1>
          <p className="text-muted">Track and manage your service requests.</p>
        </div>
        <Link to="/customer/create-request" className="btn btn-primary">
          + New Request
        </Link>
      </div>

      <Alert type="info" message="Editing and deletion are available only within 20 minutes of request creation." />

      <div className="card mb-4" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search title, description, address..."
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ position: 'relative', flex: '1 1 150px' }}>
            <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div style={{ position: 'relative', flex: '1 1 150px' }}>
            <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading && data.items.length === 0 ? (
          <LoadingSpinner text="Loading your requests..." fullScreen={false} />
        ) : error ? (
          <div className="p-4"><Alert type="error" message={error} /></div>
        ) : data.items.length === 0 ? (
          <EmptyState
            title="No Requests Found"
            message="You have no service requests matching your criteria."
            icon={FileX}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Technicians</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>#{req.id}</td>
                      <td>{req.title}</td>
                      <td>{CATEGORY_MAP[req.category_id] || `Cat ${req.category_id}`}</td>
                      <td style={{ fontWeight: 500 }}>{req.priority}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td style={{ fontSize: '0.875rem' }}>
                        {req.technicians && req.technicians.length > 0 
                          ? `${req.technicians.length} Assigned` 
                          : 'Not assigned'}
                      </td>
                      <td className="text-muted">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Link to={`/customer/requests/${req.id}`} state={{ request: req }} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                            View
                          </Link>
                          {['NEW', 'PENDING'].includes(req.status?.toUpperCase()) && (new Date() - new Date(req.created_at + (req.created_at.endsWith('Z') ? '' : 'Z'))) <= 20 * 60 * 1000 && (
                            <>
                              <Link to={`/customer/requests/${req.id}/edit`} state={{ request: req }} className="btn btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                                Edit
                              </Link>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to delete this request?')) {
                                    try {
                                      await requestService.deleteRequest(req.id);
                                      fetchRequests();
                                    } catch (err) {
                                      alert(err.response?.data?.detail || 'Failed to delete request');
                                    }
                                  }
                                }}
                                className="btn"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border)' }}>
              <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                Showing {(data.page - 1) * data.size + 1} to {Math.min(data.page * data.size, data.total)} of {data.total} entries
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-outline"
                  disabled={data.page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="btn btn-outline"
                  disabled={data.page >= data.pages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ padding: '0.25rem 0.5rem' }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyRequests;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Clipboard } from 'lucide-react';
import { technicianService } from '../../services/technicianService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const CATEGORY_MAP = {
  1: 'General Maintenance',
  2: 'Plumbing',
  3: 'Electrical'
};

const AssignedRequests = () => {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        size: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined
      };
      
      const response = await technicianService.getAssignedRequests(params);
      setData(response);
    } catch (err) {
      setError('Failed to fetch assigned requests.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED': return <span className="badge badge-pending">Assigned</span>;
      case 'ACCEPTED': return <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>Accepted</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress">In Progress</span>;
      case 'COMPLETED': return <span className="badge badge-completed">Completed</span>;
      default: return <span className="badge" style={{ backgroundColor: '#E5E7EB', color: '#374151' }}>{status}</span>;
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Assigned Requests</h1>
        <p className="text-muted">Manage the service tasks assigned to you.</p>
      </div>

      <div className="card mb-4" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by ID, Title, or Address..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned (New)</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading && data.items.length === 0 ? (
          <LoadingSpinner text="Loading tasks..." fullScreen={false} />
        ) : error ? (
          <div className="p-4"><Alert type="error" message={error} /></div>
        ) : data.items.length === 0 ? (
          <EmptyState 
            title="No Tasks Found" 
            message="You have no tasks matching your filters." 
            icon={Clipboard}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Address</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>#{req.id}</td>
                      <td>{req.title}</td>
                      <td>{req.address}</td>
                      <td style={{ fontWeight: 500 }}>{req.priority}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td>
                        <Link to={`/technician/requests/${req.id}`} state={{ request: req }} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                          Work Order
                        </Link>
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

export default AssignedRequests;

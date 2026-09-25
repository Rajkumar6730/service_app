import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { managerService } from '../../services/managerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';

const AllRequests = () => {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, searchTerm, statusFilter, priorityFilter, categoryFilter, technicianFilter]);

  const fetchMetadata = async () => {
    try {
      const [cats, techs] = await Promise.all([
        managerService.getCategories(),
        managerService.getTechnicians()
      ]);
      setCategories(cats);
      setTechnicians(techs);
    } catch (err) {
      console.error("Failed to fetch metadata", err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const params = {
        page,
        size: 10,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category_id: categoryFilter || undefined,
        technician_id: technicianFilter || undefined
      };
      
      const response = await managerService.getAllRequests(params);
      setData(response);
    } catch (err) {
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
      case 'Pending': return <span className="badge badge-pending">New</span>;
      case 'ASSIGNED': return <span className="badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>Assigned</span>;
      case 'ACCEPTED': return <span className="badge" style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>Accepted</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress">In Progress</span>;
      case 'COMPLETED': return <span className="badge badge-completed">Completed</span>;
      case 'CANCELLED': return <span className="badge" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>Cancelled</span>;
      default: return <span className="badge" style={{ backgroundColor: '#E5E7EB', color: '#374151' }}>{status}</span>;
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : `Cat ${id}`;
  };

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>All Requests</h1>
        <p className="text-muted">Manage and monitor all platform service requests.</p>
      </div>

      <div className="card mb-4" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', gridColumn: '1 / -1', marginBottom: '0.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by ID, Title, Description, or Address..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}>
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <select className="form-control" style={{ paddingLeft: '2.5rem' }} value={technicianFilter} onChange={(e) => { setTechnicianFilter(e.target.value); setPage(1); }}>
              <option value="">All Technicians</option>
              {technicians.map(t => (
                <option key={t.id} value={t.id}>{t.user.name}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      <div className="card">
        {loading && data.items.length === 0 ? (
          <LoadingSpinner text="Loading requests..." fullScreen={false} />
        ) : error ? (
          <div className="p-4"><Alert type="error" message={error} /></div>
        ) : data.items.length === 0 ? (
          <EmptyState 
            title="No Requests Found" 
            message="No service requests match your advanced filters." 
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
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: 600 }}>#{req.id}</td>
                      <td>{req.title}</td>
                      <td>{getCategoryName(req.category_id)}</td>
                      <td style={{ fontWeight: 500 }}>{req.priority}</td>
                      <td>{getStatusBadge(req.status)}</td>
                      <td className="text-muted">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/manager/requests/${req.id}`} state={{ request: req }} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                          Manage
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

export default AllRequests;

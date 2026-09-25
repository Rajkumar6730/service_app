import React, { useState, useEffect } from 'react';
import { useLocation, Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Activity, FileText, Wrench, Shield, CheckCircle, AlertCircle, Check, AlertTriangle, Users, Edit, Trash2 } from 'lucide-react';
import { managerService } from '../../services/managerService';
import AttachmentCard from '../../components/common/AttachmentCard';

const RequestDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(location.state?.request || null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState([]);

  const [loading, setLoading] = useState(!request);
  const [error, setError] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!request) {
      fetchRequest();
    }
    fetchTechnicians();
  }, [id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const data = await managerService.getRequestById(id);
      setRequest(data);
    } catch (err) {
      setError('Request not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await managerService.getTechnicians();
      setTechnicians(data);
    } catch (err) {
      console.error('Failed to load technicians');
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    setIsUpdating(true);
    setSuccessMsg('');
    setError('');

    try {
      const updated = await managerService.updateRequestPriority(request.id, newPriority);
      setRequest(updated);
      setSuccessMsg(`Priority updated to ${newPriority}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to update priority.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTech = (techId) => {
    setSelectedTechs(prev =>
      prev.includes(techId)
        ? prev.filter(id => id !== techId)
        : [...prev, techId]
    );
  };

  const handleAssignTechnician = async () => {
    if (selectedTechs.length === 0) return;

    const currentAssignedCount = request.technicians ? request.technicians.length : 0;
    if (currentAssignedCount + selectedTechs.length > 6) {
      setError("Maximum 6 technicians can be assigned to one request.");
      return;
    }

    setIsUpdating(true);
    setSuccessMsg('');
    setError('');

    try {
      await managerService.assignTechnician(request.id, selectedTechs);

      await fetchRequest();

      setSuccessMsg('Technician(s) successfully assigned!');
      setSelectedTechs([]);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to assign technician.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) {
      setIsUpdating(true);
      try {
        await managerService.deleteRequest(request.id);
        navigate('/manager/requests');
      } catch (err) {
        setError("Failed to delete request.");
        setIsUpdating(false);
      }
    }
  };

  if (loading) return <div className="p-4">Loading request details...</div>;
  if (error && !request) return <div className="p-4 text-danger">{error}</div>;
  if (!request) return <Navigate to="/manager/requests" replace />;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW':
      case 'Pending': return <span className="badge badge-pending" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Pending</span>;
      case 'ASSIGNED': return <span className="badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem', backgroundColor: '#FEF3C7', color: '#92400E' }}>Assigned</span>;
      case 'ACCEPTED': return <span className="badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem', backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>Accepted</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>In Progress</span>;
      case 'COMPLETED': return <span className="badge badge-completed" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Completed</span>;
      default: return <span className="badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem', backgroundColor: '#E5E7EB', color: '#374151' }}>{status}</span>;
    }
  };

  const priorityColor = {
    'LOW': 'var(--text-muted)',
    'MEDIUM': '#3B82F6',
    'HIGH': '#F59E0B',
    'URGENT': '#EF4444'
  }[request.priority] || 'var(--text-main)';

  return (
    <div>
      <div className="mb-4">
        <Link to="/manager/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Requests
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Request #{request.id}
            </h1>
            <p className="text-muted">{request.title}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => navigate(`/manager/requests/${request.id}/edit`, { state: { request } })}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Edit size={16} /> Edit
            </button>
            <button
              className="btn btn-outline"
              onClick={handleDelete}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', borderColor: '#FCA5A5' }}
            >
              <Trash2 size={16} /> Delete
            </button>
            {getStatusBadge(request.status)}
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Service Details</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Customer ID</p>
                  <p style={{ fontWeight: 500 }}>{request.customer_id}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Category ID</p>
                  <p style={{ fontWeight: 500 }}>{request.category_id}</p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Manage Priority</p>
                  <select
                    className="form-control"
                    value={request.priority}
                    onChange={handlePriorityChange}
                    disabled={isUpdating}
                    style={{ color: priorityColor, fontWeight: 600 }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={16} /> Date Submitted
                  </p>
                  <p style={{ fontWeight: 500 }}>{new Date(request.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={16} /> Service Address
                  </p>
                  <p style={{ fontWeight: 500 }}>{request.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <AttachmentCard attachments={request.attachments} />
        </div>

        {/* Dynamic Assignment / Description Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> Technician Assignment
              </h2>
            </div>
            <div className="card-body">
              {(request.status !== 'COMPLETED') ? (
                (() => {
                  const requestAgeMs = new Date() - new Date(request.created_at + (request.created_at.endsWith('Z') ? '' : 'Z'));
                  const isAssignable = requestAgeMs >= 30 * 60 * 1000;
                  const minutesLeft = Math.ceil((30 * 60 * 1000 - requestAgeMs) / (60 * 1000));

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {/* Assigned Technicians List */}
                      {request.technicians && request.technicians.length > 0 && (
                        <div>
                          <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 600 }}>Currently Assigned:</p>
                          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {request.technicians.map((t, idx) => (
                              <li key={idx} style={{ padding: '0.75rem', backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ fontWeight: 500 }}>{t.name}</span>
                                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#E5E7EB', borderRadius: '1rem' }}>{t.status}</span>
                                </div>
                                <span className="text-muted" style={{ fontSize: '0.875rem' }}>{t.specialization} | {t.phone}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Assignment Controls */}
                      {!isAssignable ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                          <Clock size={18} color="#F59E0B" />
                          <span style={{ fontWeight: 500 }}>More technicians can be assigned in {minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}.</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted mb-3">Select available technicians to assign to this request (Max 6 total).</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                            {technicians.length === 0 ? (
                              <p className="text-muted" style={{ fontSize: '0.875rem' }}>No technicians available.</p>
                            ) : (
                              technicians.map(t => {
                                const isAlreadyAssigned = request.technicians && request.technicians.some(rt => rt.name === t.user.name);
                                return (
                                  <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isAlreadyAssigned ? 'not-allowed' : 'pointer', opacity: isAlreadyAssigned ? 0.5 : 1 }}>
                                    <input
                                      type="checkbox"
                                      checked={selectedTechs.includes(t.id) || isAlreadyAssigned}
                                      onChange={() => toggleTech(t.id)}
                                      disabled={isUpdating || isAlreadyAssigned}
                                      style={{ cursor: isAlreadyAssigned ? 'not-allowed' : 'pointer' }}
                                    />
                                    <span>{t.user.name} ({t.specialization || 'General'} - {t.availability}) {isAlreadyAssigned && <span style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>(Assigned)</span>}</span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={handleAssignTechnician}
                            disabled={selectedTechs.length === 0 || isUpdating}
                          >
                            Assign Selected
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Check size={18} color="var(--status-completed)" />
                    <span style={{ fontWeight: 500 }}>This request is completed. No more technicians can be assigned.</span>
                  </div>
                  {request.technicians && request.technicians.length > 0 && (
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {request.technicians.map((t, idx) => (
                        <li key={idx} style={{ padding: '0.75rem', backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 500 }}>{t.name}</span>
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: '#E5E7EB', borderRadius: '1rem' }}>{t.status}</span>
                          </div>
                          <span className="text-muted" style={{ fontSize: '0.875rem' }}>{t.specialization} | {t.phone}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} /> Description
              </h2>
            </div>
            <div className="card-body">
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{request.description}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RequestDetails;

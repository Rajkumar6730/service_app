import React, { useState, useEffect } from 'react';
import { useLocation, Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, FileText, Check, AlertTriangle } from 'lucide-react';
import { technicianService } from '../../services/technicianService';
import AttachmentCard from '../../components/common/AttachmentCard';

const RequestDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  
  const [request, setRequest] = useState(location.state?.request || null);
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If no state was passed, we'd normally fetch it.
  // For simplicity, we just redirect back if lost.
  if (!request) return <Navigate to="/technician/requests" replace />;

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    setError('');
    setSuccess('');
    
    try {
      const updated = await technicianService.updateRequestStatus(request.id, newStatus, remarks);
      setRequest(updated);
      setSuccess(`Status successfully updated to ${newStatus}`);
      setRemarks(''); // Clear remarks after submission
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED': return <span className="badge badge-pending" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Assigned</span>;
      case 'ACCEPTED': return <span className="badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem', backgroundColor: '#DBEAFE', color: '#1D4ED8' }}>Accepted</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>In Progress</span>;
      case 'COMPLETED': return <span className="badge badge-completed" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Completed</span>;
      default: return <span className="badge" style={{ fontSize: '1rem', padding: '0.5rem 1rem', backgroundColor: '#E5E7EB', color: '#374151' }}>{status}</span>;
    }
  };

  // State Machine UI Buttons
  const renderActionButtons = () => {
    if (request.status === 'ASSIGNED') {
      return (
        <button className="btn btn-primary btn-full" onClick={() => handleStatusUpdate('ACCEPTED')} disabled={isUpdating}>
          {isUpdating ? 'Processing...' : 'Accept Assignment'}
        </button>
      );
    }
    
    if (request.status === 'ACCEPTED') {
      return (
        <button className="btn btn-primary btn-full" onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={isUpdating}>
          {isUpdating ? 'Processing...' : 'Start Work (In Progress)'}
        </button>
      );
    }

    if (request.status === 'IN_PROGRESS') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Service Notes / Remarks</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="What was fixed? Parts used?"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
            ></textarea>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>*Required to mark as completed</small>
          </div>
          <button 
            className="btn btn-primary btn-full" 
            onClick={() => handleStatusUpdate('COMPLETED')} 
            disabled={isUpdating || !remarks.trim()}
            style={{ backgroundColor: 'var(--status-completed)' }}
          >
            {isUpdating ? 'Processing...' : 'Mark as Completed'}
          </button>
        </div>
      );
    }

    return (
      <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No further actions available for this request.
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/technician/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to My Queue
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Work Order #{request.id}
            </h1>
            <p className="text-muted">{request.title}</p>
          </div>
          <div>
            {getStatusBadge(request.status)}
          </div>
        </div>
      </div>

      {success && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} /> {success}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Job Details</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Priority</p>
                <p style={{ fontWeight: 600 }}>{request.priority}</p>
              </div>
              {request.customer_phone && (
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Customer Phone</p>
                  <p style={{ fontWeight: 500 }}>
                    <a href={`tel:${request.customer_phone}`} style={{ textDecoration: 'none', color: 'var(--primary)' }}>
                      {request.customer_phone}
                    </a>
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={16} /> Service Address
                </p>
                <p style={{ fontWeight: 500 }}>{request.address}</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FileText size={16} /> Issue Description
                </p>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                  {request.description}
                </p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <AttachmentCard attachments={request.attachments} />
        </div>

        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h2 className="card-title">Update Status</h2>
          </div>
          <div className="card-body">
            {renderActionButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;

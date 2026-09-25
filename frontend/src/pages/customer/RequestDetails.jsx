import React, { useState } from 'react';
import { useLocation, Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Activity, FileText, Star, MessageSquare, Check } from 'lucide-react';
import { requestService } from '../../services/requestService';
import AttachmentCard from '../../components/common/AttachmentCard';
import Alert from '../../components/common/Alert';

const CATEGORY_MAP = {
  1: 'General Maintenance',
  2: 'Plumbing',
  3: 'Electrical'
};

const RequestDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  
  // Use state so we can mutate the request locally after feedback submission
  const [request, setRequest] = useState(location.state?.request || null);
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  if (!request) {
    return <Navigate to="/customer/requests" replace />;
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setFeedbackError('Please select a star rating.');
      return;
    }
    
    setIsSubmitting(true);
    setFeedbackError('');
    
    try {
      const feedbackData = await requestService.submitFeedback(request.id, { rating, comment });
      setRequest(prev => ({ ...prev, feedback: feedbackData }));
      setFeedbackSuccess('Thank you! Your feedback has been submitted successfully.');
    } catch (err) {
      setFeedbackError(err.response?.data?.detail || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
  
  const getTimelineText = (status) => {
    switch (status) {
      case 'NEW': return 'New Request Logged';
      case 'ASSIGNED': return 'Technician Assigned';
      case 'ACCEPTED': return 'Technician Accepted';
      case 'IN_PROGRESS': return 'Work Started';
      case 'COMPLETED': return 'Work Completed';
      default: return status;
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
        <Link to="/customer/requests" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '1rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Requests
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Request #{request.id}
            </h1>
            <p className="text-muted">{request.title}</p>
          </div>
          <div>
            {getStatusBadge(request.status)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Service Details</h2>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Category</p>
                  <p style={{ fontWeight: 500 }}>{CATEGORY_MAP[request.category_id] || `Category ${request.category_id}`}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Priority</p>
                  <p style={{ fontWeight: 600, color: priorityColor }}>{request.priority}</p>
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

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Assigned Technician(s)</h2>
            </div>
            <div className="card-body">
              {!request.technicians || request.technicians.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Technician: Not assigned</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{request.technicians.length} Technician{request.technicians.length > 1 ? 's' : ''} Assigned</p>
                  {request.technicians.map((tech, idx) => {
                    const isAcceptedOrBeyond = ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(tech.status);
                    return (
                      <div key={idx} style={{ padding: '1rem', backgroundColor: '#F9FAFB', border: '1px solid var(--border)', borderRadius: '0.5rem', display: 'grid', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Technician</p>
                            <p style={{ fontWeight: 500 }}>{tech.name}</p>
                          </div>
                          <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', backgroundColor: '#E5E7EB', borderRadius: '1rem', fontWeight: 600 }}>{tech.status}</span>
                        </div>
                        {isAcceptedOrBeyond && tech.phone && (
                          <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Phone</p>
                            <p style={{ fontWeight: 500 }}>{tech.phone}</p>
                          </div>
                        )}
                        {isAcceptedOrBeyond && tech.specialization && (
                          <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Specialization</p>
                            <p style={{ fontWeight: 500 }}>{tech.specialization}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
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

          {/* Attachments */}
          <AttachmentCard attachments={request.attachments} />
        </div>

        {/* Timeline & Feedback Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Feedback Module (Only shows if Completed) */}
          {request.status === 'COMPLETED' && (
            <div className="card" style={{ borderLeft: '4px solid #F59E0B' }}>
              <div className="card-header">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={20} color="#F59E0B" /> Customer Feedback
                </h2>
              </div>
              <div className="card-body">
                {request.feedback || feedbackSuccess ? (
                  <div>
                    <Alert type="success" message={feedbackSuccess} />
                    <p className="text-muted mb-2">You rated this service:</p>
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={24} fill={star <= request.feedback.rating ? "#F59E0B" : "none"} color={star <= request.feedback.rating ? "#F59E0B" : "var(--border)"} />
                      ))}
                    </div>
                    {request.feedback.comment && (
                      <div style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-main)' }}>"{request.feedback.comment}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit}>
                    <p className="text-muted mb-3">How was your service? Please leave a rating and comment.</p>
                    
                    <Alert type="error" message={feedbackError} />
                    
                    <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <div 
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <Star 
                            size={32} 
                            fill={(hoverRating || rating) >= star ? "#F59E0B" : "none"} 
                            color={(hoverRating || rating) >= star ? "#F59E0B" : "var(--border)"} 
                            style={{ transition: 'all 0.2s ease' }}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MessageSquare size={16} /> Comment (Optional)
                      </label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        placeholder="Tell us about your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      ></textarea>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B' }} disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="card-header">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} /> Request Timeline
              </h2>
            </div>
            <div className="card-body">
              {(!request.status_history || request.status_history.length === 0) ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '0.25rem' }}></div>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600 }}>New Request Logged</p>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>{new Date(request.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {request.status_history.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).map((hist, index) => (
                    <div key={hist.id} style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '0.25rem' }}></div>
                        {index < request.status_history.length - 1 && (
                          <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border)', minHeight: '40px', margin: '4px 0' }}></div>
                        )}
                      </div>
                      <div style={{ paddingBottom: index < request.status_history.length - 1 ? '1.5rem' : '0' }}>
                        <p style={{ fontWeight: 600 }}>{getTimelineText(hist.status)}</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {new Date(hist.created_at).toLocaleString()}
                        </p>
                        {hist.remarks && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontStyle: 'italic', padding: '0.5rem', backgroundColor: '#F9FAFB', borderRadius: '0.25rem', border: '1px solid var(--border)' }}>
                            "{hist.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RequestDetails;

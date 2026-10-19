import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';

const TaskAssignmentPopup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeNotification, setActiveNotification] = useState(null);
  const dismissedIdsRef = useRef(new Set());

  // Load previously dismissed notification IDs from localStorage for this technician
  useEffect(() => {
    if (!user?.id) return;
    try {
      const stored = localStorage.getItem(`dismissed_task_notifs_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dismissedIdsRef.current = new Set(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse dismissed notification IDs', e);
    }
  }, [user?.id]);

  const checkNotifications = async () => {
    if (!user || user.role !== 'TECHNICIAN') return;
    try {
      const data = await notificationService.getNotifications();
      if (!Array.isArray(data)) return;

      // Find the most recent unread assignment notification that hasn't been dismissed
      const newAssignment = data.find(n => 
        !n.is_read &&
        (n.notification_type === 'TASK_ASSIGNED' || n.title === 'New Task Assigned' || n.message?.includes('New task assigned')) &&
        !dismissedIdsRef.current.has(n.id)
      );

      if (newAssignment) {
        setActiveNotification(newAssignment);
      }
    } catch (err) {
      console.error('Error fetching technician task notifications:', err);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'TECHNICIAN') return;

    // Check immediately on mount
    checkNotifications();

    // Poll every 20 seconds while technician portal is open
    const interval = setInterval(checkNotifications, 20000);

    return () => clearInterval(interval);
  }, [user]);

  const handleDismiss = () => {
    if (!activeNotification) return;
    const notifId = activeNotification.id;

    // Persist to dismissed set & localStorage so it does not reappear on refresh
    dismissedIdsRef.current.add(notifId);
    if (user?.id) {
      try {
        localStorage.setItem(
          `dismissed_task_notifs_${user.id}`,
          JSON.stringify(Array.from(dismissedIdsRef.current))
        );
      } catch (e) {
        console.error('Failed to save dismissed notification ID', e);
      }
    }

    setActiveNotification(null);
  };

  const handleViewTask = async () => {
    if (!activeNotification) return;
    const reqId = activeNotification.request_id;
    const notifId = activeNotification.id;

    handleDismiss();
    try {
      await notificationService.markAsRead(notifId);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }

    if (reqId) {
      navigate(`/technician/requests/${reqId}`);
    } else {
      navigate('/technician/requests');
    }
  };

  if (!activeNotification) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100% - 3rem)',
        backgroundColor: 'var(--surface, #ffffff)',
        border: '1px solid var(--border, #E5E7EB)',
        borderLeft: '5px solid var(--primary, #2563EB)',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '1.25rem'
      }}
      role="alert"
      aria-live="assertive"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Bell size={18} />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main, #111827)' }}>
            Assignment Alert
          </span>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #6B7280)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.25rem'
          }}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>

      <p style={{ margin: '0 0 1rem 0', fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-main, #1F2937)', lineHeight: 1.4 }}>
        🔔 New task assigned! Please check it out.
      </p>

      {activeNotification.request_id && (
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-muted, #6B7280)' }}>
          Request Reference: #{activeNotification.request_id}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          onClick={handleDismiss}
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
        >
          Dismiss
        </button>
        <button
          onClick={handleViewTask}
          className="btn btn-primary"
          style={{
            padding: '0.35rem 0.85rem',
            fontSize: '0.85rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          View Task <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default TaskAssignmentPopup;

import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state instead of refetching for speed
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <div className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Notifications</h1>
          <p className="text-muted">Stay up to date with your account activity.</p>
        </div>
        {unreadCount > 0 && (
          <span className="badge badge-pending" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
            {unreadCount} Unread
          </span>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
            <h3>All Caught Up!</h3>
            <p className="text-muted">You have no notifications.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((n, index) => (
              <div 
                key={n.id} 
                style={{ 
                  padding: '1.5rem', 
                  borderBottom: index < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                  backgroundColor: n.is_read ? 'transparent' : '#F0F9FF',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: n.is_read ? '#F3F4F6' : '#DBEAFE', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: n.is_read ? '#9CA3AF' : '#2563EB'
                }}>
                  <Bell size={20} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: n.is_read ? 500 : 600, color: 'var(--text-main)' }}>
                      {n.title}
                    </h3>
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ color: n.is_read ? 'var(--text-muted)' : '#1F2937', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                </div>

                {!n.is_read && (
                  <button 
                    onClick={() => handleMarkAsRead(n.id)}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    title="Mark as read"
                  >
                    <Check size={16} /> Mark Read
                  </button>
                )}
                
                {n.is_read && (
                  <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', color: '#10B981' }}>
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

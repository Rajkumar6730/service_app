import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: { bg: '#D1FAE5', color: '#065F46', border: '#34D399', icon: CheckCircle },
    error: { bg: '#FEE2E2', color: '#B91C1C', border: '#F87171', icon: AlertCircle },
    info: { bg: '#DBEAFE', color: '#1D4ED8', border: '#60A5FA', icon: Info },
  };

  const currentStyle = styles[type] || styles.info;
  const Icon = currentStyle.icon;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem', 
      backgroundColor: currentStyle.bg, 
      color: currentStyle.color, 
      padding: '1rem', 
      borderRadius: '0.5rem', 
      border: `1px solid ${currentStyle.border}`,
      marginBottom: '1rem',
      position: 'relative'
    }}>
      <Icon size={20} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '0.875rem', fontWeight: 500, flex: 1 }}>{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.25rem' }}
          aria-label="Close alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;

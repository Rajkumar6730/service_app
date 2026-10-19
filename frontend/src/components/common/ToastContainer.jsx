import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastItem = ({ toast, onRemove }) => {
  const { id, type, title, message } = toast;

  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: '#10B981',
      className: 'toast-popup toast-success'
    },
    error: {
      icon: AlertCircle,
      iconColor: '#EF4444',
      className: 'toast-popup toast-error'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: '#F59E0B',
      className: 'toast-popup toast-warning'
    },
    info: {
      icon: Info,
      iconColor: '#3B82F6',
      className: 'toast-popup toast-info'
    }
  };

  const current = config[type] || config.info;
  const IconComponent = current.icon;

  return (
    <div className={current.className} role="alert" aria-live="assertive">
      <div className="toast-icon">
        <IconComponent size={22} color={current.iconColor} />
      </div>
      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
      <button 
        type="button" 
        className="toast-close" 
        onClick={() => onRemove(id)}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

export default ToastContainer;

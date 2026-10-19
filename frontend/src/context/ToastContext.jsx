import React, { createContext, useState, useCallback, useMemo } from 'react';
import ToastContainer from '../components/common/ToastContainer';

export const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = '', duration = 4500) => {
    const id = ++toastIdCounter;
    
    // Default titles based on type if not provided
    let defaultTitle = title;
    if (!defaultTitle) {
      if (type === 'success') defaultTitle = 'Success';
      else if (type === 'error') defaultTitle = 'Error';
      else if (type === 'warning') defaultTitle = 'Notice';
      else defaultTitle = 'Information';
    }

    const newToast = { id, message, type, title: defaultTitle, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = useMemo(() => ({
    success: (msg, title, duration) => showToast(msg, 'success', title, duration),
    error: (msg, title, duration) => showToast(msg, 'error', title, duration),
    info: (msg, title, duration) => showToast(msg, 'info', title, duration),
    warning: (msg, title, duration) => showToast(msg, 'warning', title, duration),
    dismiss: removeToast
  }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

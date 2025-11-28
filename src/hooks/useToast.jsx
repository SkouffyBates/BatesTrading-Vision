import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ToastContainer } from '../components/Common/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', ttl = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    setToasts((s) => [toast, ...s]);
    if (ttl > 0) setTimeout(() => removeToast(id), ttl);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((s) => s.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { msg, type, ttl } = e.detail || {};
      if (msg) addToast(msg, type, ttl);
    };
    window.addEventListener('__toast_request', handler);
    return () => window.removeEventListener('__toast_request', handler);
  }, [addToast]);

  useEffect(() => {
    const old = window.__addToast;
    window.__addToast = addToast;
    return () => {
      window.__addToast = old;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};

export default useToast;

// Expose a global helper for quick calls from non-react code (best-effort)
// ToastProvider sets `window.__addToast` when mounted.

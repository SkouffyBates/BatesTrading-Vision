import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  const { id, type, message } = toast;
  const icons = {
    success: <CheckCircle className="text-emerald-400" />,
    error: <XCircle className="text-red-400" />,
    info: <Info className="text-cyan-400" />,
  };

  return (
    <div className={`toast-item flex items-center gap-3 p-3 rounded shadow-lg mb-2 bg-slate-900 border border-slate-700`}>
      <div className="w-6 h-6">{icons[type] || icons.info}</div>
      <div className="flex-1 text-sm text-slate-200">{message}</div>
      <button onClick={() => onClose(id)} className="text-slate-400 hover:text-white">✕</button>
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed right-4 top-4 z-50 w-96 max-w-full">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={removeToast} />
      ))}
    </div>
  );
};

export default Toast;

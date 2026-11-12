import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-white border-l-4 border-status-info text-risova-text-main';
        let icon = <Info className="w-5 h-5 text-status-info shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-white border-l-4 border-status-success text-risova-text-main shadow-lg';
          icon = <CheckCircle className="w-5 h-5 text-status-success shrink-0" />;
        } else if (toast.type === 'danger') {
          bg = 'bg-red-50 border-l-4 border-status-danger text-red-900 shadow-xl animate-bounce-short';
          icon = <AlertOctagon className="w-5 h-5 text-status-danger shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-l-4 border-status-warning text-amber-900 shadow-lg';
          icon = <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg shadow-md border border-slate-200 transition-all transform translate-y-0 ${bg}`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium leading-tight">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}


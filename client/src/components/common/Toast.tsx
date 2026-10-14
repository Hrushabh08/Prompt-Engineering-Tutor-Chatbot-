import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type = 'success', message, onClose }) => {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
        type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : type === 'error'
          ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
      }`}
    >
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
      {type === 'info' && <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="p-0.5 hover:opacity-75 transition-opacity text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

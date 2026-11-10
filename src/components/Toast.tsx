'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, X, Undo2 } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  onUndo?: () => void;
  undoLabel?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || (toast.onUndo ? 7000 : 4000);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />;
      case 'info':
        return <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;
      case 'success':
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative pointer-events-auto bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700/80 p-3.5 pb-4 flex flex-col gap-2 overflow-hidden animate-toast-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {getIcon()}
          <div>
            <h4 className="text-xs font-bold text-slate-100">{toast.title}</h4>
            {toast.description && (
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toast.description}</p>
            )}
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {toast.onUndo && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">¿Fue un toque accidental?</span>
          <button
            onClick={() => {
              toast.onUndo?.();
              onDismiss();
            }}
            className="group flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all active:scale-95 shadow"
          >
            <Undo2 className="w-3.5 h-3.5 stroke-[2.5] transition-transform duration-150 group-hover:-rotate-45" />
            {toast.undoLabel || 'Deshacer cambio'}
          </button>
        </div>
      )}

      {/* Barra de progreso de auto-cierre */}
      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
        <div
          className={`h-full transition-all duration-75 ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

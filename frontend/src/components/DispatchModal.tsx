import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Truck, X, Loader2 } from 'lucide-react';
import type { DispatchStep } from '../api/client';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: DispatchStep[];
  truckId: string;
  estimatedArrival: string;
  alertStatus: string;
}

export default function DispatchModal({
  isOpen,
  onClose,
  steps,
  truckId,
  estimatedArrival,
  alertStatus,
}: DispatchModalProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const reset = useCallback(() => {
    setVisibleCount(0);
    setAllDone(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }

    if (steps.length === 0) return;

    if (visibleCount < steps.length) {
      const timer = setTimeout(() => {
        setVisibleCount((c) => c + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const doneTimer = setTimeout(() => setAllDone(true), 600);
      return () => clearTimeout(doneTimer);
    }
  }, [isOpen, visibleCount, steps.length, reset]);

  if (!isOpen) return null;

  return (
    <div
      id="dispatch-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal Card */}
      <div
        id="dispatch-modal"
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Agent Auto-Dispatch</h2>
            <p className="text-xs text-slate-500 mt-0.5">Autonomous dispatch sequence</p>
          </div>
          <button
            id="dispatch-modal-close"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-3 max-h-[360px] overflow-y-auto">
          {steps.slice(0, visibleCount).map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-status-green" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{step.step}</p>
                <p className="text-xs text-slate-400 mt-0.5">{step.timestamp}</p>
              </div>
            </div>
          ))}

          {/* Loading next step */}
          {visibleCount < steps.length && (
            <div className="flex items-center gap-3 pl-1">
              <Loader2 className="w-5 h-5 text-pcmc-blue animate-spin" />
              <span className="text-sm text-slate-400">Processing…</span>
            </div>
          )}
        </div>

        {/* Success Banner */}
        {allDone && (
          <div className="mx-6 mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-status-green/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-status-green" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Dispatch Successful
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Truck <span className="font-semibold text-pcmc-blue">{truckId}</span> • ETA{' '}
                  <span className="font-semibold">{estimatedArrival}</span>
                </p>
              </div>
            </div>
            {alertStatus && (
              <p className="text-xs text-slate-500 mt-2">
                Alert Status: <span className="font-semibold capitalize">{alertStatus}</span>
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            id="dispatch-modal-close-btn"
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            {allDone ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

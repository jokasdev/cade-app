import { CircleCheck, CircleExclamationPoint, Info, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext, type ToastOptions, type ToastType } from './toastContext';
import './Toast.css';

interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
}

const DURATION_MS = 5_000;

const ICONS: Record<ToastType, ReactNode> = {
  success: <CircleCheck aria-hidden="true" />,
  error: <CircleExclamationPoint aria-hidden="true" />,
  info: <Info aria-hidden="true" />,
};

/** Mensagens rápidas de sucesso e erro, anunciadas por leitores de tela. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const notify = useCallback(
    ({ type = 'success', title, message }: ToastOptions) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, type, title, message }]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DURATION_MS),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <span className="toast__icon">{ICONS[toast.type]}</span>
            <div className="toast__content">
              {toast.title && <strong className="toast__title">{toast.title}</strong>}
              <span>{toast.message}</span>
            </div>
            <button type="button" className="toast__close" aria-label="Fechar mensagem" onClick={() => dismiss(toast.id)}>
              <X aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

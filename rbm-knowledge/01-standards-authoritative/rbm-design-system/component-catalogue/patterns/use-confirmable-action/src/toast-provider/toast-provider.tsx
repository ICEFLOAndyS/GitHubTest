import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cx } from "../utils/cx";
import "./toast.css";

export type ToastIntent = "info" | "success" | "warning" | "critical";

export interface Toast {
  id: string;
  intent: ToastIntent;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastApi {
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

function newId(): string {
  return `toast-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = newId();
      const toast: Toast = { id, durationMs: 4500, ...t };
      setToasts((prev) => [toast, ...prev].slice(0, 5));

      const duration = toast.durationMs ?? 4500;
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(() => ({ push, dismiss, clear }), [push, dismiss, clear]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="rbm-toastHost" role="region" aria-label="Notifications">
        <ol className="rbm-toastList" aria-live="polite" aria-relevant="additions removals">
          {toasts.map((t) => (
            <li key={t.id} className={cx("rbm-toast", `rbm-toast--${t.intent}`)} role="status">
              <div className="rbm-toast__main">
                <div className="rbm-toast__title">{t.title}</div>
                {t.message ? <div className="rbm-toast__msg">{t.message}</div> : null}
              </div>
              <button
                type="button"
                className={cx("rbm-toast__close", "rbm-focus")}
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </li>
          ))}
        </ol>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────

export type ToastType = "success" | "info" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  exiting?: boolean;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

// ─── Context ────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────────────

const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    // Mark as exiting for animation, then remove after animation completes
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = nextId.current++;
      setToasts((prev) => {
        let next = [...prev, { id, message, type }];
        // If we exceed max, dismiss the oldest
        if (next.filter((t) => !t.exiting).length > MAX_VISIBLE) {
          const oldest = next.find((t) => !t.exiting);
          if (oldest) {
            next = next.map((t) =>
              t.id === oldest.id ? { ...t, exiting: true } : t,
            );
            setTimeout(() => {
              setToasts((p) => p.filter((t) => t.id !== oldest.id));
            }, 200);
          }
        }
        return next;
      });

      // Auto-dismiss after 3s
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Individual Toast ───────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`pointer-events-auto card-editorial rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg max-w-sm relative ${
        toast.exiting ? "animate-slide-out-right" : "animate-slide-in-right"
      }`}
      style={{ boxShadow: "var(--shadow-lg)" }}
      role="alert"
    >
      <ToastIcon type={toast.type} />
      <span className="flex-1 text-sm font-medium text-[var(--fg)]">
        {toast.message}
      </span>
      <button
        onClick={onDismiss}
        className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors duration-200 flex-shrink-0 p-0.5"
        aria-label="Dismiss"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>
      {/* Progress bar */}
      {!toast.exiting && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
          <div
            className="h-full rounded-b-xl"
            style={{
              background: toast.type === "success"
                ? "#10b981"
                : toast.type === "error"
                  ? "#ef4444"
                  : "var(--accent)",
              animation: "shrink-width 3s linear forwards",
            }}
          />
        </div>
      )}
    </div>
  );
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") {
    return (
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 7.5l3 3 7-7" />
        </svg>
      </div>
    );
  }
  if (type === "error") {
    return (
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 4l6 6M10 4l-6 6" />
        </svg>
      </div>
    );
  }
  // info
  return (
    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--accent-light)] border border-[var(--accent-muted)] flex items-center justify-center">
      <span className="text-xs font-bold text-[var(--accent)]">i</span>
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number; // milliseconds
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  toast: () => {},
});

export const useToast = () => React.useContext(ToastContext);

export const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback((opts: ToastOptions) => {
    const id = crypto.randomUUID();
    const duration = opts.duration ?? 3000;
    setToasts((prev) => [...prev, { id, type: "info", ...opts, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "max-w-sm w-full rounded-md p-4 shadow-lg text-white font-medium",
              t.type === "success" && "bg-green-500",
              t.type === "error" && "bg-red-500",
              t.type === "warning" && "bg-yellow-500 text-black",
              t.type === "info" && "bg-blue-500"
            )}
          >
            {t.title && <div className="mb-1">{t.title}</div>}
            {t.description && (
              <div className="text-sm opacity-90">{t.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

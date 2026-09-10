import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const ToastContext = createContext<{ show: (message: string, kind?: ToastKind) => void }>({
  show: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS: Record<ToastKind, string> = {
  success: "text-safe border-safe/30",
  error: "text-alert border-alert/30",
  info: "text-signal border-signal/30",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div
              key={t.id}
              className={`glass-card pointer-events-auto flex items-center gap-2.5 border px-4 py-3 text-sm text-mist shadow-lg ${COLORS[t.kind]}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

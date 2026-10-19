import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../lib/format';

type ToastTone = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; tone: ToastTone }
type PushToast = (message: string, tone?: ToastTone) => void;

const ToastContext = createContext<PushToast>(() => undefined);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const STYLES: Record<ToastTone, string> = {
  success: 'border-emerald-500/30 text-emerald-200',
  error: 'border-red-500/30 text-red-200',
  info: 'border-sky-500/30 text-sky-200',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback<PushToast>((message, tone = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="no-print pointer-events-none fixed bottom-5 left-5 z-[70] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div
              key={t.id}
              className={cn(
                'animate-toast pointer-events-auto flex items-start gap-3 rounded-xl border bg-[#0B1430]/95 px-4 py-3 text-sm shadow-2xl shadow-black/50 backdrop-blur',
                `toast-${t.tone}`,
                STYLES[t.tone],
              )}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="leading-relaxed">{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

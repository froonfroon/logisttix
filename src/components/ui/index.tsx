import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/format';
import { STATUS_META, type Tone } from '../../lib/orderStatus';
import type { OrderStatus } from '../../types';

/* ---------------------------------- Badge --------------------------------- */

const TONES: Record<Tone, string> = {
  slate: 'bg-slate-500/10 text-slate-300 ring-slate-500/25',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
  blue: 'bg-sky-500/10 text-sky-300 ring-sky-500/25',
  violet: 'bg-violet-500/10 text-violet-300 ring-violet-500/25',
  indigo: 'bg-indigo-500/10 text-indigo-300 ring-indigo-500/25',
  cyan: 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/25',
  orange: 'bg-orange-500/10 text-orange-300 ring-orange-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  red: 'bg-red-500/10 text-red-300 ring-red-500/25',
};

export function Badge({ tone = 'slate', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', TONES[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge tone={meta.tone}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  );
}

/* --------------------------------- Button --------------------------------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
const VARIANTS: Record<Variant, string> = {
  primary: 'btn-primary bg-gradient-to-l from-[#FA541C] to-[#FF8A00] text-white shadow-lg shadow-orange-600/25 hover:brightness-110',
  secondary: 'btn-secondary bg-white/[0.04] text-slate-200 ring-1 ring-inset ring-white/10 hover:bg-white/[0.08]',
  ghost: 'btn-ghost text-slate-400 hover:text-white hover:bg-white/[0.05]',
  danger: 'btn-danger bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/30 hover:bg-red-500/20',
  success: 'btn-success bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  icon?: LucideIcon;
}

export function Button({ variant = 'secondary', size = 'md', icon: Icon, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-[13px]',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
    </button>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-white/[0.06] bg-[#0A1228]/80 shadow-xl shadow-black/20', className)}>{children}</div>;
}

export function CardHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------- PageHeader ------------------------------- */

export function PageHeader({ icon: Icon, title, description, actions }: { icon: LucideIcon; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">{title}</h1>
          {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* -------------------------------- StatCard -------------------------------- */

const STAT_ICON: Record<Tone, string> = {
  slate: 'text-slate-300 bg-slate-500/10', amber: 'text-amber-300 bg-amber-500/10', blue: 'text-sky-300 bg-sky-500/10',
  violet: 'text-violet-300 bg-violet-500/10', indigo: 'text-indigo-300 bg-indigo-500/10', cyan: 'text-cyan-300 bg-cyan-500/10',
  orange: 'text-orange-300 bg-orange-500/10', emerald: 'text-emerald-300 bg-emerald-500/10', red: 'text-red-300 bg-red-500/10',
};

export function StatCard({ label, value, hint, icon: Icon, tone = 'orange' }: { label: string; value: ReactNode; hint?: ReactNode; icon: LucideIcon; tone?: Tone }) {
  return (
    <Card className="stat-card group relative overflow-hidden p-5 transition-colors hover:border-orange-500/25">
      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-orange-500/5 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="stat-card-label text-xs font-semibold text-slate-400">{label}</span>
        <span className={cn('grid h-9 w-9 place-items-center rounded-xl', STAT_ICON[tone])}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="stat-card-value mt-3 font-mono text-2xl font-extrabold tracking-tight text-white">{value}</div>
      {hint && <div className="stat-card-hint mt-1.5 text-[11px] text-slate-400">{hint}</div>}
    </Card>
  );
}

/* ---------------------------------- Tabs ---------------------------------- */

export interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: LucideIcon;
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto no-scrollbar scrollbar-none pb-0.5 max-w-full', className)}>
      <div className="tabs-container inline-flex items-center gap-1.5 rounded-2xl bg-[#0A1228]/90 p-1.5 ring-1 ring-inset ring-white/[0.08] shadow-sm min-w-full sm:min-w-0">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(t.id)}
              className={cn(
                'tab-button flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer',
                isActive
                  ? 'tab-button-active bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25'
                  : 'tab-button-inactive text-slate-300 hover:text-white hover:bg-white/[0.05]',
              )}
            >
              {Icon && <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />}
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={cn(
                    'tab-count rounded-full px-1.5 py-0.5 text-[10px] font-mono leading-none',
                    isActive ? 'bg-white/25 text-white' : 'bg-white/[0.08] text-slate-300',
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- Table --------------------------------- */

export function Table({ columns, children, empty, isEmpty }: { columns: string[]; children: ReactNode; empty?: string; isEmpty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-xs">
        <thead>
          <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-wide text-slate-400">
            {columns.map((c, i) => (
              <th key={c || i} className="whitespace-nowrap px-4 py-3 font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-14 text-center text-sm text-slate-500">{empty ?? 'لا توجد بيانات'}</td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export const rowClass = 'transition-colors hover:bg-white/[0.025]';
export const tdClass = 'px-4 py-3.5 align-middle';

/* ---------------------------------- Form ---------------------------------- */

export const inputClass =
  'h-10 w-full rounded-xl border border-white/[0.08] bg-[#060B19] px-3 text-[13px] text-white placeholder:text-slate-500 outline-none transition focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500">{hint}</span>}
    </label>
  );
}

/* ---------------------------------- Modal --------------------------------- */

const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-4xl' };

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  size?: keyof typeof SIZES;
  headerExtra?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Modal({ open, onClose, title, subtitle, icon: Icon, size = 'md', headerExtra, footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#02050d]/80 p-3 sm:p-4 backdrop-blur-sm sm:items-center" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        className={cn('animate-pop my-3 sm:my-5 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0A1228] shadow-2xl shadow-black/60', SIZES[size])}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#070D1F] px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20">
                <Icon className="h-4.5 w-4.5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm sm:text-base font-bold text-white">{title}</h3>
              {subtitle && <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerExtra}
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="إغلاق">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
        <div className="max-h-[68vh] overflow-y-auto p-4 sm:p-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-[#070D1F] px-4 py-3 sm:px-5 sm:py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------------- Barcode -------------------------------- */

/** Deterministic visual barcode (Code-128 look) rendered as crisp SVG. */
export function Barcode({ value, height = 56, className }: { value: string; height?: number; className?: string }) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  const pattern = [2, 1, 1, 2, ...value.split('').flatMap((ch) => {
    const c = ch.charCodeAt(0);
    return [1 + (c % 3), 1 + ((c >> 2) % 2), 1 + ((c >> 3) % 3), 1 + ((c >> 1) % 2)];
  }), 2, 3, 1, 1];
  pattern.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ x, w });
    x += w;
  });
  return (
    <svg viewBox={`0 0 ${x} ${height}`} preserveAspectRatio="none" className={cn('w-full', className)} style={{ height }}>
      {bars.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="currentColor" />)}
    </svg>
  );
}

import {
  ArrowDownToLine,
  Boxes,
  Calculator,
  KeyRound,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  Warehouse,
  RotateCcw,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/format';

export type NavId =
  | 'dashboard' | 'orders' | 'warehouse' | 'drivers' | 'finance' | 'pricing' | 'merchants' | 'reports' | 'audit' | 'roles' | 'settings'
  | 'm-dashboard' | 'm-orders' | 'm-inventory' | 'm-inbound' | 'm-returns' | 'm-wallet' | 'm-invoices' | 'm-reports' | 'm-team' | 'm-api' | 'm-settings';

interface NavItem { id: NavId; label: string; icon: LucideIcon; perm?: string; badge?: number }

export function useNavItems(): NavItem[] {
  const { portal, can, activeMerchantId } = useAuth();
  const { state } = useData();

  if (portal === 'MERCHANT') {
    const mine = state.orders.filter((o) => o.merchantId === activeMerchantId && !['DELIVERED', 'RETURNED', 'CANCELLED'].includes(o.status));
    const pendingReturnsCount = state.returns.filter((r) => r.merchantId === activeMerchantId && r.inspectionStatus === 'PENDING_INSPECTION').length;
    const unpaidInvoicesCount = state.invoices.filter((i) => i.merchantId === activeMerchantId && i.status !== 'PAID').length;

    const items: NavItem[] = [
      { id: 'm-dashboard', label: 'لوحة المتجر', icon: LayoutDashboard },
      { id: 'm-orders', label: 'الشحنات', icon: ShoppingBag, perm: 'm.orders', badge: mine.length },
      { id: 'm-inventory', label: 'المنتجات والأرصدة', icon: Boxes, perm: 'm.inventory' },
      { id: 'm-inbound', label: 'طلبات التوريد', icon: ArrowDownToLine, perm: 'm.inbound' },
      { id: 'm-returns', label: 'المرتجعات وفحص QC', icon: RotateCcw, perm: 'm.orders', badge: pendingReturnsCount },
      { id: 'm-wallet', label: 'المحفظة والسحب', icon: Wallet, perm: 'm.wallet' },
      { id: 'm-invoices', label: 'فواتير التسوية', icon: FileText, perm: 'm.wallet', badge: unpaidInvoicesCount },
      { id: 'm-reports', label: 'التقارير وذكاء الأعمال BI', icon: BarChart3, perm: 'm.dashboard' },
      { id: 'm-team', label: 'فريق العمل والصلاحيات', icon: Users, perm: 'm.dashboard' },
      { id: 'm-api', label: 'الربط البرمجي API', icon: KeyRound, perm: 'm.api' },
      { id: 'm-settings', label: 'إعدادات المتجر', icon: Settings, perm: 'm.dashboard' },
    ];
    return items.filter((i) => !i.perm || can(i.perm));
  }

  const items: NavItem[] = [
    { id: 'dashboard', label: 'لوحة القيادة التنفيذية', icon: LayoutDashboard },
    { id: 'orders', label: 'الطلبات والشحنات', icon: ShoppingBag, perm: 'orders.view', badge: state.orders.filter((o) => o.status === 'PENDING').length },
    { id: 'warehouse', label: 'المستودعات والتجهيز WMS', icon: Warehouse, perm: 'warehouse.inventory.view', badge: state.inbounds.filter((i) => i.status !== 'CONFIRMED' && i.status !== 'REJECTED').length },
    { id: 'drivers', label: 'الأسطول وكشوف التوزيع', icon: Users, perm: 'drivers.view' },
    { id: 'finance', label: 'المالية والخزينة', icon: Wallet, perm: 'finance.overview.view', badge: state.payouts.filter((p) => p.status === 'PENDING' || p.status === 'APPROVED').length },
    { id: 'pricing', label: 'المناطق والتسعير', icon: Calculator, perm: 'pricing.view' },
    { id: 'merchants', label: 'التجار والمتاجر', icon: Store, perm: 'merchants.view' },
    { id: 'reports', label: 'التقارير والتحليلات BI', icon: BarChart3, perm: 'finance.overview.view' },
    { id: 'audit', label: 'سجل الرقابة والتدقيق', icon: ShieldAlert, perm: 'audit.view' },
    { id: 'roles', label: 'الأدوار والصلاحيات', icon: ShieldCheck, perm: 'system.roles.manage' },
    { id: 'settings', label: 'إعدادات المنظومة', icon: Settings, perm: 'system.roles.manage' },
  ];
  return items.filter((i) => !i.perm || can(i.perm));
}

interface SidebarProps { active: NavId; onNavigate: (id: NavId) => void; mobileOpen: boolean; onCloseMobile: () => void }

export function Sidebar({ active, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  const { portal, logout } = useAuth();
  const toast = useToast();
  const items = useNavItems();

  return (
    <>
      {mobileOpen && <div className="no-print fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={cn(
          'no-print fixed bottom-0 right-0 top-16 z-30 flex w-64 flex-col justify-between border-l border-white/[0.06] bg-[#070D1F]/95 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <nav className="space-y-1 overflow-y-auto p-3">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            {portal === 'ADMIN' ? 'مركز العمليات' : 'بوابة التاجر'}
          </div>
          {items.map(({ id, label, icon: Icon, badge }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onCloseMobile(); }}
                className={cn(
                  'sidebar-nav-btn group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all',
                  isActive ? 'sidebar-nav-btn-active bg-gradient-to-l from-orange-500/20 to-transparent text-white' : 'sidebar-nav-btn-inactive text-slate-400 hover:bg-white/[0.04] hover:text-white',
                )}
              >
                {isActive && <span className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-orange-500" />}
                <span className="flex items-center gap-3">
                  <Icon className={cn('h-4 w-4 transition-colors', isActive ? 'text-orange-400' : 'text-slate-500 group-hover:text-orange-400')} />
                  {label}
                </span>
                {!!badge && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-md bg-orange-500/15 px-1.5 text-[10px] font-bold text-orange-300">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-2">
          {portal !== 'TRACKING' && (
            <button
              type="button"
              onClick={() => {
                logout();
                onCloseMobile();
                toast('تم تسجيل الخروج بنجاح والتحويل إلى بوابة الدخول الموحدة', 'info');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                <span>تسجيل الخروج</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">إنهاء الجلسة</span>
            </button>
          )}

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0B1953]/70 to-transparent p-3.5 shadow-lg">
            <div className="mb-3 flex items-center justify-center">
              <BrandLogo height={28} />
            </div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span>حالة النظام</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                سحابي متصل
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>LogistteX ERP</span>
              <span>v2.4 Pro</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

import { useState } from 'react';
import { Bell, Building2, Compass, Menu, Search, ShieldCheck, Store, Moon, Sun, Globe, UserPlus, LogOut, LogIn } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ADMIN_ROLE_LABEL, MERCHANT_ROLE_LABEL, useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/format';
import type { AdminRole, MerchantRole, PortalType } from '../../types';

const PORTALS: { id: PortalType; label: string; icon: typeof Building2 }[] = [
  { id: 'ADMIN', label: 'الإدارة', icon: Building2 },
  { id: 'MERCHANT', label: 'التاجر', icon: Store },
  { id: 'TRACKING', label: 'التتبع العام', icon: Compass },
  { id: 'AUTH', label: 'بوابة الدخول', icon: LogIn },
];

const selectClass = 'h-9 rounded-lg bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer';

export function Navbar({
  onOpenSearch,
  onToggleSidebar,
  onOpenMerchantAuth,
}: {
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  onOpenMerchantAuth?: () => void;
}) {
  const { portal, setPortal, user, setAdminRole, setMerchantRole, activeMerchantId, setActiveMerchantId, logout } = useAuth();
  const { state } = useData();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const toggleLang = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
    toast(next === 'ar' ? 'تم اختيار واجهة النظام: العربية' : 'Language switched to English (Simulation)');
  };

  const pendingTasks =
    state.orders.filter((o) => o.status === 'PENDING').length +
    state.inbounds.filter((i) => i.status === 'PENDING_APPROVAL').length +
    state.payouts.filter((p) => p.status === 'PENDING').length;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/[0.06] bg-[#060B19]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        {portal !== 'TRACKING' && (
          <button onClick={onToggleSidebar} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" aria-label="القائمة">
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center cursor-pointer transition-opacity hover:opacity-90">
          <BrandLogo height={38} />
        </div>

        <nav className="mr-2 hidden items-center gap-1 rounded-xl bg-white/[0.03] p-1 ring-1 ring-inset ring-white/[0.06] md:flex">
          {PORTALS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPortal(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                portal === id ? 'bg-[#0B1953] text-white ring-1 ring-inset ring-orange-500/40' : 'text-slate-400 hover:text-white',
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', portal === id && 'text-orange-400')} />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={onOpenSearch}
          className="mx-auto hidden h-10 w-full max-w-md items-center justify-between rounded-xl bg-white/[0.03] px-3.5 text-xs text-slate-400 ring-1 ring-inset ring-white/[0.06] transition hover:ring-orange-500/30 xl:flex"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4 text-orange-400" />
            بحث برقم الشحنة، العميل، الهاتف أو SKU...
          </span>
          <kbd className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">Ctrl K</kbd>
        </button>

        <div className="mr-auto flex items-center gap-2 xl:mr-0">
          <button onClick={onOpenSearch} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white xl:hidden" aria-label="بحث">
            <Search className="h-4.5 w-4.5" />
          </button>

          {portal === 'MERCHANT' && (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 ring-1 ring-inset ring-orange-500/25 lg:flex">
                <Store className="h-3.5 w-3.5 text-orange-400" />
                <select value={activeMerchantId} onChange={(e) => setActiveMerchantId(e.target.value)} className={selectClass}>
                  {state.merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.companyName} {m.status === 'PENDING_APPROVAL' ? '(⏳ قيد المراجعة)' : m.status === 'REJECTED' ? '(❌ معتذر عنه)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pending Indicator */}
              {state.merchants.find((m) => m.id === activeMerchantId)?.status === 'PENDING_APPROVAL' && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[11px] font-bold text-orange-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                  قيد التدقيق
                </span>
              )}

              {/* Register / Switch Merchant Trigger */}
              <button
                type="button"
                onClick={onOpenMerchantAuth}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500/15 to-amber-500/15 border border-orange-500/30 px-2.5 py-1 text-xs font-bold text-orange-300 hover:text-white hover:border-orange-500 transition shadow-sm"
                title="تسجيل تاجر جديد أو الدخول بحساب آخر"
              >
                <UserPlus className="h-3.5 w-3.5 text-orange-400" />
                <span className="hidden sm:inline">تسجيل / دخول تاجر</span>
              </button>
            </div>
          )}

          {portal !== 'TRACKING' && (
            <div className="hidden items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 ring-1 ring-inset ring-white/[0.06] lg:flex" title="محاكاة الدور الوظيفي">
              <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
              {portal === 'ADMIN' ? (
                <select value={user.adminRole} onChange={(e) => setAdminRole(e.target.value as AdminRole)} className={selectClass}>
                  {(Object.keys(ADMIN_ROLE_LABEL) as AdminRole[]).map((r) => <option key={r} value={r}>{ADMIN_ROLE_LABEL[r]}</option>)}
                </select>
              ) : (
                <select value={user.merchantRole} onChange={(e) => setMerchantRole(e.target.value as MerchantRole)} className={selectClass}>
                  {(Object.keys(MERCHANT_ROLE_LABEL) as MerchantRole[]).map((r) => <option key={r} value={r}>{MERCHANT_ROLE_LABEL[r]}</option>)}
                </select>
              )}
            </div>
          )}

          {portal === 'ADMIN' && (
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" title={`${pendingTasks} مهام بانتظارك`}>
              <Bell className="h-4.5 w-4.5" />
              {pendingTasks > 0 && (
                <span className="absolute -top-0.5 -left-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#060B19]">
                  {pendingTasks}
                </span>
              )}
            </button>
          )}

          {/* Theme & Language Switchers */}
          <div className="hidden sm:flex items-center gap-1.5 border-r border-white/[0.06] pr-2.5">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 rounded-lg bg-white/[0.03] px-2 py-1.5 text-[11px] font-bold text-slate-300 ring-1 ring-inset ring-white/[0.08] hover:text-white hover:ring-orange-500/30 transition"
              title="تغيير لغة الواجهة"
            >
              <Globe className="h-3.5 w-3.5 text-orange-400" />
              <span>{lang === 'ar' ? 'العربية' : 'EN'}</span>
            </button>

            <button
              onClick={() => {
                toggleTheme();
                toast(!isDark ? 'تم تفعيل الوضع الليلي الاحترافي (Dark Mode)' : 'تم تفعيل الوضع النهاري فائق الدقة (Light Mode)');
              }}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition cursor-pointer"
              title={isDark ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" /> : <Moon className="h-4 w-4 text-blue-500 hover:-rotate-12 transition-transform" />}
            </button>
          </div>

          <div className="flex items-center gap-2.5 border-r border-white/[0.06] pr-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#0B1953] to-[#FA541C] text-xs font-bold text-white ring-2 ring-white/10">
              {user.name.replace('م. ', '').charAt(0)}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-xs font-bold text-white">{user.name}</div>
              <div className="text-[10px] text-orange-300/80">
                {portal === 'MERCHANT' && user.merchantRole ? MERCHANT_ROLE_LABEL[user.merchantRole] : user.adminRole ? ADMIN_ROLE_LABEL[user.adminRole] : ''}
              </div>
            </div>

            {/* Logout Button */}
            {portal !== 'TRACKING' && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  toast('تم تسجيل الخروج بنجاح والتحويل إلى بوابة الدخول الموحدة', 'info');
                }}
                className="flex items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer mr-1"
                title="تسجيل الخروج من الجلسة"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline text-xs font-bold">خروج</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile portal switch */}
      <div className="flex gap-1 border-t border-white/[0.04] px-4 py-2 md:hidden">
        {PORTALS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setPortal(id)}
            className={cn('flex-1 rounded-lg py-1.5 text-xs font-semibold', portal === id ? 'bg-orange-500 text-white' : 'bg-white/[0.03] text-slate-400')}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}

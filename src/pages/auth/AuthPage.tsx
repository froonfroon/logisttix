import { useState } from 'react';
import {
  Building2,
  Store,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  KeyRound,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Compass,
  CreditCard,
  FileText,
  Warehouse,
  TrendingUp,
  Clock,
  Truck,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  Zap,
  Shield,
  Layers,
  Briefcase
} from 'lucide-react';
import { BrandLogo } from '../../components/layout/BrandLogo';
import { useAuth, ADMIN_ROLE_LABEL, MERCHANT_ROLE_LABEL } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/format';
import type { AdminRole, MerchantRole } from '../../types';

interface AuthPageProps {
  initialTab?: 'ADMIN' | 'MERCHANT' | 'REGISTER' | 'TRACKING';
}

export function AuthPage({ initialTab = 'ADMIN' }: AuthPageProps) {
  const { setPortal, setAdminRole, setMerchantRole, setActiveMerchantId } = useAuth();
  const { state, registerMerchant } = useData();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'ADMIN' | 'MERCHANT' | 'REGISTER' | 'TRACKING'>(initialTab);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('admin@logisttex.com');
  const [adminPassword, setAdminPassword] = useState('••••••••••••');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [selectedAdminRole, setSelectedAdminRole] = useState<AdminRole>('SUPER_ADMIN');
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [twoFactorCode, setTwoFactorCode] = useState(['4', '8', '2', '9', '1', '0']);
  const [rememberAdmin, setRememberAdmin] = useState(true);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // Merchant login state
  const [merchantIdentifier, setMerchantIdentifier] = useState('nextkids@example.com');
  const [merchantPassword, setMerchantPassword] = useState('••••••••••••');
  const [showMerchantPass, setShowMerchantPass] = useState(false);
  const [selectedMerchantRole, setSelectedMerchantRole] = useState<MerchantRole>('OWNER');
  const [rememberMerchant, setRememberMerchant] = useState(true);
  const [isMerchantSubmitting, setIsMerchantSubmitting] = useState(false);

  // Merchant Register multi-step state
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regData, setRegData] = useState({
    companyName: '',
    name: '',
    phone: '010',
    email: '',
    category: 'أزياء وملابس ومصنوعات جلدية',
    storeUrl: '',
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    pickupAddress: '',
    expectedDailyOrders: '30 - 60 شحنة/يوم',
    commercialReg: '',
    bankName: 'البنك التجاري الدولي CIB',
    accountHolder: '',
    iban: '',
  });
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);

  // Tracking tab quick lookup state
  const [quickTrackingCode, setQuickTrackingCode] = useState('');

  // Admin Quick Switch profiles
  const adminProfiles: {
    id: AdminRole;
    name: string;
    title: string;
    email: string;
    avatar: string;
    badgeColor: string;
    desc: string;
  }[] = [
    {
      id: 'SUPER_ADMIN',
      name: 'م. كريم الرداد',
      title: 'مدير عام النظام (Super Admin)',
      email: 'admin@logisttex.com',
      avatar: 'ك',
      badgeColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
      desc: 'صلاحيات قيادية كاملة: الفروع، التسعير، الحسابات والتدقيق',
    },
    {
      id: 'OPERATIONS',
      name: 'أ. طارق الشامي',
      title: 'مدير العمليات والأسطول (Operations)',
      email: 'operations@logisttex.com',
      avatar: 'ط',
      badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
      desc: 'إدارة الشحنات الفورية، خطوط سير المناديب والتوزيع',
    },
    {
      id: 'WAREHOUSE_MGR',
      name: 'م. عادل إبراهيم',
      title: 'مشرف المستودع المركزي (Warehouse)',
      email: 'warehouse@logisttex.com',
      avatar: 'ع',
      badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      desc: 'أذونات الاستلام، بوالص الشحن، والجرد والفرز الآلي',
    },
    {
      id: 'FINANCE_HEAD',
      name: 'أ. سامح فهمي',
      title: 'رئيس الحسابات والمالية (Finance)',
      email: 'finance@logisttex.com',
      avatar: 'س',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
      desc: 'تسويات COD، محافظ التجار، الفواتير والتحويلات البنكية',
    },
  ];

  // Active merchants list for quick login
  const activeMerchants = state.merchants.filter((m) => m.status === 'ACTIVE');

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) {
      toast('يرجى إدخال البريد الإلكتروني للمسؤول', 'error');
      return;
    }

    setIsAdminSubmitting(true);
    setTimeout(() => {
      setIsAdminSubmitting(false);
      setAdminRole(selectedAdminRole);
      setPortal('ADMIN');
      toast(`تم تسجيل الدخول بنجاح بصلاحية: ${ADMIN_ROLE_LABEL[selectedAdminRole]}`, 'success');
    }, 700);
  };

  // Quick Select Admin Profile
  const selectAdminProfile = (p: typeof adminProfiles[0]) => {
    setSelectedAdminRole(p.id);
    setAdminEmail(p.email);
    setAdminPassword('••••••••••••');
    toast(`تم تعيين بيانات حساب: ${p.name}`, 'info');
  };

  // Handle Merchant Login
  const handleMerchantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantIdentifier.trim()) {
      toast('يرجى إدخال اسم المتجر أو البريد الإلكتروني أو الهاتف', 'error');
      return;
    }

    setIsMerchantSubmitting(true);
    setTimeout(() => {
      setIsMerchantSubmitting(false);
      const found = state.merchants.find(
        (m) =>
          m.email.toLowerCase() === merchantIdentifier.trim().toLowerCase() ||
          m.phone.includes(merchantIdentifier.trim()) ||
          m.companyName.toLowerCase().includes(merchantIdentifier.trim().toLowerCase()) ||
          m.id === merchantIdentifier.trim()
      );

      if (found) {
        setActiveMerchantId(found.id);
        setMerchantRole(selectedMerchantRole);
        setPortal('MERCHANT');
        if (found.status === 'PENDING_APPROVAL') {
          toast(`أهلاً بك (${found.companyName}). حسابك قيد مراجعة وتدقيق الإدارة`, 'info');
        } else if (found.status === 'REJECTED') {
          toast(`تنبيه: تم الاعتذار عن اعتماد حساب متجر (${found.companyName})`, 'error');
        } else {
          toast(`مرحباً بك مجدداً في بوابة المتجر (${found.companyName})`, 'success');
        }
      } else {
        toast('لم يتم العثور على حساب تاجر بهذه البيانات، يمكنك تسجيل حساب جديد الآن', 'error');
      }
    }, 600);
  };

  // Quick select merchant
  const selectQuickMerchant = (merchantId: string) => {
    const m = state.merchants.find((item) => item.id === merchantId);
    if (m) {
      setMerchantIdentifier(m.email);
      setMerchantPassword('••••••••••••');
      toast(`تم تعيين بيانات متجر: ${m.companyName}`, 'info');
    }
  };

  // Handle Merchant Registration Submit
  const handleRegisterSubmit = () => {
    if (!regData.companyName.trim()) {
      toast('يرجى إدخال اسم المتجر أو العلامة التجارية', 'error');
      setRegStep(1);
      return;
    }
    if (!regData.name.trim()) {
      toast('يرجى إدخال اسم الشخص المسؤول عن المتجر', 'error');
      setRegStep(2);
      return;
    }
    if (!regData.phone.trim() || regData.phone.length < 9) {
      toast('يرجى إدخال رقم هاتف محمول صالح للتواصل وتفعيل الواتساب', 'error');
      setRegStep(2);
      return;
    }

    setIsRegisterSubmitting(true);
    setTimeout(() => {
      const res = registerMerchant(regData);
      setIsRegisterSubmitting(false);

      if (res.ok && res.merchant) {
        setActiveMerchantId(res.merchant.id);
        setMerchantRole('OWNER');
        setPortal('MERCHANT');
        toast('تم تقديم طلب تسجيل المتجر بنجاح! تم نقلك لشاشة متابعة التدقيق المباشر', 'success');
      } else {
        toast(res.error || 'حدث خطأ أثناء إرسال طلب التسجيل', 'error');
      }
    }, 800);
  };

  // Handle Quick Tracking Search
  const handleQuickTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackingCode.trim()) {
      toast('يرجى إدخال رقم التتبع أو بوليصة الشحن', 'error');
      return;
    }
    setPortal('TRACKING');
    toast(`جاري البحث عن الشحنة رقم ${quickTrackingCode}...`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white relative overflow-x-hidden">
      {/* Decorative High-End Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-20 -left-20 w-[650px] h-[650px] bg-gradient-to-tr from-orange-600/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Top Floating Glass Navigation */}
      <header className="w-full border-b border-white/[0.08] bg-[#060B19]/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BrandLogo height={38} />
          <div className="hidden md:flex items-center gap-2 pr-4 border-r border-white/10 text-xs text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>بوابة الدخول الموحدة للأنظمة اللوجستية والربط السحابي</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setPortal('TRACKING')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm"
          >
            <Compass className="h-4 w-4 text-orange-400" />
            <span>تتبع شحنة بدون تسجيل</span>
          </button>

          <button
            onClick={() => {
              toggleTheme();
              toast(isDark ? 'تم تفعيل الوضع النهاري' : 'تم تفعيل الوضع الليلي الاحترافي');
            }}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition"
            title="تبديل النمط"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-blue-400" />}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 lg:py-12 flex flex-col justify-center">
        {/* Gateway Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 text-[11px] font-bold text-orange-400">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span>لوجستيكس إكسبريس للخدمات اللوجستية المتطورة</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            بوابة تسجيل الدخول وتأسيس المتاجر
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            سواء كنت مديراً للنظام أو تاجراً تشحن آلاف الطرود يومياً، نوفر لك بنية سحابية متطورة وفائقة الأمان
          </p>
        </div>

        {/* Unified Mode Selection Tabs */}
        <div className="max-w-2xl mx-auto w-full mb-8">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#0A1224]/90 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setActiveTab('ADMIN')}
              className={cn(
                'flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer',
                activeTab === 'ADMIN'
                  ? 'bg-gradient-to-r from-[#0B1953] to-[#122A80] text-white shadow-lg shadow-blue-950/60 ring-1 ring-orange-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Building2 className={cn('h-4 w-4', activeTab === 'ADMIN' ? 'text-orange-400' : 'text-slate-400')} />
              <span>دخول الإدارة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MERCHANT')}
              className={cn(
                'flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer',
                activeTab === 'MERCHANT'
                  ? 'bg-gradient-to-r from-[#0B1953] to-[#122A80] text-white shadow-lg shadow-blue-950/60 ring-1 ring-orange-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Store className={cn('h-4 w-4', activeTab === 'MERCHANT' ? 'text-orange-400' : 'text-slate-400')} />
              <span>دخول التاجر</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REGISTER')}
              className={cn(
                'flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer',
                activeTab === 'REGISTER'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                  : 'text-orange-300 hover:text-white hover:bg-orange-500/10'
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span>أنشئ حساب تاجر</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Admin Enterprise Login */}
        {activeTab === 'ADMIN' && (
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            {/* Quick Personnel Selector (Sidebar Column) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#091122]/80 backdrop-blur-xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      أدوار الإدارة الجاهزة (Quick Switch)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                    اضغط لتعبئة البيانات
                  </span>
                </div>

                <div className="space-y-2.5">
                  {adminProfiles.map((p) => {
                    const isSelected = selectedAdminRole === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectAdminProfile(p)}
                        className={cn(
                          'w-full text-right p-3 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer group',
                          isSelected
                            ? 'bg-[#0B1E4A] border-orange-500/50 shadow-md ring-1 ring-orange-500/30'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                        )}
                      >
                        <div
                          className={cn(
                            'h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border transition-all',
                            isSelected ? 'bg-orange-500 text-white border-orange-400 shadow-sm' : 'bg-white/5 text-slate-300 border-white/10'
                          )}
                        >
                          {p.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">{p.name}</span>
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-semibold', p.badgeColor)}>
                              {ADMIN_ROLE_LABEL[p.id]}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    تشفير حربي AES-256
                  </span>
                  <span>IP: 192.168.1.1 (داخلي)</span>
                </div>
              </div>
            </div>

            {/* Admin Form Column */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-white/10 bg-[#0B1528]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Lock className="h-5 w-5 text-orange-400" />
                      تسجيل دخول مسؤول النظام
                    </h2>
                    <span className="text-[11px] text-orange-300 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-full font-bold">
                      {ADMIN_ROLE_LABEL[selectedAdminRole]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    لوحة الإدارة المركزية للشحنات، الأسطول، العمليات المالية وإدارة المستودعات
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {/* Role Selector dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-orange-400" />
                      الدور الوظيفي المطلوب للجلسة
                    </label>
                    <select
                      value={selectedAdminRole}
                      onChange={(e) => setSelectedAdminRole(e.target.value as AdminRole)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs font-semibold focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                    >
                      {(Object.keys(ADMIN_ROLE_LABEL) as AdminRole[]).map((r) => (
                        <option key={r} value={r} className="bg-slate-900 text-white py-1">
                          {ADMIN_ROLE_LABEL[r]} ({r})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-orange-400" />
                      البريد الإلكتروني المؤسسي
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@logisttex.com"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-orange-400" />
                        كلمة المرور
                      </label>
                      <button
                        type="button"
                        onClick={() => toast('لأغراض العرض التوضيحي، يمكنك تسجيل الدخول مباشرة بأي كلمة مرور', 'info')}
                        className="text-[11px] text-orange-400 hover:underline"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-11 px-3.5 pl-10 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showAdminPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 2FA Simulation Box */}
                  <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-200 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-blue-400" />
                        التحقق بخطوتين (2FA Hardware Token)
                      </span>
                      <button
                        type="button"
                        onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full border transition',
                          is2FAEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-700/50 text-slate-400 border-white/10'
                        )}
                      >
                        {is2FAEnabled ? 'مفعل (نشط)' : 'معطل'}
                      </button>
                    </div>
                    {is2FAEnabled && (
                      <div className="flex items-center gap-1.5 justify-center py-1 dir-ltr">
                        {twoFactorCode.map((digit, idx) => (
                          <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const newArr = [...twoFactorCode];
                              newArr[idx] = e.target.value;
                              setTwoFactorCode(newArr);
                            }}
                            className="w-8 h-9 text-center font-mono font-bold text-sm rounded-lg bg-slate-900 border border-blue-400/30 text-blue-300 focus:border-orange-500 outline-none"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Remember me & Action */}
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberAdmin}
                        onChange={(e) => setRememberAdmin(e.target.checked)}
                        className="rounded border-white/20 bg-slate-800 text-orange-500 focus:ring-0"
                      />
                      <span>تذكر هذا الجهاز المعتمد لمدة 30 يوماً</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminSubmitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isAdminSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري التحقق من الصلاحيات والمفاتيح...</span>
                      </>
                    ) : (
                      <>
                        <span>تسجيل الدخول إلى لوحة الإدارة</span>
                        <ArrowLeft className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Merchant Portal Login */}
        {activeTab === 'MERCHANT' && (
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            {/* Active Merchants Quick Pick (Sidebar Column) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#091122]/80 backdrop-blur-xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-orange-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      المتاجر النشطة (دخول سريع)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                    متاجر تجريبية
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeMerchants.map((m) => {
                    const isSelected = merchantIdentifier.toLowerCase() === m.email.toLowerCase();
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => selectQuickMerchant(m.id)}
                        className={cn(
                          'w-full text-right p-3 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer group',
                          isSelected
                            ? 'bg-[#0B1E4A] border-orange-500/50 shadow-md ring-1 ring-orange-500/30'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                        )}
                      >
                        <div
                          className={cn(
                            'h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border transition-all',
                            isSelected ? 'bg-orange-500 text-white border-orange-400' : 'bg-white/5 text-slate-300 border-white/10'
                          )}
                        >
                          <Store className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white truncate">{m.companyName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-bold">
                              نشط
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{m.email} • {m.governorate || 'القاهرة'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Callout to register */}
                <div className="pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('REGISTER')}
                    className="w-full py-2.5 px-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-xs font-bold text-orange-300 flex items-center justify-center gap-2 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                    <span>ليس لديك متجر؟ سجّل معنا واشحن اليوم</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Merchant Login Form Column */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-white/10 bg-[#0B1528]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Store className="h-5 w-5 text-orange-400" />
                      تسجيل دخول التاجر / المتجر
                    </h2>
                    <span className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                      بوابة الشركاء
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    أدر شحناتك، تتبع المبيعات والتحصيلات، واطلب استلام البضائع من مستودعك بضغطة زر
                  </p>
                </div>

                <form onSubmit={handleMerchantLogin} className="space-y-4">
                  {/* Store / Email / Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-orange-400" />
                      البريد الإلكتروني، اسم المتجر أو الهاتف
                    </label>
                    <input
                      type="text"
                      value={merchantIdentifier}
                      onChange={(e) => setMerchantIdentifier(e.target.value)}
                      placeholder="nextkids@example.com أو 01012345678"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-orange-400" />
                        كلمة المرور
                      </label>
                      <button
                        type="button"
                        onClick={() => toast('لأغراض العرض، يمكنك تسجيل الدخول لأي متجر بكلمة المرور الافتراضية', 'info')}
                        className="text-[11px] text-orange-400 hover:underline"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showMerchantPass ? 'text' : 'password'}
                        value={merchantPassword}
                        onChange={(e) => setMerchantPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-11 px-3.5 pl-10 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowMerchantPass(!showMerchantPass)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showMerchantPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Merchant Role Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-orange-400" />
                      الصفة الوظيفية داخل فريق المتجر
                    </label>
                    <select
                      value={selectedMerchantRole}
                      onChange={(e) => setSelectedMerchantRole(e.target.value as MerchantRole)}
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs font-semibold focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition"
                    >
                      {(Object.keys(MERCHANT_ROLE_LABEL) as MerchantRole[]).map((r) => (
                        <option key={r} value={r} className="bg-slate-900 text-white py-1">
                          {MERCHANT_ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMerchant}
                        onChange={(e) => setRememberMerchant(e.target.checked)}
                        className="rounded border-white/20 bg-slate-800 text-orange-500 focus:ring-0"
                      />
                      <span>تذكر حساب المتجر على هذا المتصفح</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isMerchantSubmitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isMerchantSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري فتح بوابة المتجر...</span>
                      </>
                    ) : (
                      <>
                        <span>دخول إلى لوحة تحكم المتجر</span>
                        <ArrowLeft className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Additional Register Prompt */}
                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-xs text-slate-400">
                    هل تبحث عن الربط عبر الـ API أو تكامل مع سلة / زد؟{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('REGISTER')}
                      className="text-orange-400 font-bold hover:underline"
                    >
                      افتح حساب تاجر جديد في دقيقتين
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Merchant Registration / KYB Onboarding */}
        {activeTab === 'REGISTER' && (
          <div className="max-w-3xl mx-auto w-full animate-fade-in">
            <div className="rounded-2xl border border-white/10 bg-[#0B1528]/95 backdrop-blur-xl p-6 sm:p-10 shadow-2xl space-y-8">
              {/* Header */}
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[11px] font-bold text-orange-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  انضمام فوري لشركاء لوجستيكس إكسبريس
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  تأسيس حساب تاجر وبدء الشحن
                </h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  خطوات سريعة لربط متجرك بأسطولنا، تفعيل مندوب البيك أب، وتحويل أموال الدفع عند الاستلام لحسابك البنكي
                </p>
              </div>

              {/* 3-Step Wizard Indicator */}
              <div className="grid grid-cols-3 gap-2 relative">
                <button
                  type="button"
                  onClick={() => setRegStep(1)}
                  className={cn(
                    'p-3 rounded-xl border text-right transition-all flex items-center gap-2.5',
                    regStep === 1
                      ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                      : regStep > 1
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.02] border-white/5 text-slate-500'
                  )}
                >
                  <div
                    className={cn(
                      'h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                      regStep === 1 ? 'bg-orange-500 text-white' : regStep > 1 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                    )}
                  >
                    {regStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <div className="text-xs font-bold truncate">بيانات المتجر</div>
                    <div className="text-[10px] opacity-75">الهوية والنشاط</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegStep(2)}
                  className={cn(
                    'p-3 rounded-xl border text-right transition-all flex items-center gap-2.5',
                    regStep === 2
                      ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                      : regStep > 2
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.02] border-white/5 text-slate-500'
                  )}
                >
                  <div
                    className={cn(
                      'h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                      regStep === 2 ? 'bg-orange-500 text-white' : regStep > 2 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-400'
                    )}
                  >
                    {regStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : '2'}
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <div className="text-xs font-bold truncate">المسؤول والاستلام</div>
                    <div className="text-[10px] opacity-75">العنوان والهاتف</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegStep(3)}
                  className={cn(
                    'p-3 rounded-xl border text-right transition-all flex items-center gap-2.5',
                    regStep === 3
                      ? 'bg-orange-500/15 border-orange-500/40 text-orange-300'
                      : 'bg-white/[0.02] border-white/5 text-slate-500'
                  )}
                >
                  <div
                    className={cn(
                      'h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0',
                      regStep === 3 ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-400'
                    )}
                  >
                    3
                  </div>
                  <div className="min-w-0 hidden sm:block">
                    <div className="text-xs font-bold truncate">التوثيق والتحويلات</div>
                    <div className="text-[10px] opacity-75">IBAN والسجل</div>
                  </div>
                </button>
              </div>

              {/* Step 1: Store Brand Info */}
              {regStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 text-orange-400" />
                        اسم المتجر أو العلامة التجارية *
                      </label>
                      <input
                        type="text"
                        value={regData.companyName}
                        onChange={(e) => setRegData({ ...regData, companyName: e.target.value })}
                        placeholder="مثال: لافندر بوتيك، نكست ليفيل"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-orange-400" />
                        فئة التجارة والمنتجات
                      </label>
                      <select
                        value={regData.category}
                        onChange={(e) => setRegData({ ...regData, category: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs focus:border-orange-500 outline-none"
                      >
                        <option value="أزياء وملابس ومصنوعات جلدية">أزياء وملابس ومصنوعات جلدية</option>
                        <option value="إلكترونيات وهواتف ذكية وأجهزة">إلكترونيات وهواتف ذكية وأجهزة</option>
                        <option value="عطور ومستحضرات تجميل وعناية">عطور ومستحضرات تجميل وعناية</option>
                        <option value="أغذية ومكملات غذائية معبأة">أغذية ومكملات غذائية معبأة</option>
                        <option value="أثاث ومستلزمات ديكور منزلي">أثاث ومستلزمات ديكور منزلي</option>
                        <option value="أخرى">قطاع تجاري آخر</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-orange-400" />
                        منصة أو رابط المتجر (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={regData.storeUrl}
                        onChange={(e) => setRegData({ ...regData, storeUrl: e.target.value })}
                        placeholder="salla.sa/mystore أو صفحة إنستغرام"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
                        حجم الشحنات اليومية المتوقع
                      </label>
                      <select
                        value={regData.expectedDailyOrders}
                        onChange={(e) => setRegData({ ...regData, expectedDailyOrders: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs focus:border-orange-500 outline-none"
                      >
                        <option value="أقل من 20 شحنة/يوم">أقل من 20 شحنة / يوم</option>
                        <option value="20 - 50 شحنة/يوم">20 - 50 شحنة / يوم (باقة النمو)</option>
                        <option value="50 - 150 شحنة/يوم">50 - 150 شحنة / يوم (باقة الشركات)</option>
                        <option value="أكثر من 150 شحنة/يوم">أكثر من 150 شحنة / يوم (VIP Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!regData.companyName.trim()) {
                          toast('يرجى كتابة اسم المتجر للمتابعة', 'error');
                          return;
                        }
                        setRegStep(2);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 transition"
                    >
                      <span>المتابعة إلى بيانات الاستلام</span>
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Contact & Pickup Info */}
              {regStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-orange-400" />
                        اسم صاحب المتجر / المسؤول *
                      </label>
                      <input
                        type="text"
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        placeholder="الاسم الثلاثي"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-orange-400" />
                        رقم الهاتف / الواتساب *
                      </label>
                      <input
                        type="text"
                        value={regData.phone}
                        onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                        placeholder="01012345678"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-orange-400" />
                        البريد الإلكتروني للتقارير
                      </label>
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        placeholder="store@domain.com"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Warehouse className="h-3.5 w-3.5 text-orange-400" />
                        المحافظة / المنطقة
                      </label>
                      <select
                        value={regData.governorate}
                        onChange={(e) => setRegData({ ...regData, governorate: e.target.value })}
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs focus:border-orange-500 outline-none"
                      >
                        <option value="القاهرة">القاهرة</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                        <option value="الشرقية">الشرقية</option>
                        <option value="الدقهلية">الدقهلية</option>
                        <option value="الرياض">الرياض (السعودية)</option>
                        <option value="جدة">جدة (السعودية)</option>
                        <option value="الدمام">الدمام (السعودية)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-orange-400" />
                      عنوان المستودع أو نقطة الاستلام التفصيلية (Pickup Address)
                    </label>
                    <textarea
                      rows={2}
                      value={regData.pickupAddress}
                      onChange={(e) => setRegData({ ...regData, pickupAddress: e.target.value })}
                      placeholder="اسم الشارع، رقم المبنى، الدور أو علامة مميزة لمندوب الاستلام"
                      className="w-full p-3 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 outline-none resize-none"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>السابق</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!regData.name.trim() || !regData.phone.trim()) {
                          toast('يرجى ملء الاسم ورقم الهاتف للمتابعة', 'error');
                          return;
                        }
                        setRegStep(3);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-2 transition"
                    >
                      <span>المتابعة إلى الحساب البنكي والتوثيق</span>
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: KYB & Bank Remittance Info */}
              {regStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/25 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-bold text-emerald-300">تسويات مالية وتحويلات COD أوتوماتيكية</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        يتم تحويل أموال الطرود المسلمة مباشرة إلى حسابك البنكي وفق الدورة المالية المحددة (يومية أو أسبوعية).
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-orange-400" />
                        رقم السجل التجاري أو وثيقة العمل الحر (اختياري)
                      </label>
                      <input
                        type="text"
                        value={regData.commercialReg}
                        onChange={(e) => setRegData({ ...regData, commercialReg: e.target.value })}
                        placeholder="1010XXXXXX"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-orange-400" />
                        اسم البنك المعتمد
                      </label>
                      <input
                        type="text"
                        value={regData.bankName}
                        onChange={(e) => setRegData({ ...regData, bankName: e.target.value })}
                        placeholder="البنك التجاري الدولي CIB / بنك الراجحي"
                        className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-orange-400" />
                      رقم الآيبان البنكي (IBAN) لتحويل المستحقات
                    </label>
                    <input
                      type="text"
                      value={regData.iban}
                      onChange={(e) => setRegData({ ...regData, iban: e.target.value })}
                      placeholder="EG1234567890123456789012345 أو SA0380000..."
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs font-mono placeholder:text-slate-600 focus:border-orange-500 outline-none dir-ltr"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] text-slate-400 flex items-start gap-2.5">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded border-white/20 bg-slate-800 text-orange-500" />
                    <span>
                      أوافق على اتفاقية شروط تقديم الخدمات اللوجستية، وتفويض مندوبي لوجستيكس إكسبريس بتحصيل وتسوية مبالغ الطرود.
                    </span>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>السابق</span>
                    </button>
                    <button
                      type="button"
                      disabled={isRegisterSubmitting}
                      onClick={handleRegisterSubmit}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-xl shadow-orange-500/30 cursor-pointer disabled:opacity-50"
                    >
                      {isRegisterSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>جاري تسجيل متجرك وفتح الملف...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>إرسال طلب الانضمام واعتماد المتجر</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Quick Tracking directly */}
        {activeTab === 'TRACKING' && (
          <div className="max-w-xl mx-auto w-full animate-fade-in">
            <div className="rounded-2xl border border-white/10 bg-[#0B1528]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
                <Compass className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">تتبع حالة شحنتك المباشرة</h2>
                <p className="text-xs text-slate-400">
                  أدخل رقم بوليصة الشحن لمعرفة مسار الطرد وموعد التسليم الفعلي
                </p>
              </div>

              <form onSubmit={handleQuickTracking} className="space-y-4">
                <input
                  type="text"
                  value={quickTrackingCode}
                  onChange={(e) => setQuickTrackingCode(e.target.value)}
                  placeholder="مثال: ORD-2024-001 أو رقم الهاتف"
                  className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-white/15 text-white text-sm text-center font-mono placeholder:text-slate-600 focus:border-orange-500 outline-none"
                />
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  <Compass className="h-4 w-4" />
                  <span>تتبع الشحنة الآن</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Enterprise Trust & Regulatory Badges */}
        <div className="mt-12 pt-8 border-t border-white/[0.06] max-w-4xl mx-auto w-full flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>معتمد وفق معايير PCI-DSS و SOC-2 Type II</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-blue-400" />
            <span>جاهزية الأنظمة Uptime 99.98%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>تكامل فوري عبر Webhooks & REST API</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-orange-400" />
            <span>دعم فني واستجابة طوارئ 24/7</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#060B19]/90 py-4 px-4 text-center text-xs text-slate-500">
        جميع الحقوق محفوظة © {new Date().getFullYear()} منصة لوجستيكس إكسبريس (Logisttix Hub Enterprise) • الإصدار 2.5.0
      </footer>
    </div>
  );
}

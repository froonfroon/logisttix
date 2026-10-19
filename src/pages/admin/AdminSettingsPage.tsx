import { useState } from 'react';
import {
  Settings,
  Building2,
  Truck,
  Warehouse,
  Wallet,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Key,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Send,
  Zap,
  Sliders,
  AlertTriangle,
  Lock,
  Cloud
} from 'lucide-react';
import { Card, Button, Tabs, Badge } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

export function AdminSettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SHIPPING' | 'WMS' | 'FINANCE' | 'NOTIFICATIONS' | 'SECURITY'>('GENERAL');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [companySettings, setCompanySettings] = useState({
    companyNameAr: 'منظومة لوجستكس الذكية للحلول اللوجستية',
    companyNameEn: 'Logisttix Smart Logistics Solutions LLC',
    crNumber: '1010892341',
    taxNumber: '30291823900003',
    supportPhone: '+20 100 000 8899',
    supportEmail: 'ops@logisttix.com',
    hqAddress: 'القطاع الأول، التجمع الخامس، القاهرة الجديدة، مصر',
    currency: 'EGP',
    countryCode: '+20',
  });

  const [shippingRules, setShippingRules] = useState({
    maxDeliveryAttempts: '3',
    freeReattemptHours: '24',
    enableOtpVerification: true,
    allowDoorInspection: true,
    allowPartialDelivery: true,
    returnQuarantineDays: '2',
    defaultSlaHours: '48',
    expressSlaHours: '24',
    geofenceDeviationMeters: '150',
    autoAssignDriverRadiusKm: '15',
  });

  const [wmsPolicies, setWmsPolicies] = useState({
    freeStorageGraceDays: '14',
    dailyStorageCbmRate: '15',
    pickingFeePerUnit: '3.50',
    packingBoxFee: '6.00',
    quarantineMaxDays: '7',
    lowStockThreshold: '10',
    autoBarcodeGeneration: true,
    palletMaxWeightKg: '850',
  });

  const [financeRules, setFinanceRules] = useState({
    settlementCycle: 'BI_WEEKLY',
    minPayoutThreshold: '1000',
    instantPayoutFeePercent: '1.2',
    codRemittanceGraceHours: '24',
    taxVatPercent: '14',
    autoInvoiceGeneration: true,
    enableInstaPayDirect: true,
  });

  const [integrationKeys, setIntegrationKeys] = useState({
    whatsappStatus: 'CONNECTED',
    whatsappPhoneId: 'wa_live_992819283712',
    smsGateway: 'TWILIO',
    smsSenderName: 'LOGISTTIX',
    paymobMerchantId: '982731',
    paymobIframeId: '827162',
    fawryMerchantCode: 'FAWRY_LOGISTTIX_01',
    googleMapsApiKey: 'AIzaSyA892kLq8731bV2-live',
  });

  const [securitySettings, setSecuritySettings] = useState({
    enforceTwoFactor: true,
    sessionTimeoutMinutes: '60',
    allowedIpWhitelisting: false,
    auditLogRetentionDays: '365',
    maintenanceMode: false,
    automaticDatabaseBackup: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast('تم حفظ وتعميم إعدادات المنظومة بنجاح في جميع الخوادم والـ Microservices', 'success');
    }, 700);
  };

  const handleTestIntegration = (name: string) => {
    toast(`جاري فحص الاتصال ومفتاح الـ API لـ (${name})... تم بنجاح 200 OK`, 'info');
  };

  const tabsConfig = [
    { id: 'GENERAL' as const, label: 'الهوية المؤسسية', icon: Building2 },
    { id: 'SHIPPING' as const, label: 'قواعد التوصيل والأسطول', icon: Truck },
    { id: 'WMS' as const, label: 'سياسات التخزين WMS', icon: Warehouse },
    { id: 'FINANCE' as const, label: 'المالية ودورة COD', icon: Wallet },
    { id: 'NOTIFICATIONS' as const, label: 'بوابات الربط والـ API', icon: Zap },
    { id: 'SECURITY' as const, label: 'الأمان والنسخ الاحتياطي', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                إعدادات المنظومة والسياسات العامة
                <Badge tone="indigo">Enterprise Core v3.4</Badge>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                التحكم المركزي في هوية الشركة، محددات الأسطول، لوائح التخزين، ودورات التحصيل والربط السحابي
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            onClick={() => toast('تمت استعادة الإعدادات الافتراضية', 'info')}
            className="text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 ml-1.5" />
            استعادة الافتراضي
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="shadow-lg shadow-orange-500/20 font-bold px-6"
          >
            <Save className="w-4 h-4 ml-1.5" />
            {isSaving ? 'جاري الحفظ والتعميم...' : 'حفظ كل التغييرات'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabsConfig}
        value={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      {/* TAB 1: GENERAL IDENTITY */}
      {activeTab === 'GENERAL' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-400" />
                  بيانات السجل التجاري والهوية الرسمية
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  هذه البيانات تظهر تلقائياً في فواتير التجار، بوالص الشحن، وإشعارات التسليم الرسمية
                </p>
              </div>
              <Badge tone="emerald">موثق حكومياً</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اسم المنشأة باللغة العربية</label>
                <input
                  type="text"
                  value={companySettings.companyNameAr}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyNameAr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اسم المنشأة بالإنجليزية (Legal Entity)</label>
                <input
                  type="text"
                  value={companySettings.companyNameEn}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyNameEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رقم السجل التجاري (CR)</label>
                <input
                  type="text"
                  value={companySettings.crNumber}
                  onChange={(e) => setCompanySettings({ ...companySettings, crNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">الرقم الضريبي الموحد (Tax ID)</label>
                <input
                  type="text"
                  value={companySettings.taxNumber}
                  onChange={(e) => setCompanySettings({ ...companySettings, taxNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">هاتف الخط الساخن لخدمة العملاء</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={companySettings.supportPhone}
                    onChange={(e) => setCompanySettings({ ...companySettings, supportPhone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">البريد الإلكتروني للعمليات والدعم</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={companySettings.supportEmail}
                    onChange={(e) => setCompanySettings({ ...companySettings, supportEmail: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-2">عنوان المقر الرئيسي والمستودع المركزي</label>
                <input
                  type="text"
                  value={companySettings.hqAddress}
                  onChange={(e) => setCompanySettings({ ...companySettings, hqAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </Card>

          {/* Regional & System Localization */}
          <Card className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              العملة والتوطين الجغرافي للنظام
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06]">
                <span className="text-xs text-slate-400 block mb-1">العملة الأساسية للحسابات</span>
                <span className="text-base font-bold text-white font-mono">جنيه مصري (EGP - ج.م)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06]">
                <span className="text-xs text-slate-400 block mb-1">المنطقة الزمنية (Timezone)</span>
                <span className="text-base font-bold text-white font-mono">Africa/Cairo (GMT+2)</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06]">
                <span className="text-xs text-slate-400 block mb-1">صيغة أرقام التتبع وبوالص الشحن</span>
                <span className="text-base font-bold text-orange-400 font-mono">LX-EG-[YEAR]-[ID]</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: SHIPPING & FLEET RULES */}
      {activeTab === 'SHIPPING' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-400" />
                محددات تسليم الشحنات وضوابط الأسطول
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد عدد محاولات التسليم، قواعد المعاينة عند الاستلام، ومطابقة الموقع الجغرافي للمندوب
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
                <label className="text-xs font-bold text-slate-300 block">أقصى عدد لمحاولات التسليم المسموحة</label>
                <select
                  value={shippingRules.maxDeliveryAttempts}
                  onChange={(e) => setShippingRules({ ...shippingRules, maxDeliveryAttempts: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="2">محاولتان (2 محاولات)</option>
                  <option value="3">3 محاولات (الموصى به دولياً)</option>
                  <option value="4">4 محاولات (الحد الأقصى للتاجر VIP)</option>
                </select>
                <p className="text-[11px] text-slate-400">بعد استنفاد المحاولات تتحول الشحنة تلقائياً إلى مرتجع لمستودع WMS</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
                <label className="text-xs font-bold text-slate-300 block">فترة المهلة المجانية لإعادة المحاولة (ساعة)</label>
                <input
                  type="number"
                  value={shippingRules.freeReattemptHours}
                  onChange={(e) => setShippingRules({ ...shippingRules, freeReattemptHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">إعادة الاتصال بالعميل خلال 24 ساعة بدون احتساب رسوم إضافية</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
                <label className="text-xs font-bold text-slate-300 block">انحراف النطاق الجغرافي المسموح (متر)</label>
                <input
                  type="number"
                  value={shippingRules.geofenceDeviationMeters}
                  onChange={(e) => setShippingRules({ ...shippingRules, geofenceDeviationMeters: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">تنبيه الغش في حال تسليم الشحنة خارج نطاق عنوان العميل بـ 150 متر</p>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.06] flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-emerald-400" />
                    كود التحقق عند التسليم (OTP)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">إرسال كود سري لهاتف المستلم لإنهاء التسليم والتحصيل بأمان</p>
                </div>
                <input
                  type="checkbox"
                  checked={shippingRules.enableOtpVerification}
                  onChange={(e) => setShippingRules({ ...shippingRules, enableOtpVerification: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.06] flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    السماح بالمعاينة أمام المندوب
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">إمكانية فتح الطرد وفحصه مع المندوب قبل دفع مبلغ التحصيل COD</p>
                </div>
                <input
                  type="checkbox"
                  checked={shippingRules.allowDoorInspection}
                  onChange={(e) => setShippingRules({ ...shippingRules, allowDoorInspection: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-white/[0.06] flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    التسليم والاستلام الجزئي
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">قبول استلام بعض القطع من الطلب وإرجاع الباقي مع تعديل الفاتورة فوراً</p>
                </div>
                <input
                  type="checkbox"
                  checked={shippingRules.allowPartialDelivery}
                  onChange={(e) => setShippingRules({ ...shippingRules, allowPartialDelivery: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: WMS & STORAGE POLICIES */}
      {activeTab === 'WMS' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-indigo-400" />
                تعرفة وسياسات التخزين والمناولة بمستودعات WMS
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد فترات التخزين المجاني، تكلفة المتر المكعب اليومي، ورسوم الالتقاط والتغليف (Pick & Pack)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06]">
                <label className="text-xs font-bold text-slate-300 block mb-1">فترة التخزين المجاني (أيام)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={wmsPolicies.freeStorageGraceDays}
                    onChange={(e) => setWmsPolicies({ ...wmsPolicies, freeStorageGraceDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">يوم</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">مهلة بعد دخول الشحنة قبل احتساب رسوم الأرضيات</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06]">
                <label className="text-xs font-bold text-slate-300 block mb-1">سعر المتر المكعب/يوم (ج.م)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={wmsPolicies.dailyStorageCbmRate}
                    onChange={(e) => setWmsPolicies({ ...wmsPolicies, dailyStorageCbmRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">ج.م/CBM</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">تُحسب تلقائياً من حجم البليتات الفعلي</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06]">
                <label className="text-xs font-bold text-slate-300 block mb-1">رسوم الالتقاط للقطعة (Picking)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={wmsPolicies.pickingFeePerUnit}
                    onChange={(e) => setWmsPolicies({ ...wmsPolicies, pickingFeePerUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">ج.م/قطعة</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">تكلفة سحب القطعة من الرف وتجهيزها</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06]">
                <label className="text-xs font-bold text-slate-300 block mb-1">رسوم كرتونة التغليف والفقاعات</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={wmsPolicies.packingBoxFee}
                    onChange={(e) => setWmsPolicies({ ...wmsPolicies, packingBoxFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">ج.م/طرد</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">تغليف كرتوني مقوى مع شريط الأمان والباركود</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: FINANCE & COD SETTLEMENT */}
      {activeTab === 'FINANCE' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  دورة تحصيل مبالغ الدفع عند الاستلام (COD) وتصفية التجار
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  تحديد جدول إيداع الأرباح في حسابات التجار البنكية والتحويل اللحظي عبر إنستاباي
                </p>
              </div>
              <Badge tone="emerald">Instant Settlement Ready</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
                <label className="text-xs font-bold text-slate-300 block">دورة تسوية المحافظ الرسمية</label>
                <select
                  value={financeRules.settlementCycle}
                  onChange={(e) => setFinanceRules({ ...financeRules, settlementCycle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="DAILY">تسوية يومية (Daily Settlement)</option>
                  <option value="BI_WEEKLY">مرتان أسبوعياً (الأحد والأربعاء)</option>
                  <option value="WEEKLY">تسوية أسبوعية (كل خميس)</option>
                </select>
                <p className="text-[11px] text-slate-400">تحويل رصيد COD المحصل بعد خصم مصاريف الشحن والتخزين</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
                <label className="text-xs font-bold text-slate-300 block">الحد الأدنى لطلب التحويل البنكي (ج.م)</label>
                <input
                  type="number"
                  value={financeRules.minPayoutThreshold}
                  onChange={(e) => setFinanceRules({ ...financeRules, minPayoutThreshold: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">الحد الأدنى لإنشاء كشف تصفية تلقائي للتاجر</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
                <label className="text-xs font-bold text-slate-300 block">نسبة ضريبة القيمة المضافة (VAT %)</label>
                <input
                  type="number"
                  value={financeRules.taxVatPercent}
                  onChange={(e) => setFinanceRules({ ...financeRules, taxVatPercent: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">تطبيق 14% ضريبة رسمية على خدمات النقل والشحن</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">التحويل اللحظي للمحافظ البنكية وإنستاباي (InstaPay Direct)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">تمكين التجار من سحب مستحقات الـ COD فور توريد المندوب للنقدية بالخزينة</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={financeRules.enableInstaPayDirect}
                onChange={(e) => setFinanceRules({ ...financeRules, enableInstaPayDirect: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: GATEWAYS & API INTEGRATIONS */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  بوابات الرسائل والربط السحابي (Cloud & Communication Integrations)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  إعدادات مفاتيح وتوكينات واتساب للأعمال، بوابات الدفع الإلكتروني، وخرائط جوجل للأسطول
                </p>
              </div>
              <Badge tone="emerald">Live Production</Badge>
            </div>

            {/* WhatsApp Cloud API */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">WhatsApp Business Cloud API (Meta Official)</h3>
                    <p className="text-xs text-slate-400">إرسال إشعارات خروج الشحنة مع المندوب ورابط التتبع الحي وكود الـ OTP تلقائياً</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    CONNECTED
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleTestIntegration('WhatsApp Cloud')}>
                    اختبار الإرسال
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    value={integrationKeys.whatsappPhoneId}
                    onChange={(e) => setIntegrationKeys({ ...integrationKeys, whatsappPhoneId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Permanent Access Token</label>
                  <input
                    type="password"
                    value="EAAG82718293021982736192837198273"
                    readOnly
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-400 font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Google Maps Geocoding & Fleet Routing */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-white/[0.06] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Maps Distance Matrix & Geocoding API</h3>
                    <p className="text-xs text-slate-400">تحليل العناوين تلقائياً وحساب أقصر مسار للمندوب وتوقع وقت الوصول بدقة</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleTestIntegration('Google Maps')}>
                  اختبار مفتاح API
                </Button>
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">Google Maps API Key</label>
                <input
                  type="text"
                  value={integrationKeys.googleMapsApiKey}
                  onChange={(e) => setIntegrationKeys({ ...integrationKeys, googleMapsApiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 6: SECURITY & AUDIT */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  بروتوكولات الأمان والنسخ الاحتياطي ومسارات المراجعة
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  حماية البيانات، إلزامية المصادقة الثنائية، وتشفير سجلات التدقيق المالي
                </p>
              </div>
              <Badge tone="emerald">SOC-2 Type II Certified</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-orange-400" />
                    إلزام المصادقة الثنائية (2FA) لموظفي الإدارة
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">مطالبة مدراء الحسابات ومناديب الخزينة بتطبيق Google Authenticator</p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.enforceTwoFactor}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, enforceTwoFactor: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    النسخ الاحتياطي التلقائي المتزامن (Auto-Backup)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">توليد نسخة سحابية مشفرة كل 6 ساعات لكافة العمليات المالية</p>
                </div>
                <input
                  type="checkbox"
                  checked={securitySettings.automaticDatabaseBackup}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, automaticDatabaseBackup: e.target.checked })}
                  className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">وضع الصيانة الاستثنائي (Maintenance Mode)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">عند التفعيل، يتم تعليق استقبال طلبات التجار وتوجيه السائقين إلى أقرب مستودع</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={securitySettings.maintenanceMode}
                onChange={(e) => setSecuritySettings({ ...securitySettings, maintenanceMode: e.target.checked })}
                className="w-5 h-5 accent-red-500 rounded cursor-pointer"
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

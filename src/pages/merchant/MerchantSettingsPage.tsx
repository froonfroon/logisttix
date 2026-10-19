import { useState } from 'react';
import {
  Store,
  CreditCard,
  Truck,
  MessageSquare,
  Webhook,
  Save,
  RotateCcw,
  Copy,
  Phone,
  Mail,
  Globe,
  Send
} from 'lucide-react';
import { Card, Button, Tabs, Badge } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

export function MerchantSettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'FINANCE' | 'SHIPPING' | 'WHATSAPP' | 'INTEGRATION'>('PROFILE');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    storeNameAr: 'متجر نكست تيك للإلكترونيات والأجهزة',
    storeNameEn: 'NextTech Electronics Store',
    category: 'إلكترونيات وأجهزة ذكية',
    phone: '+20 102 345 6789',
    supportEmail: 'orders@nexttech-eg.com',
    storeUrl: 'https://nexttech-store.com',
    commercialReg: 'CR-882910-EG',
    city: 'القاهرة - المعادي',
  });

  const [bankAccount, setBankAccount] = useState({
    bankName: 'البنك التجاري الدولي (CIB)',
    accountHolder: 'شركة نكست تيك للتجارة الإلكترونية',
    accountNumber: '100048291029',
    iban: 'EG3800100000000100048291029',
    swiftCode: 'CIBEGCAXXX',
    instaPayAddress: 'nexttech@instapay',
    autoPayoutWeekly: true,
  });

  const [deliveryRules, setDeliveryRules] = useState({
    allowDoorInspection: true,
    allowPartialDelivery: true,
    allowExchangeOnSpot: true,
    maxReturnDays: '14',
    customerPaysReturnShipping: false,
    preferredHub: 'المستودع الرئيسي - المنطقة الصناعية بالتجمع',
    specialInstructions: 'يرجى الاتصال بالعميل قبل التحرك بساعة واحدة للتأكيد.',
  });

  const [whatsappTemplates, setWhatsappTemplates] = useState({
    notifyOnDispatch: true,
    notifyOnDelivery: true,
    notifyOnDelay: true,
    senderBranding: 'NextTech Store',
    sampleMessage: 'مرحباً {اسم_العميل}، طلبك رقم {رقم_الشحنة} خرج الآن للتوصيل مع مندوبنا {اسم_المندوب}. يمكنك تتبع الشحنة لحظياً عبر الرابط: https://logisttix.link/track',
  });

  const [webhookConfig, setWebhookConfig] = useState({
    platform: 'SHOPIFY',
    webhookUrl: 'https://nexttech-store.com/api/logisttix/webhook',
    apiSecretKey: 'lx_sec_live_9981273918237192837',
    autoSyncStock: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast('تم حفظ إعدادات وتفضيلات المتجر بنجاح وتحديث سياسات التوصيل', 'success');
    }, 600);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`تم نسخ ${label} إلى الحافظة بنجاح`, 'info');
  };

  const tabsConfig = [
    { id: 'PROFILE' as const, label: 'بيانات وهوية المتجر', icon: Store },
    { id: 'FINANCE' as const, label: 'الحساب البنكي والتحصيل COD', icon: CreditCard },
    { id: 'SHIPPING' as const, label: 'سياسات الشحن والمعاينة', icon: Truck },
    { id: 'WHATSAPP' as const, label: 'إشعارات واتساب للعملاء', icon: MessageSquare },
    { id: 'INTEGRATION' as const, label: 'الربط السريع (Shopify/Zid)', icon: Webhook },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Store className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                إعدادات المتجر وحساب التاجر
                <Badge tone="emerald">حساب تاجر موثق VIP</Badge>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                التحكم في الهوية التجارية، الحساب البنكي لإيداع الـ COD، سياسات الاستلام، وتنبيهات واتساب
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            onClick={() => toast('تم التراجع عن التغييرات غير المحفوظة', 'info')}
            className="text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4 ml-1.5" />
            إلغاء التعديلات
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className="shadow-lg shadow-orange-500/20 font-bold px-6"
          >
            <Save className="w-4 h-4 ml-1.5" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabsConfig}
        value={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      {/* TAB 1: STORE PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-orange-400" />
                  الملف التعريفي للعلامة التجارية
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  هذه البيانات تظهر لعملائك على بوليصة الشحن وفي رسائل التتبع
                </p>
              </div>
              <Badge tone="indigo">معتمد رسمياً</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اسم المتجر بالعربية</label>
                <input
                  type="text"
                  value={profile.storeNameAr}
                  onChange={(e) => setProfile({ ...profile, storeNameAr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اسم المتجر بالإنجليزية (Brand Name)</label>
                <input
                  type="text"
                  value={profile.storeNameEn}
                  onChange={(e) => setProfile({ ...profile, storeNameEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">هاتف خدمة عملاء المتجر</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">البريد الإلكتروني للطلبات والدعم</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={profile.supportEmail}
                    onChange={(e) => setProfile({ ...profile, supportEmail: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رابط المتجر الإلكتروني (Website / Domain)</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="url"
                    value={profile.storeUrl}
                    onChange={(e) => setProfile({ ...profile, storeUrl: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">رقم السجل التجاري / وثيقة العمل الحر</label>
                <input
                  type="text"
                  value={profile.commercialReg}
                  onChange={(e) => setProfile({ ...profile, commercialReg: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm font-mono focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: FINANCE & BANK ACCOUNT */}
      {activeTab === 'FINANCE' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  الحساب البنكي لتحويل مبالغ التحصيل عند الاستلام (COD Remittance)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  الحساب البنكي المعتمد الذي يتم تحويل مستحقات المبيعات إليه دورياً
                </p>
              </div>
              <Badge tone="emerald">حساب نشط ومطابق</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اسم البنك المعتمد</label>
                <input
                  type="text"
                  value={bankAccount.bankName}
                  onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">اسم صاحب الحساب (مطابق للرقم الضريبي)</label>
                <input
                  type="text"
                  value={bankAccount.accountHolder}
                  onChange={(e) => setBankAccount({ ...bankAccount, accountHolder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-2">رقم الآيبان الدولي (IBAN)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={bankAccount.iban}
                    onChange={(e) => setBankAccount({ ...bankAccount, iban: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-emerald-400 font-mono text-sm tracking-wider focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankAccount.iban, 'رقم الآيبان')}
                    className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">عنوان إنستاباي السريع (InstaPay Handle)</label>
                <input
                  type="text"
                  value={bankAccount.instaPayAddress}
                  onChange={(e) => setBankAccount({ ...bankAccount, instaPayAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">كود السويفت (SWIFT / BIC Code)</label>
                <input
                  type="text"
                  value={bankAccount.swiftCode}
                  onChange={(e) => setBankAccount({ ...bankAccount, swiftCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">التحويل التلقائي الأسبوعي للأرباح</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">تحويل الرصيد المتاح كل يوم خميس إلى حسابك البنكي تلقائياً بدون طلب يدوي</p>
              </div>
              <input
                type="checkbox"
                checked={bankAccount.autoPayoutWeekly}
                onChange={(e) => setBankAccount({ ...bankAccount, autoPayoutWeekly: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SHIPPING POLICIES */}
      {activeTab === 'SHIPPING' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-400" />
                سياسات التوصيل والمعاينة لعملائك
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد شروط استلام عملائك للشحنات عند باب المنزل لرفع نسبة الاستلام
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">معاينة الشحنة أمام المندوب</h4>
                  <p className="text-[11px] text-slate-400 mt-1">السماح للعميل بفتح الطرد وفحص المنتجات قبل دفع ثمن الطلب</p>
                </div>
                <input
                  type="checkbox"
                  checked={deliveryRules.allowDoorInspection}
                  onChange={(e) => setDeliveryRules({ ...deliveryRules, allowDoorInspection: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">قبول الاستلام الجزئي</h4>
                  <p className="text-[11px] text-slate-400 mt-1">إمكانية استلام بعض المنتجات وإرجاع غير المرغوب وتعديل الفاتورة فوراً</p>
                </div>
                <input
                  type="checkbox"
                  checked={deliveryRules.allowPartialDelivery}
                  onChange={(e) => setDeliveryRules({ ...deliveryRules, allowPartialDelivery: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">الاستبدال الفوري في نفس اللحظة</h4>
                  <p className="text-[11px] text-slate-400 mt-1">تمكين المندوب من تسليم صنف بديل واستلام الصنف القديم في نفس الزيارة</p>
                </div>
                <input
                  type="checkbox"
                  checked={deliveryRules.allowExchangeOnSpot}
                  onChange={(e) => setDeliveryRules({ ...deliveryRules, allowExchangeOnSpot: e.target.checked })}
                  className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">تعليمات خاصة ثابتة لمناديب التوصيل</label>
              <textarea
                rows={3}
                value={deliveryRules.specialInstructions}
                onChange={(e) => setDeliveryRules({ ...deliveryRules, specialInstructions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs leading-relaxed focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">تظهر هذه الملاحظة بشكل بارز على تطبيق السائق في كل شحنة تخص متجرك</p>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: WHATSAPP CUSTOMER NOTIFICATIONS */}
      {activeTab === 'WHATSAPP' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  إشعارات ورسائل واتساب التلقائية لعملاء متجرك
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  إرسال رسائل آلية باسم متجرك فور تغير حالة الشحنة مع رابط التتبع الحي
                </p>
              </div>
              <Badge tone="emerald">WhatsApp Verified</Badge>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">إشعار خروج الشحنة مع المندوب (Out for Delivery)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">إرسال اسم المندوب ورقم هاتفه ورابط التتبع المباشر GPS للعميل</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappTemplates.notifyOnDispatch}
                  onChange={(e) => setWhatsappTemplates({ ...whatsappTemplates, notifyOnDispatch: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">إشعار نجاح التسليم واستلام المبلغ (Delivered)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">إرسال رسالة شكر للعميل مع رابط لتقييم تجربة الشراء والتوصيل</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappTemplates.notifyOnDelivery}
                  onChange={(e) => setWhatsappTemplates({ ...whatsappTemplates, notifyOnDelivery: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">نموذج رسالة واتساب المعتمد (Template Preview)</label>
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed font-mono">
                {whatsappTemplates.sampleMessage}
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => toast('تم إرسال رسالة اختبار تجريبية إلى هاتفك', 'info')}>
                  <Send className="w-3.5 h-3.5 ml-1.5" />
                  إرسال رسالة تجريبية لهاتفي
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: INTEGRATIONS */}
      {activeTab === 'INTEGRATION' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-indigo-400" />
                  الربط البرمجي ومزامنة المخزون (Webhooks & API)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ربط متجرك مع منصات شوبيفاي، زد، سلة، أو ووكومرس لنقل الطلبات آلياً
                </p>
              </div>
              <Badge tone="cyan">مفتاح API نشط</Badge>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Webhook Endpoint URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={webhookConfig.webhookUrl}
                    onChange={(e) => setWebhookConfig({ ...webhookConfig, webhookUrl: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookConfig.webhookUrl, 'رابط الـ Webhook')}
                    className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Secret Key (مفتاح التشفير)</label>
                <div className="relative">
                  <input
                    type="password"
                    value={webhookConfig.apiSecretKey}
                    readOnly
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 font-mono text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookConfig.apiSecretKey, 'مفتاح الـ Secret Key')}
                    className="absolute left-2.5 top-2.5 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { 
  Store, 
  Search, 
  Plus, 
  KeyRound, 
  Copy, 
  Check, 
  Eye, 
  DollarSign, 
  Package, 
  Building2, 
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Clock,
  UserCheck,
  XCircle,
  MessageSquare,
  ExternalLink,
  MapPin,
  RotateCcw,
  Send,
  Percent
} from 'lucide-react';
import type { Merchant } from '../../types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../lib/format';
import { Badge, Button, Card, Modal, Field, inputClass, Tabs, StatusBadge } from '../../components/ui';

export function MerchantsPage() {
  const { state, addMerchant, adjustMerchantBalance, approveMerchant, rejectMerchant } = useData();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING' | 'REJECTED'>('ACTIVE');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [approvingMerchant, setApprovingMerchant] = useState<Merchant | null>(null);
  const [rejectingMerchant, setRejectingMerchant] = useState<Merchant | null>(null);

  // Approval Form State
  const [approvalDiscount, setApprovalDiscount] = useState('10');
  const [approvalWarehouse, setApprovalWarehouse] = useState('المستودع الرئيسي - المنطقة الصناعية بالتجمع');

  // Rejection Form State
  const [rejectionReason, setRejectionReason] = useState('يرجى إرفاق صورة السجل التجاري والبطاقة الضريبية السارية لإتمام التحقق من نشاط المتجر.');

  // New Merchant Form State
  const [newCompany, setNewCompany] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('010');
  const [newEmail, setNewEmail] = useState('');
  const [newDiscount, setNewDiscount] = useState('0');
  const [newBank, setNewBank] = useState('البنك الأهلي المصري');
  const [newAccountHolder, setNewAccountHolder] = useState('');
  const [newIban, setNewIban] = useState('EG0000000000000000000000000');

  // Balance Adjustment Form State
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  // Counts
  const activeCount = state.merchants.filter((m) => m.status === 'ACTIVE').length;
  const pendingCount = state.merchants.filter((m) => m.status === 'PENDING_APPROVAL').length;
  const rejectedCount = state.merchants.filter((m) => m.status === 'REJECTED' || m.status === 'SUSPENDED').length;

  const currentList = state.merchants.filter((m) => {
    if (activeTab === 'ACTIVE') return m.status === 'ACTIVE';
    if (activeTab === 'PENDING') return m.status === 'PENDING_APPROVAL';
    return m.status === 'REJECTED' || m.status === 'SUSPENDED';
  });

  const filteredMerchants = currentList.filter(
    (m) =>
      m.companyName.includes(searchQuery) ||
      m.name.includes(searchQuery) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyMockToken = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`ltx_live_sec_9942_${id}_token_auth_secret`);
      setCopiedTokenId(id);
      toast('تم نسخ مفتاح الـ API للتاجر بنجاح');
      setTimeout(() => setCopiedTokenId(null), 2000);
    } catch {
      toast('فشل النسخ', 'error');
    }
  };

  const handleCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    const discount = parseFloat(newDiscount) || 0;
    const res = addMerchant({
      name: newName.trim(),
      companyName: newCompany.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || `${newPhone.trim()}@store.logisttex.com`,
      status: 'ACTIVE',
      shippingDiscountPercent: discount,
      bankName: newBank.trim(),
      accountHolder: newAccountHolder.trim() || newName.trim(),
      iban: newIban.trim(),
    });

    if (res.ok) {
      toast(`تم تسجيل التاجر ${newCompany} بنجاح وإنشاء محفظته الرقمية`);
      setIsAddModalOpen(false);
      setNewCompany('');
      setNewName('');
      setNewPhone('010');
      setNewEmail('');
      setNewDiscount('0');
      setNewAccountHolder('');
    } else {
      toast(res.error || 'فشل إضافة التاجر', 'error');
    }
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchant) return;
    const num = parseFloat(adjustAmount);
    if (!num || num <= 0) {
      toast('يرجى إدخال مبلغ صحيح للتسوية', 'error');
      return;
    }
    const finalAmount = adjustType === 'CREDIT' ? num : -num;
    const res = adjustMerchantBalance(selectedMerchant.id, finalAmount, adjustNote || 'تسوية محاسبية يدوية من الإدارة');
    if (res.ok) {
      toast(`تم تعديل محفظة التاجر بمقدار (${finalAmount > 0 ? '+' : ''}${formatMoney(finalAmount)})`);
      setAdjustAmount('');
      setAdjustNote('');
      // update modal selected merchant reference
      const updated = state.merchants.find((m) => m.id === selectedMerchant.id);
      if (updated) setSelectedMerchant({ ...updated, availableBalance: updated.availableBalance + finalAmount });
    } else {
      toast(res.error || 'فشلت التسوية', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-500" />
            <span>إدارة التجار وبيانات المتاجر والربط (Merchants & APIs)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            عزل بيانات التجار التام، محافظ الأرصدة، تسوية التحصيلات، ومفاتيح الربط البرمجي (Shopify & WooCommerce)
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          تسجيل تاجر جديد
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-3 w-4 h-4 text-orange-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم المتجر، المسؤول، البريد الإلكتروني..."
          className={`${inputClass} pr-10`}
        />
      </div>

      {/* Tabs Bar */}
      <Tabs
        value={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        tabs={[
          { id: 'ACTIVE', label: `المتاجر المعتمدة النشطة (${activeCount})`, icon: Store },
          { id: 'PENDING', label: `طلبات الانضمام الجديدة (${pendingCount})`, icon: Clock },
          { id: 'REJECTED', label: `الطلبات المعتذر عنها (${rejectedCount})`, icon: XCircle },
        ]}
      />

      {/* PENDING APPROVAL TAB CONTENT */}
      {activeTab === 'PENDING' && (
        <div className="space-y-4 animate-fadeIn">
          {filteredMerchants.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">لا توجد طلبات انضمام معلقة حالياً</h3>
              <p className="text-xs text-slate-400">تم تدقيق واعتماد كافة طلبات المتاجر المقدمة بنجاح.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredMerchants.map((merchant) => (
                <Card key={merchant.id} className="p-5 border-orange-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-orange-950/20 space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{merchant.companyName}</h3>
                          <Badge tone="orange">بانتظار قرار الإدارة</Badge>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          المسؤول: <span className="text-slate-200 font-semibold">{merchant.name}</span> • تقدم بالطلب في: {merchant.appliedAt || merchant.createdAt}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Merchant Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-white/[0.04]">
                    <div>
                      <span className="text-[11px] text-slate-400 block">نشاط وتصنيف البضاعة:</span>
                      <span className="text-white font-medium truncate block">{merchant.category || 'عام'}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">حجم الشحنات المتوقع:</span>
                      <span className="text-orange-400 font-bold font-mono block">{merchant.expectedDailyOrders || '50 شحنة/يوم'}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">السجل التجاري (CR):</span>
                      <span className="text-slate-200 font-mono block">{merchant.commercialReg || 'تحت التدقيق'}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">رقم الهاتف:</span>
                      <span className="text-emerald-400 font-mono font-bold block">{merchant.phone}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">البريد الإلكتروني:</span>
                      <span className="text-slate-200 truncate block">{merchant.email}</span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">مقر الاستلام (Pickup):</span>
                      <span className="text-slate-200 truncate block">{merchant.governorate} - {merchant.city || ''}</span>
                    </div>

                    {merchant.pickupAddress && (
                      <div className="col-span-2 sm:col-span-3 pt-1 border-t border-white/[0.04] text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 inline ml-1 text-orange-400" />
                        عنوان المستودع: <span className="text-slate-200">{merchant.pickupAddress}</span>
                      </div>
                    )}

                    {merchant.storeUrl && (
                      <div className="col-span-2 sm:col-span-3 text-[11px]">
                        <a href={merchant.storeUrl} target="_blank" rel="noreferrer" className="text-orange-400 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                          معاينة رابط المتجر / الصفحة: {merchant.storeUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Merchant */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://wa.me/20${merchant.phone.replace(/^0/, '')}?text=مرحباً أستاذ ${merchant.name}، نود التواصل معكم بخصوص طلب انضمام متجركم (${merchant.companyName}) في منصة لوجستكس`, '_blank')}
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >
                      <MessageSquare className="w-3.5 h-3.5 ml-1" />
                      تواصل واتساب
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRejectingMerchant(merchant)}
                        className="text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 border-red-500/20"
                      >
                        <XCircle className="w-3.5 h-3.5 ml-1" />
                        اعتذار / رفض
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setApprovingMerchant(merchant);
                          setApprovalDiscount('10');
                        }}
                        className="text-xs font-bold shadow-md shadow-orange-500/20"
                      >
                        <UserCheck className="w-3.5 h-3.5 ml-1" />
                        قبول واعتماد المتجر
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REJECTED / SUSPENDED TAB CONTENT */}
      {activeTab === 'REJECTED' && (
        <div className="space-y-4 animate-fadeIn">
          {filteredMerchants.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/[0.06] text-xs text-slate-400">
              لا توجد طلبات معتذر عنها أو حسابات موقوفة.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMerchants.map((merchant) => (
                <Card key={merchant.id} className="p-4 border-red-500/20 bg-slate-900/60 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{merchant.companyName}</h3>
                      <div className="text-xs text-slate-400 mt-0.5">المسؤول: {merchant.name} • {merchant.phone}</div>
                    </div>
                    <Badge tone="red">معتذر عنه</Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-xs space-y-1">
                    <span className="text-[11px] font-bold text-red-400 block">سبب الرفض المسجل:</span>
                    <p className="text-slate-300 leading-relaxed">
                      {merchant.rejectionReason || 'عدم استيفاء السجل التجاري أو الشروط اللوجستية المطلوبة.'}
                    </p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setApprovingMerchant(merchant);
                        setApprovalDiscount('5');
                      }}
                      className="text-xs text-orange-400 hover:text-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5 ml-1" />
                      إعادة المراجعة والاعتماد الآن
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE MERCHANTS GRID */}
      {activeTab === 'ACTIVE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {filteredMerchants.map((merchant) => {
            const ordersCount = state.orders.filter((o) => o.merchantId === merchant.id).length;
            const inventoryCount = state.inventory
              .filter((i) => i.merchantId === merchant.id)
              .reduce((sum, i) => sum + i.availableQty + i.reservedQty, 0);

            return (
              <Card
                key={merchant.id}
                className="p-5 hover:border-orange-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">{merchant.companyName}</h3>
                      <div className="text-xs text-slate-300 mt-0.5">المسؤول: {merchant.name}</div>
                    </div>
                    <Badge tone={merchant.status === 'ACTIVE' ? 'emerald' : 'red'}>
                      {merchant.status === 'ACTIVE' ? 'نشط ومفعل' : 'معطل'}
                    </Badge>
                  </div>

                  {/* Balances */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="merchant-balance-box p-3 rounded-xl bg-slate-950/80 border border-white/[0.08]">
                      <span className="text-[10px] text-slate-400 font-semibold">الرصيد المتاح للسحب</span>
                      <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                        {formatMoney(merchant.availableBalance)}
                      </div>
                    </div>
                    <div className="merchant-balance-box p-3 rounded-xl bg-slate-950/80 border border-white/[0.08]">
                      <span className="text-[10px] text-slate-400 font-semibold">الرصيد المعلق (COD)</span>
                      <div className="text-base font-black text-orange-400 font-mono mt-0.5">
                        {formatMoney(merchant.pendingBalance)}
                      </div>
                    </div>
                  </div>

                  {/* Operational stats */}
                  <div className="text-xs text-slate-200 space-y-1.5 pt-2 border-t border-white/[0.06]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">إجمالي شحنات المتجر:</span>
                      <strong className="text-white font-mono">{ordersCount} طلب</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">قطع البضاعة بالمستودع:</span>
                      <strong className="text-white font-mono">{inventoryCount} قطعة</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">خصم الشحن المخصص:</span>
                      <strong className="text-orange-400 font-bold">{merchant.shippingDiscountPercent}%</strong>
                    </div>
                  </div>

                  {/* API Token Box */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <KeyRound className="w-3.5 h-3.5 text-orange-500" />
                        مفتاح الربط الحي (API):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyMockToken(merchant.id)}
                        className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-bold text-xs"
                      >
                        {copiedTokenId === merchant.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTokenId === merchant.id ? 'تم النسخ' : 'نسخ المفتاح'}</span>
                      </button>
                    </div>
                    <div className="merchant-api-key-box bg-[#060B19] border border-white/[0.08] p-2 rounded-lg font-mono text-[10px] text-slate-300 truncate">
                      ltx_live_sec_9942_{merchant.id}_••••••••••••
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    className="w-full justify-center text-xs text-slate-200 hover:text-white"
                    onClick={() => setSelectedMerchant(merchant)}
                  >
                    عرض ملف التاجر 360 والتسويات المحاسبية
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ---------------- MODAL 1: ADD NEW MERCHANT ---------------- */}
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="تسجيل تاجر جديد وإنشاء محفظة مالية"
        subtitle="إدخال بيانات المتجر وحساب البنك ونسبة خصم الشحن ومفاتيح الـ API"
        icon={Building2}
        size="md"
      >
        <form onSubmit={handleCreateMerchant} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسم المتجر / الشركة (Company Name)">
              <input
                type="text"
                required
                placeholder="مثال: متجر إلكترونيكس زون"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="اسم المسؤول المعتمد">
              <input
                type="text"
                required
                placeholder="مثال: م. أحمد عبد الرحمن"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="رقم هاتف التواصل والواتساب">
              <input
                type="text"
                required
                placeholder="01012345678"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="البريد الإلكتروني للتقارير">
              <input
                type="email"
                placeholder="merchant@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="نسبة خصم الشحن المخصصة (%)" hint="خصم ترويجي يخصم من تسعيرة الشحن القياسية">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className={`${inputClass} pl-8`}
                />
                <Percent className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </Field>

            <Field label="اسم البنك لتحويل الأرباح">
              <input
                type="text"
                placeholder="البنك الأهلي المصري / بنك مصر / CIB"
                value={newBank}
                onChange={(e) => setNewBank(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="اسم صاحب الحساب البنكي">
              <input
                type="text"
                placeholder="مطابق لبيانات البنك"
                value={newAccountHolder}
                onChange={(e) => setNewAccountHolder(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="رقم الآيبان البنكي (IBAN)">
              <input
                type="text"
                placeholder="EG0000000000000000000000000"
                value={newIban}
                onChange={(e) => setNewIban(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>سيتم إنشاء وتوليد مفاتيح الربط البرمجي (Webhook Secret & REST API Keys) تلقائياً بمجرد الحفظ.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              تأكيد تسجيل التاجر
            </Button>
          </div>
        </form>
      </Modal>

      {/* ---------------- MODAL 2: MERCHANT 360 & WALLET SETTLEMENT ---------------- */}
      {selectedMerchant && (
        <Modal
          open={!!selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
          title={`ملف التاجر الشامل: ${selectedMerchant.companyName}`}
          subtitle={`المسؤول: ${selectedMerchant.name} • الهاتف: ${selectedMerchant.phone} • مسجل بتاريخ ${selectedMerchant.createdAt}`}
          icon={Store}
          size="lg"
        >
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right">
                <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" /> الرصيد المتاح
                </span>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                  {formatMoney(selectedMerchant.availableBalance)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-right">
                <span className="text-[11px] text-orange-300 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> المعلق (COD)
                </span>
                <div className="text-xl font-black text-orange-400 font-mono mt-1">
                  {formatMoney(selectedMerchant.pendingBalance)}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-right">
                <span className="text-[11px] text-sky-300 font-semibold flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> إجمالي الشحنات
                </span>
                <div className="text-xl font-black text-white font-mono mt-1">
                  {state.orders.filter((o) => o.merchantId === selectedMerchant.id).length} طلب
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-right">
                <span className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> قطع بالمخزن
                </span>
                <div className="text-xl font-black text-white font-mono mt-1">
                  {state.inventory
                    .filter((i) => i.merchantId === selectedMerchant.id)
                    .reduce((sum, i) => sum + i.availableQty + i.reservedQty, 0)} قطعة
                </div>
              </div>
            </div>

            {/* Bank Details & Discount */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">البنك المعتمد:</span>
                <span className="font-bold text-white mt-0.5 block">{selectedMerchant.bankName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">رقم الآيبان (IBAN):</span>
                <span className="font-mono text-orange-400 mt-0.5 block">{selectedMerchant.iban}</span>
              </div>
              <div>
                <span className="text-slate-400 block">خصم الشحن المعتمد:</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">{selectedMerchant.shippingDiscountPercent}%</span>
              </div>
            </div>

            {/* Manual Wallet Adjustment Tool */}
            <Card className="p-4 bg-slate-900/60 border-orange-500/30 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <CreditCard className="w-4 h-4 text-orange-500" />
                <span>إجراء تسوية محاسبية وتعديل رصيد محفظة التاجر يدوياً (Manual Wallet Adjustment)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                يتم تسجيل كل تعديل رصيد تلقائياً في دفتر الأستاذ العام (General Ledger) وسجل الرقابة المالية مع بيان السبب واسم المسؤول.
              </p>

              <form onSubmit={handleApplyAdjustment} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-1">
                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">نوع الحركة المحاسبية</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as 'CREDIT' | 'DEBIT')}
                    className={inputClass}
                  >
                    <option value="CREDIT">إيداع دائن (+ Credit)</option>
                    <option value="DEBIT">خصم مدين (- Debit)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">المبلغ (ج.م)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="مثال: 500"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-semibold block mb-1">البيان وسبب التعديل</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: تسوية فروق شحنة أو مكافأة شحن"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <Button variant="primary" type="submit" className="w-full">
                    تطبيق التسوية
                  </Button>
                </div>
              </form>
            </Card>

            {/* API Integration Keys */}
            <Card className="p-4 space-y-2 bg-[#060B19]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-orange-500" />
                  مفاتيح الربط البرمجي الحي (Production API & Webhooks)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  متصل ومفعل
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`ltx_live_sec_9942_${selectedMerchant.id}_token_auth_secret`}
                  className={`${inputClass} font-mono text-xs text-orange-400 bg-slate-950`}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Copy}
                  onClick={() => handleCopyMockToken(selectedMerchant.id)}
                >
                  نسخ
                </Button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Webhook: https://api.logisttex.com/v1/webhooks/{selectedMerchant.id}</span>
                <button
                  type="button"
                  onClick={() => toast('تم إرسال إشعار فحص Webhook تجريبي بنجاح')}
                  className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 text-[11px]"
                >
                  <Send className="w-3 h-3" /> إرسال Ping تجريبي
                </button>
              </div>
            </Card>

            {/* Recent Orders of this merchant */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Package className="w-4 h-4 text-orange-500" />
                <span>آخر شحنات المتجر المسجلة بالنظام:</span>
              </div>
              <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-white/[0.08]">
                    <tr>
                      <th className="p-2.5">رقم الطلب</th>
                      <th className="p-2.5">العميل</th>
                      <th className="p-2.5">المحافظة</th>
                      <th className="p-2.5 text-center">المبلغ COD</th>
                      <th className="p-2.5 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {state.orders
                      .filter((o) => o.merchantId === selectedMerchant.id)
                      .slice(0, 5)
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-white/[0.02]">
                          <td className="p-2.5 font-bold text-white">{o.orderNumber}</td>
                          <td className="p-2.5 text-slate-300">{o.customerName}</td>
                          <td className="p-2.5 text-slate-400">{o.governorate}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-orange-400">{formatMoney(o.codAmount)}</td>
                          <td className="p-2.5 text-center"><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                    {state.orders.filter((o) => o.merchantId === selectedMerchant.id).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500 text-xs">
                          لا توجد شحنات منشأة لهذا المتجر بعد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* ---------------- MODAL 3: APPROVE MERCHANT APPLICATION ---------------- */}
      {approvingMerchant && (
        <Modal
          open={!!approvingMerchant}
          onClose={() => setApprovingMerchant(null)}
          title={`اعتماد وتفعيل حساب المتجر: ${approvingMerchant.companyName}`}
          subtitle={`المسؤول: ${approvingMerchant.name} • الهاتف: ${approvingMerchant.phone}`}
          icon={UserCheck}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                بمجرد الموافقة، سيتم تفعيل حساب التاجر فوراً ليتمكن من الدخول إلى بوابة التاجر وإنشاء الشحنات وجدولة أوامر التوريد ومتابعة التحصيلات.
              </span>
            </div>

            <div className="space-y-3">
              <Field label="نسبة خصم الشحن الممنوحة للتاجر (%)">
                <select
                  value={approvalDiscount}
                  onChange={(e) => setApprovalDiscount(e.target.value)}
                  className={inputClass}
                >
                  <option value="0">بدون خصم (0% - أسعار الشحن القياسية)</option>
                  <option value="5">خصم ترويجي 5% (متاجر جديدة)</option>
                  <option value="10">خصم قياسي 10% (الموصى به لمتوسط الشحنات)</option>
                  <option value="15">خصم كبار التجار 15% (VIP Partners)</option>
                  <option value="20">خصم استراتيجي 20% (حجم شحنات ضخم)</option>
                </select>
              </Field>

              <Field label="المستودع الرئيسي المخصص لاستقبال بضائع المتجر WMS">
                <select
                  value={approvalWarehouse}
                  onChange={(e) => setApprovalWarehouse(e.target.value)}
                  className={inputClass}
                >
                  <option value="المستودع الرئيسي - المنطقة الصناعية بالتجمع">المستودع الرئيسي - المنطقة الصناعية بالتجمع (القاهرة)</option>
                  <option value="مستودع غرب القاهرة - المنطقة الصناعية بالسادس من أكتوبر">مستودع غرب القاهرة - المنطقة الصناعية بالسادس من أكتوبر (الجيزة)</option>
                  <option value="مستودع برج العرب اللوجستي - الإسكندرية">مستودع برج العرب اللوجستي - الإسكندرية والساحل</option>
                  <option value="مستودع الدلتا الأوسط - طنطا">مستودع الدلتا الأوسط - طنطا</option>
                </select>
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <Button variant="ghost" onClick={() => setApprovingMerchant(null)}>
                إلغاء
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const res = approveMerchant(approvingMerchant.id, parseFloat(approvalDiscount) || 10);
                  if (res.ok) {
                    toast(`تم اعتماد وتفعيل متجر (${approvingMerchant.companyName}) بنجاح!`, 'success');
                    setApprovingMerchant(null);
                  } else {
                    toast(res.error || 'فشل الاعتماد', 'error');
                  }
                }}
                className="font-bold shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4 ml-1.5" />
                تأكيد الاعتماد والتفعيل الفوري
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------- MODAL 4: REJECT MERCHANT APPLICATION ---------------- */}
      {rejectingMerchant && (
        <Modal
          open={!!rejectingMerchant}
          onClose={() => setRejectingMerchant(null)}
          title={`الاعتذار عن قبول طلب: ${rejectingMerchant.companyName}`}
          subtitle={`المسؤول: ${rejectingMerchant.name} • الهاتف: ${rejectingMerchant.phone}`}
          icon={XCircle}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              سيظهر سبب الرفض المسجل هنا للتاجر في شاشة دخوله لتمكينه من استيفاء البيانات المطلوبة وتعديلها.
            </div>

            <Field label="سبب الاعتذار أو عدم استيفاء الشروط">
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className={`${inputClass} leading-relaxed text-xs`}
                placeholder="اكتب أسباب الرفض بوضوح (مثال: عدم وضوح السجل التجاري، خارج نطاق التغطية...)"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <Button variant="ghost" onClick={() => setRejectingMerchant(null)}>
                إلغاء
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const res = rejectMerchant(rejectingMerchant.id, rejectionReason);
                  if (res.ok) {
                    toast(`تم تسجيل رفض طلب متجر (${rejectingMerchant.companyName}) بنجاح`, 'info');
                    setRejectingMerchant(null);
                  } else {
                    toast(res.error || 'فشل تسجيل الرفض', 'error');
                  }
                }}
                className="text-red-400 hover:bg-red-500/10 border-red-500/20"
              >
                <XCircle className="w-4 h-4 ml-1.5" />
                تأكيد تسجيل الاعتذار
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

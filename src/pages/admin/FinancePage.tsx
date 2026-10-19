import { useState } from 'react';
import { 
  Wallet, 
  DollarSign, 
  CheckCircle2, 
  Plus, 
  Building2, 
  CreditCard, 
  Receipt, 
  AlertCircle,
  FileText,
  Printer,
  Eye,
  Search,
  Calendar,
  Clock
} from 'lucide-react';
import type { PayoutRequest, OperatingExpense, MerchantInvoice } from '../../types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../lib/format';
import { Badge, Button, Card, StatCard, Table, Tabs, Modal, rowClass, tdClass } from '../../components/ui';
import { BrandLogo } from '../../components/layout/BrandLogo';

interface Props {
  onOpenPayoutModal: (payout: PayoutRequest) => void;
}

export function FinancePage({ onOpenPayoutModal }: Props) {
  const { state, addExpense, approveExpense, createInvoice, markInvoicePaid } = useData();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'PAYOUTS' | 'INVOICES' | 'TREASURY' | 'EXPENSES' | 'LEDGER'>('PAYOUTS');

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<OperatingExpense['category']>('FUEL_VEHICLE');
  const [expCategoryLabel, setExpCategoryLabel] = useState('وقود وصيانة الأسطول');
  const [expAmount, setExpAmount] = useState<number>(1000);
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expAccountId, setExpAccountId] = useState(state.treasuryAccounts[0]?.id || 'acc-1');
  const [expNotes, setExpNotes] = useState('');

  // Invoice management state
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<MerchantInvoice | null>(null);
  const [invMerchantId, setInvMerchantId] = useState(state.merchants[0]?.id || '');
  const [invPeriodStart, setInvPeriodStart] = useState('2026-10-01');
  const [invPeriodEnd, setInvPeriodEnd] = useState('2026-10-15');
  const [invDeliveredOrders, setInvDeliveredOrders] = useState('25');
  const [invShippingFees, setInvShippingFees] = useState('1750');
  const [invStorageFees, setInvStorageFees] = useState('400');
  const [invFulfillmentFees, setInvFulfillmentFees] = useState('250');
  const [invCodCollected, setInvCodCollected] = useState('22000');
  const [invDueDate, setInvDueDate] = useState('2026-10-25');

  const totalCollectedCOD = state.orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.codAmount, 0);

  const pendingPayoutsTotal = state.payouts
    .filter((p) => p.status === 'PENDING' || p.status === 'APPROVED')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTreasuryBalance = state.treasuryAccounts.reduce((sum, a) => sum + a.balance, 0);

  const totalExpenses = state.expenses
    .filter((e) => e.status === 'PAID')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleCategoryChange = (cat: OperatingExpense['category']) => {
    setExpCategory(cat);
    const labels: Record<OperatingExpense['category'], string> = {
      FUEL_VEHICLE: 'وقود وصيانة الأسطول',
      WAREHOUSE_RENT: 'إيجار المستودعات',
      PACKAGING_MATERIALS: 'مستلزمات تغليف وطباعة',
      SALARIES: 'رواتب ومكافآت السائقين',
      UTILITIES: 'مرافق وكهرباء وإنترنت',
      OTHER: 'مصروفات تشغيلية متنوعة',
    };
    setExpCategoryLabel(labels[cat] || 'مصروف عام');
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addExpense({
      category: expCategory,
      categoryLabel: expCategoryLabel,
      amount: Number(expAmount),
      paidTo: expPaidTo,
      treasuryAccountId: expAccountId,
      recordedBy: 'المدير المالي (Admin)',
      notes: expNotes,
    });
    if (res.ok) {
      toast('تم تسجيل طلب المصروف التشغيلي بنجاح');
      setIsExpenseModalOpen(false);
      setExpPaidTo('');
      setExpNotes('');
    } else {
      toast(res.error || 'فشل تسجيل المصروف', 'error');
    }
  };

  const handleApproveExpense = (id: string) => {
    const res = approveExpense(id, 'المدير المالي (Admin)');
    if (res.ok) {
      toast('تم اعتماد المصروف وخصمه من حساب الخزينة بنجاح');
    } else {
      toast(res.error || 'فشل اعتماد المصروف', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20 shadow-lg shadow-orange-500/10">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white">المالية والخزينة ومدفوعات التجار (Finance & Treasury)</h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
                TREASURY V2
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              إدارة حسابات الخزينة، دورة سحب أرباح التجار (Payouts)، المصروفات التشغيلية، ومطابقة اليومية النقدية
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <Button
            variant="secondary"
            icon={FileText}
            size="sm"
            onClick={() => setIsInvoiceModalOpen(true)}
          >
            إصدار مطالبة تاجر
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
          >
            تسجيل سند صرف
          </Button>
        </div>
      </div>

      {/* Dedicated Executive Full-Width Tab Bar */}
      <Tabs
        value={activeTab}
        onChange={(id) => setActiveTab(id as 'PAYOUTS' | 'INVOICES' | 'TREASURY' | 'EXPENSES' | 'LEDGER')}
        tabs={[
          { id: 'PAYOUTS', label: 'طلبات سحب التجار (Payouts)', count: state.payouts.filter((p) => p.status === 'PENDING').length, icon: CreditCard },
          { id: 'INVOICES', label: 'فواتير ومطالبات التجار الدورية', count: state.invoices.filter((i) => i.status !== 'PAID').length, icon: FileText },
          { id: 'TREASURY', label: 'حسابات الخزينة والبنوك', count: state.treasuryAccounts.length, icon: Building2 },
          { id: 'EXPENSES', label: 'المصروفات التشغيلية', count: state.expenses.filter((e) => e.status === 'PENDING').length, icon: Receipt },
          { id: 'LEDGER', label: 'دفتر الأستاذ العام', count: state.transactions.length, icon: DollarSign },
        ]}
      />

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="السيولة المتاحة بالخزائن والبنوك"
          value={formatMoney(totalTreasuryBalance)}
          hint="رصيد نقدي متاح للصرف والتحويل"
          icon={Wallet}
          tone="emerald"
        />
        <StatCard
          label="إجمالي COD المحصل الفعلي"
          value={formatMoney(totalCollectedCOD)}
          hint="تحصيلات الأسطول من الشحنات المسلمة"
          icon={DollarSign}
          tone="blue"
        />
        <StatCard
          label="مستحقات التجار المعلقة للصرف"
          value={formatMoney(pendingPayoutsTotal)}
          hint="طلبات سحب قيد الاعتماد والمراجعة"
          icon={AlertCircle}
          tone="orange"
        />
        <StatCard
          label="المصروفات التشغيلية المنفذة"
          value={formatMoney(totalExpenses)}
          hint="وقود، صيانة، كراتين، وإيجارات"
          icon={Receipt}
          tone="slate"
        />
      </div>

      {/* Tab 1: Payout Requests */}
      {activeTab === 'PAYOUTS' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">طلبات التحويل البنكي وسحب الأرباح للشركاء</h2>
              <p className="text-xs text-slate-400">راجع الرصيد وحساب الآيبان قبل اعتماد التحويل</p>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20">
              {state.payouts.filter((p) => p.status === 'PENDING').length} بانتظار الاعتماد
            </span>
          </div>

          <Table
            columns={[
              'رقم الطلب',
              'التاجر',
              'البنك والآيبان (IBAN)',
              'المبلغ المطلوب',
              'تاريخ الطلب',
              'الحالة المالية',
              'إجراء الاعتماد',
            ]}
            isEmpty={state.payouts.length === 0}
          >
            {state.payouts.map((payout) => {
              const merchant = state.merchants.find((m) => m.id === payout.merchantId);
              return (
                <tr key={payout.id} className={rowClass}>
                  <td className={`${tdClass} font-mono font-bold text-orange-400`}>
                    {payout.requestNumber}
                  </td>
                  <td className={tdClass}>
                    <div className="font-bold text-white">{merchant?.companyName || 'تاجر'}</div>
                    <div className="text-[11px] text-slate-400">{merchant?.name}</div>
                  </td>
                  <td className={tdClass}>
                    <div className="text-slate-200 text-xs font-medium">{payout.bankName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{payout.iban}</div>
                  </td>
                  <td className={`${tdClass} font-mono font-black text-sm text-white`}>
                    {formatMoney(payout.amount)}
                  </td>
                  <td className={`${tdClass} font-mono text-slate-400 text-xs`}>
                    {payout.requestedAt}
                  </td>
                  <td className={tdClass}>
                    <Badge
                      tone={
                        payout.status === 'PAID'
                          ? 'emerald'
                          : payout.status === 'APPROVED'
                          ? 'blue'
                          : payout.status === 'REJECTED'
                          ? 'red'
                          : 'orange'
                      }
                    >
                      {payout.status === 'PAID' && 'تم التحويل بنجاح'}
                      {payout.status === 'APPROVED' && 'معتمد للصرف'}
                      {payout.status === 'PENDING' && 'قيد المراجعة'}
                      {payout.status === 'REJECTED' && 'مرفوض'}
                    </Badge>
                  </td>
                  <td className={tdClass}>
                    <Button
                      variant={payout.status === 'PENDING' ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => onOpenPayoutModal(payout)}
                    >
                      {payout.status === 'PENDING' ? 'مراجعة واعتماد' : 'عرض التفاصيل'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}

      {/* Tab: Merchant Invoices */}
      {activeTab === 'INVOICES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0A1228]/80 border border-white/[0.08]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span>فواتير ومطالبات المحاسبة الدورية للشركاء والتجار</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-[11px] font-bold">
                  {state.invoices.length} فاتورة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تصفية مستحقات شحن الطرود، رسوم التخزين WMS، خدمات التعبئة Pick & Pack، وتحصيلات الدفع عند الاستلام COD
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="بحث برقم الفاتورة أو التاجر..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  className="rounded-xl border border-white/[0.08] bg-[#070D1F] pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none w-56"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => setIsInvoiceModalOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إصدار مطالبة دورية جديدة</span>
              </Button>
            </div>
          </div>

          {/* Invoices Card Grid */}
          {state.invoices.filter((inv) => 
            !invoiceSearchQuery ||
            inv.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
            inv.merchantName.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
          ).length === 0 ? (
            <Card className="p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold">لا توجد فواتير تسوية مطابقة للبحث</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.invoices
                .filter((inv) => 
                  !invoiceSearchQuery ||
                  inv.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
                  inv.merchantName.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
                )
                .map((inv) => (
                  <Card
                    key={inv.id}
                    className="p-5 flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-all shadow-xl shadow-black/20 group rounded-2xl"
                  >
                    {/* Card Header: Invoice No + Merchant + Badge */}
                    <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-black text-orange-400 tracking-wide">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">({inv.merchantId})</span>
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">{inv.merchantName}</div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{inv.billingPeriodStart} إلى {inv.billingPeriodEnd}</span>
                          </div>
                        </div>
                      </div>

                      <Badge
                        tone={
                          inv.status === 'PAID'
                            ? 'emerald'
                            : inv.status === 'ISSUED'
                            ? 'blue'
                            : 'amber'
                        }
                      >
                        {inv.status === 'PAID' ? 'تم السداد والتسوية' : inv.status === 'ISSUED' ? 'معتمدة ومطالب بها' : 'مسودة مراجعة'}
                      </Badge>
                    </div>

                    {/* Hero Net Payout Box */}
                    <div className="rounded-xl p-3.5 bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold block">صافي المستحق للتاجر</span>
                        <span className="text-[10px] text-slate-500">بعد تصفية COD والرسوم</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-black text-emerald-400">
                          {formatMoney(inv.netPayoutAmount)}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {inv.deliveredOrdersCount} طرد مسلّم
                        </span>
                      </div>
                    </div>

                    {/* 3 Metrics Mini Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl p-2 bg-slate-900/60 border border-white/[0.04]">
                        <span className="text-[10px] text-slate-400 block mb-0.5">تحصيل COD</span>
                        <span className="font-mono text-[11px] font-bold text-emerald-400 block">
                          +{formatMoney(inv.codCollectedTotal)}
                        </span>
                      </div>

                      <div className="rounded-xl p-2 bg-slate-900/60 border border-white/[0.04]">
                        <span className="text-[10px] text-slate-400 block mb-0.5">رسوم الشحن</span>
                        <span className="font-mono text-[11px] font-bold text-red-400 block">
                          -{formatMoney(inv.shippingFeesTotal)}
                        </span>
                      </div>

                      <div className="rounded-xl p-2 bg-slate-900/60 border border-white/[0.04]">
                        <span className="text-[10px] text-slate-400 block mb-0.5">تخزين وتجهيز</span>
                        <span className="font-mono text-[11px] font-bold text-amber-400 block">
                          -{formatMoney(inv.storageFeesTotal + inv.fulfillmentFeesTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Due Date + Action Buttons */}
                    <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>الاستحقاق: {inv.dueAt}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="flex items-center gap-1 text-xs font-bold"
                          title="معاينة وطباعة الفاتورة الرسمية"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>معاينة وطباعة</span>
                        </Button>
                        {inv.status !== 'PAID' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              const res = markInvoicePaid(inv.id);
                              if (res.ok) {
                                toast(`تم قيد سداد الفاتورة ${inv.invoiceNumber} والتسوية بنجاح`);
                              } else {
                                toast(res.error || 'فشل سداد الفاتورة', 'error');
                              }
                            }}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>سداد واعتماد</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Treasury Accounts & Liquidity */}
      {activeTab === 'TREASURY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {state.treasuryAccounts.map((acc) => (
              <Card key={acc.id} className="p-5 flex flex-col justify-between border-white/[0.08]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                      {acc.type === 'CASH_VAULT' && <Wallet className="w-4 h-4" />}
                      {acc.type === 'BANK_ACCOUNT' && <Building2 className="w-4 h-4" />}
                      {acc.type === 'E_WALLET' && <CreditCard className="w-4 h-4" />}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      نشط للمدفوعات
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-3">{acc.name}</h3>
                  <div className="font-mono text-xs text-slate-400 mt-1">{acc.accountNumber}</div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <div className="text-[11px] text-slate-400">الرصيد المتاح اللحظي:</div>
                    <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                      {formatMoney(acc.balance)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>آخر حركة:</span>
                  <span>{acc.lastUpdated}</span>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-5 bg-gradient-to-r from-[#0B1430] to-[#070D1E] border-white/[0.08]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  الرقابة المحاسبية وسياسة مطابقة الخزينة (Cash Reconciliation Policy)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  تتم مطابقة نقدية المناديب يومياً فور تسليم الكشف (Manifest)، ويتم إيداع النقدية في الخزينة الرئيسية والتحويل لحساب CIB أسبوعياً.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Operating Expenses */}
      {activeTab === 'EXPENSES' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">المصروفات التشغيلية للمستودعات والأسطول</h2>
              <p className="text-xs text-slate-400 mt-0.5">تسجيل ومراجعة نفقات الوقود، الصيانة، الكراتين، والإيجارات</p>
            </div>

            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => setIsExpenseModalOpen(true)}
            >
              تسجيل مصروف جديد
            </Button>
          </div>

          <Table
            columns={[
              'رقم المصروف',
              'بند المصروف',
              'المبلغ',
              'الجهة المستلمة',
              'حساب الخزينة المسحوب منه',
              'المسؤول',
              'التاريخ',
              'الحالة والاعتماد',
            ]}
            isEmpty={state.expenses.length === 0}
          >
            {state.expenses.map((exp) => (
              <tr key={exp.id} className={rowClass}>
                <td className={`${tdClass} font-mono font-bold text-orange-400`}>
                  {exp.expenseNumber}
                </td>
                <td className={tdClass}>
                  <div className="font-bold text-white text-xs">{exp.categoryLabel}</div>
                  {exp.notes && <div className="text-[11px] text-slate-400">{exp.notes}</div>}
                </td>
                <td className={`${tdClass} font-mono font-black text-sm text-red-400`}>
                  -{formatMoney(exp.amount)}
                </td>
                <td className={`${tdClass} text-slate-200 text-xs`}>
                  {exp.paidTo}
                </td>
                <td className={`${tdClass} text-slate-400 text-xs font-medium`}>
                  {exp.treasuryAccountName}
                </td>
                <td className={`${tdClass} text-slate-400 text-xs`}>
                  {exp.recordedBy}
                </td>
                <td className={`${tdClass} font-mono text-slate-400 text-xs`}>
                  {exp.date}
                </td>
                <td className={tdClass}>
                  {exp.status === 'PAID' ? (
                    <Badge tone="emerald">
                      <CheckCircle2 className="w-3 h-3" /> تم الصرف
                    </Badge>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproveExpense(exp.id)}
                    >
                      اعتماد وصرف
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Tab 4: General Ledger */}
      {activeTab === 'LEDGER' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold text-white">دفتر الأستاذ والقيود المالية العامة (General Ledger)</h2>
            <p className="text-xs text-slate-400">سجل غير قابل للتعديل لكافة التدفقات النقدية والخصومات والعمولات</p>
          </div>

          <Table
            columns={[
              'رقم القيد',
              'نوع الحركة',
              'البيان والوصف',
              'المبلغ',
              'التاريخ والتوقيت',
              'الحالة',
            ]}
            isEmpty={state.transactions.length === 0}
          >
            {state.transactions.map((tx) => (
              <tr key={tx.id} className={rowClass}>
                <td className={`${tdClass} font-mono font-bold text-slate-300`}>
                  {tx.transactionNumber}
                </td>
                <td className={tdClass}>
                  <Badge tone={tx.amount > 0 ? 'emerald' : 'orange'}>
                    {tx.type}
                  </Badge>
                </td>
                <td className={`${tdClass} text-white`}>
                  {tx.description}
                </td>
                <td className={`${tdClass} font-mono font-bold text-sm`}>
                  <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-orange-400'}>
                    {tx.amount > 0 ? `+${formatMoney(tx.amount)}` : formatMoney(tx.amount)}
                  </span>
                </td>
                <td className={`${tdClass} font-mono text-slate-400`}>
                  {tx.date}
                </td>
                <td className={tdClass}>
                  <Badge tone="emerald">
                    <CheckCircle2 className="w-3 h-3" />
                    مكتمل (Idempotent)
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Add Operating Expense Modal */}
      {isExpenseModalOpen && (
        <Modal
          open
          onClose={() => setIsExpenseModalOpen(false)}
          title="تسجيل مصروف تشغيلي جديد"
          subtitle="يتم قيد المصروف وخصمه من حساب الخزينة بعد الاعتماد"
          icon={Receipt}
          size="md"
        >
          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">بند المصروف</label>
              <select
                value={expCategory}
                onChange={(e) => handleCategoryChange(e.target.value as any)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="FUEL_VEHICLE">وقود وصيانة الأسطول</option>
                <option value="PACKAGING_MATERIALS">مستلزمات تغليف وطباعة بوالص</option>
                <option value="WAREHOUSE_RENT">إيجار المستودعات</option>
                <option value="UTILITIES">مرافق وكهرباء وإنترنت</option>
                <option value="SALARIES">رواتب ومكافآت السائقين</option>
                <option value="OTHER">مصروفات تشغيلية أخرى</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المبلغ (ج.م)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الجهة المستلمة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محطة وطنية / شركة التغليف"
                  value={expPaidTo}
                  onChange={(e) => setExpPaidTo(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">حساب الخزينة / البنك</label>
              <select
                value={expAccountId}
                onChange={(e) => setExpAccountId(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                {state.treasuryAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (الرصيد: {formatMoney(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات وبيان المصروف</label>
              <textarea
                rows={2}
                placeholder="أدخل أي تفاصيل إضافية أو رقم الفاتورة الورقية..."
                value={expNotes}
                onChange={(e) => setExpNotes(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsExpenseModalOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" variant="primary">
                حفظ المصروف
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Generate Periodic Merchant Invoice Modal */}
      {isInvoiceModalOpen && (
        <Modal
          open
          onClose={() => setIsInvoiceModalOpen(false)}
          title="إصدار مطالبة وفاتورة دورية للتاجر"
          subtitle="حساب مستحقات الدورة المحاسبية شاملة خصومات الشحن والتخزين وتصفية الـ COD"
          icon={FileText}
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const merchant = state.merchants.find((m) => m.id === invMerchantId);
              const shipping = Number(invShippingFees) || 0;
              const storage = Number(invStorageFees) || 0;
              const fulfillment = Number(invFulfillmentFees) || 0;
              const cod = Number(invCodCollected) || 0;
              const netPayout = Math.max(0, cod - (shipping + storage + fulfillment));

              const res = createInvoice({
                merchantId: invMerchantId,
                merchantName: merchant?.companyName || 'متجر معتمد',
                billingPeriodStart: invPeriodStart,
                billingPeriodEnd: invPeriodEnd,
                deliveredOrdersCount: Number(invDeliveredOrders) || 0,
                shippingFeesTotal: shipping,
                storageFeesTotal: storage,
                fulfillmentFeesTotal: fulfillment,
                codCollectedTotal: cod,
                netPayoutAmount: netPayout,
                dueAt: `${invDueDate} 23:59`,
              });

              if (res.ok) {
                toast('تم إصدار فاتورة المطالبة الدورية وقيدها بالسجلات بنجاح');
                setIsInvoiceModalOpen(false);
              } else {
                toast(res.error || 'فشل إصدار الفاتورة', 'error');
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">التاجر / الشريك المستفيد</label>
              <select
                value={invMerchantId}
                onChange={(e) => setInvMerchantId(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
              >
                {state.merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.companyName} — ({m.name}) — الرصيد الحالي: {formatMoney(m.availableBalance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">بداية الفترة المحاسبية</label>
                <input
                  type="date"
                  required
                  value={invPeriodStart}
                  onChange={(e) => setInvPeriodStart(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">نهاية الفترة المحاسبية</label>
                <input
                  type="date"
                  required
                  value={invPeriodEnd}
                  onChange={(e) => setInvPeriodEnd(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">تاريخ الاستحقاق النهائي</label>
                <input
                  type="date"
                  required
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">شحنات تم تسليمها</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={invDeliveredOrders}
                  onChange={(e) => setInvDeliveredOrders(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">إجمالي رسوم الشحن (-)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={invShippingFees}
                  onChange={(e) => setInvShippingFees(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-red-400 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رسوم تخزين WMS (-)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={invStorageFees}
                  onChange={(e) => setInvStorageFees(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-amber-400 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">رسوم التجهيز والتغليف (-)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={invFulfillmentFees}
                  onChange={(e) => setInvFulfillmentFees(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-amber-400 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">إجمالي تحصيلات الـ COD المسلمة للعملاء (+)</label>
              <input
                type="number"
                min="0"
                required
                value={invCodCollected}
                onChange={(e) => setInvCodCollected(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Calculated Net Payout Banner */}
            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-300 block">صافي الحوالة / التسوية المستحقة للتاجر:</span>
                <span className="text-[11px] text-slate-400">(تحصيل COD - عمولات الشحن والتخزين والتجهيز)</span>
              </div>
              <div className="font-mono text-lg font-black text-orange-400">
                {formatMoney(
                  Math.max(
                    0,
                    (Number(invCodCollected) || 0) -
                      ((Number(invShippingFees) || 0) + (Number(invStorageFees) || 0) + (Number(invFulfillmentFees) || 0))
                  )
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setIsInvoiceModalOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" variant="primary">
                إصدار الفاتورة واعتمادها
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Invoice Sheet Preview & Print Modal */}
      {selectedInvoiceForPrint && (
        <Modal
          open
          onClose={() => setSelectedInvoiceForPrint(null)}
          title="معاينة وطباعة الفاتورة الرسمية (Official Merchant Invoice)"
          subtitle="مستند ضريبي ومحاسبي معتمد متوافق مع متطلبات الفوترة الإلكترونية"
          icon={Printer}
          size="lg"
        >
          <div className="space-y-4">
            <div id="printable-invoice" className="bg-[#050B18] p-6 rounded-2xl border border-white/[0.1] text-slate-200 space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/[0.1] pb-4">
                <div className="flex items-center gap-4">
                  <BrandLogo height={42} />
                  <div>
                    <h2 className="text-lg font-black text-white">منظومة LogistteX اللوجستية المعتمدة</h2>
                    <p className="text-[11px] text-slate-400 font-mono">سجل تجاري: 109283 / بطاقة ضريبية: 492-381-002</p>
                    <p className="text-[11px] text-slate-400">القرية الذكية، الجيزة، جمهورية مصر العربية</p>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-sm font-black text-orange-400 block">{selectedInvoiceForPrint.invoiceNumber}</span>
                  <span className="text-[11px] text-slate-400 block">تاريخ الإصدار: {selectedInvoiceForPrint.issuedAt}</span>
                  <span className="text-[11px] text-slate-400 block">تاريخ الاستحقاق: {selectedInvoiceForPrint.dueAt}</span>
                  <div className="mt-1">
                    <Badge tone={selectedInvoiceForPrint.status === 'PAID' ? 'emerald' : selectedInvoiceForPrint.status === 'ISSUED' ? 'blue' : 'amber'}>
                      {selectedInvoiceForPrint.status === 'PAID' ? 'تمت التسوية بنجاح (PAID)' : selectedInvoiceForPrint.status === 'ISSUED' ? 'مطالبة معتمدة (ISSUED)' : 'مسودة (DRAFT)'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">بيانات التاجر المستفيد:</span>
                  <h3 className="text-sm font-bold text-white">{selectedInvoiceForPrint.merchantName}</h3>
                  <p className="text-xs text-slate-300">معرف الشريك: <span className="font-mono text-orange-400">{selectedInvoiceForPrint.merchantId}</span></p>
                  <p className="text-xs text-slate-400">حساب التسوية: تحويل بنكي / محفظة معتمدة</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">فترة المطالبة المحاسبية:</span>
                  <p className="text-xs text-slate-200 font-mono">من: <span className="text-white font-bold">{selectedInvoiceForPrint.billingPeriodStart}</span></p>
                  <p className="text-xs text-slate-200 font-mono">إلى: <span className="text-white font-bold">{selectedInvoiceForPrint.billingPeriodEnd}</span></p>
                  <p className="text-xs text-cyan-400 font-bold mt-1">عدد الشحنات المسلمة: {selectedInvoiceForPrint.deliveredOrdersCount} طلب</p>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="overflow-hidden rounded-xl border border-white/[0.08]">
                <table className="w-full text-right text-xs">
                  <thead className="bg-white/[0.04] text-slate-300 font-bold border-b border-white/[0.08]">
                    <tr>
                      <th className="p-3">بيان البند والخدمة اللوجستية</th>
                      <th className="p-3 text-center">النوع</th>
                      <th className="p-3 text-left">المبلغ (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05] font-mono">
                    <tr>
                      <td className="p-3 font-sans text-white">إجمالي تحصيلات الدفع عند الاستلام (COD) المحصلة لصالح التاجر</td>
                      <td className="p-3 text-center font-sans"><span className="text-emerald-400 font-bold">دائن (+)</span></td>
                      <td className="p-3 text-left font-bold text-emerald-400">+{formatMoney(selectedInvoiceForPrint.codCollectedTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-slate-300">أجور شحن ونقل الطرود المسلمة ({selectedInvoiceForPrint.deliveredOrdersCount} شحنة)</td>
                      <td className="p-3 text-center font-sans"><span className="text-red-400 font-bold">مدين (-)</span></td>
                      <td className="p-3 text-left text-red-400">-{formatMoney(selectedInvoiceForPrint.shippingFeesTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-slate-300">رسوم حجز المساحة التخزينية WMS الدورية</td>
                      <td className="p-3 text-center font-sans"><span className="text-amber-400 font-bold">مدين (-)</span></td>
                      <td className="p-3 text-left text-amber-400">-{formatMoney(selectedInvoiceForPrint.storageFeesTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-slate-300">خدمات تجهيز الطلبات والفحص والتغليف (Pick & Pack)</td>
                      <td className="p-3 text-center font-sans"><span className="text-amber-400 font-bold">مدين (-)</span></td>
                      <td className="p-3 text-left text-amber-400">-{formatMoney(selectedInvoiceForPrint.fulfillmentFeesTotal)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-orange-500/10 via-[#FA541C]/15 to-orange-500/10 font-bold border-t-2 border-orange-500/40">
                    <tr>
                      <td colSpan={2} className="p-3.5 text-white font-sans text-sm">صافي المبلغ المستحق للتحويل إلى حساب التاجر:</td>
                      <td className="p-3.5 text-left font-mono text-base font-black text-orange-400">
                        {formatMoney(selectedInvoiceForPrint.netPayoutAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Notes & Digital Stamp */}
              <div className="flex justify-between items-end pt-2 text-[11px] text-slate-400">
                <div className="space-y-1">
                  <p>• هذه الفاتورة صادرة إلكترونياً من منصة LogistteX ومعتمدة محاسبياً وقانونياً دون حاجة لتوقيع يدوي.</p>
                  <p>• في حال وجود استفسار أو اعتراض على الأرقام، يرجى تقديم تذكرة دعم خلال 48 ساعة من تاريخ الإصدار.</p>
                </div>
                <div className="text-center font-mono border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 rounded-xl text-emerald-400">
                  <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">Digital Seal</span>
                  <span className="text-xs font-black">LOGISTTEX VERIFIED</span>
                </div>
              </div>

            </div>

            {/* Print & Close Actions */}
            <div className="pt-2 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => setSelectedInvoiceForPrint(null)}
              >
                إغلاق
              </Button>
              <Button
                variant="primary"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة الرسمية</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

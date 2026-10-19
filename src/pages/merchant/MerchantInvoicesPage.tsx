import { useState } from 'react';
import { 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Printer, 
  Eye, 
  Clock, 
  Search,
  Calendar
} from 'lucide-react';
import type { MerchantInvoice } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatMoney } from '../../lib/format';
import { Badge, Button, Card, StatCard, Modal } from '../../components/ui';
import { BrandLogo } from '../../components/layout/BrandLogo';

export function MerchantInvoicesPage() {
  const { activeMerchantId } = useAuth();
  const { state } = useData();

  const merchant = state.merchants.find((m) => m.id === activeMerchantId) || state.merchants[0];
  const merchantInvoices = state.invoices.filter((inv) => inv.merchantId === (merchant?.id || activeMerchantId));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<MerchantInvoice | null>(null);

  const filteredInvoices = merchantInvoices.filter((inv) => 
    !searchQuery ||
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.billingPeriodStart.includes(searchQuery) ||
    inv.billingPeriodEnd.includes(searchQuery)
  );

  const totalCodCollected = merchantInvoices.reduce((sum, inv) => sum + inv.codCollectedTotal, 0);
  const totalDeductions = merchantInvoices.reduce((sum, inv) => sum + inv.shippingFeesTotal + inv.storageFeesTotal + inv.fulfillmentFeesTotal, 0);
  const totalPaidOut = merchantInvoices.filter((i) => i.status === 'PAID').reduce((sum, inv) => sum + inv.netPayoutAmount, 0);
  const totalPendingSettlement = merchantInvoices.filter((i) => i.status !== 'PAID').reduce((sum, inv) => sum + inv.netPayoutAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <span>فواتير التسوية والمطالبات المحاسبية (Periodic Merchant Invoices)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            كشوف الحسابات الدورية الصادرة من LogistteX شاملة تصفية تحصيلات COD واقتطاع أجور الشحن والتخزين WMS.
          </p>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي تحصيلات الـ COD"
          value={formatMoney(totalCodCollected)}
          hint="إجمالي المبالغ المحصلة من عملائك"
          icon={DollarSign}
          tone="emerald"
        />
        <StatCard
          label="إجمالي رسوم الخدمات المقتطعة"
          value={formatMoney(totalDeductions)}
          hint="شحن + تخزين WMS + تغليف Pick & Pack"
          icon={FileText}
          tone="red"
        />
        <StatCard
          label="مستحقات تم تحويلها وسدادها"
          value={formatMoney(totalPaidOut)}
          hint="حوالات بنكية مكتملة لحسابك"
          icon={CheckCircle2}
          tone="blue"
        />
        <StatCard
          label="صافي مستحقات قيد التسوية"
          value={formatMoney(totalPendingSettlement)}
          hint="فواتير معتمدة بانتظار دورة الصرف"
          icon={Clock}
          tone="orange"
        />
      </div>

      {/* Search and Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0A1228]/80 border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">سجل فواتير التسوية الصادرة لمتجر {merchant?.companyName}</h2>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-[11px] font-bold">
              {filteredInvoices.length} فاتورة
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">يمكنك معاينة تفاصيل أي فاتورة وتحميل النسخة الرسمية للطباعة</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="بحث برقم الفاتورة أو الفترة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Card Grid */}
      {filteredInvoices.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold">لا توجد فواتير تسوية مطابقة للبحث</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvoices.map((inv) => (
            <Card
              key={inv.id}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-all shadow-xl shadow-black/20 group rounded-2xl"
            >
              {/* Card Header: Invoice No + Status Badge */}
              <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-black text-orange-400 tracking-wide">
                      {inv.invoiceNumber}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
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
                  {inv.status === 'PAID' ? 'تم التحويل لحسابك' : inv.status === 'ISSUED' ? 'معتمدة للصرف' : 'مسودة مراجعة'}
                </Badge>
              </div>

              {/* Hero Net Payout Box */}
              <div className="rounded-xl p-3.5 bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">صافي المحول لحسابك البنكي</span>
                  <span className="text-[10px] text-slate-500">بعد خصم الرسوم والخدمات</span>
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

              {/* Card Footer: Due Date + Action Button */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>الاستحقاق: {inv.dueAt}</span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedInvoice(inv)}
                  className="flex items-center gap-1.5 text-xs font-bold"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>معاينة وطباعة</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Official Invoice Sheet Preview & Print Modal */}
      {selectedInvoice && (
        <Modal
          open
          onClose={() => setSelectedInvoice(null)}
          title="معاينة وطباعة فاتورة التسوية الرسمية"
          subtitle="مستند مالي معتمد يوضح الحسابات التفصيلية للطلبات والخدمات"
          icon={Printer}
          size="lg"
        >
          <div className="space-y-4">
            <div id="printable-merchant-invoice" className="bg-[#050B18] p-6 rounded-2xl border border-white/[0.1] text-slate-200 space-y-6">
              
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
                  <span className="text-sm font-black text-orange-400 block">{selectedInvoice.invoiceNumber}</span>
                  <span className="text-[11px] text-slate-400 block">تاريخ الإصدار: {selectedInvoice.issuedAt}</span>
                  <span className="text-[11px] text-slate-400 block">تاريخ الاستحقاق: {selectedInvoice.dueAt}</span>
                  <div className="mt-1">
                    <Badge tone={selectedInvoice.status === 'PAID' ? 'emerald' : selectedInvoice.status === 'ISSUED' ? 'blue' : 'amber'}>
                      {selectedInvoice.status === 'PAID' ? 'تمت التسوية بنجاح (PAID)' : selectedInvoice.status === 'ISSUED' ? 'معتمدة للصرف (ISSUED)' : 'مسودة'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">التاجر المستفيد:</span>
                  <h3 className="text-sm font-bold text-white">{selectedInvoice.merchantName}</h3>
                  <p className="text-xs text-slate-300">معرف الشريك: <span className="font-mono text-orange-400">{selectedInvoice.merchantId}</span></p>
                  <p className="text-xs text-slate-400">حساب التسوية: تحويل بنكي / محفظة معتمدة</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1">الفترة المحاسبية:</span>
                  <p className="text-xs text-slate-200 font-mono">من: <span className="text-white font-bold">{selectedInvoice.billingPeriodStart}</span></p>
                  <p className="text-xs text-slate-200 font-mono">إلى: <span className="text-white font-bold">{selectedInvoice.billingPeriodEnd}</span></p>
                  <p className="text-xs text-cyan-400 font-bold mt-1">عدد الشحنات المسلمة: {selectedInvoice.deliveredOrdersCount} طلب</p>
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
                      <td className="p-3 text-left font-bold text-emerald-400">+{formatMoney(selectedInvoice.codCollectedTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-slate-300">أجور شحن ونقل الطرود المسلمة ({selectedInvoice.deliveredOrdersCount} شحنة)</td>
                      <td className="p-3 text-center font-sans"><span className="text-red-400 font-bold">مدين (-)</span></td>
                      <td className="p-3 text-left text-red-400">-{formatMoney(selectedInvoice.shippingFeesTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-slate-300">رسوم حجز المساحة التخزينية WMS الدورية</td>
                      <td className="p-3 text-center font-sans"><span className="text-amber-400 font-bold">مدين (-)</span></td>
                      <td className="p-3 text-left text-amber-400">-{formatMoney(selectedInvoice.storageFeesTotal)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-slate-300">خدمات تجهيز الطلبات والفحص والتغليف (Pick & Pack)</td>
                      <td className="p-3 text-center font-sans"><span className="text-amber-400 font-bold">مدين (-)</span></td>
                      <td className="p-3 text-left text-amber-400">-{formatMoney(selectedInvoice.fulfillmentFeesTotal)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gradient-to-r from-orange-500/10 via-[#FA541C]/15 to-orange-500/10 font-bold border-t-2 border-orange-500/40">
                    <tr>
                      <td colSpan={2} className="p-3.5 text-white font-sans text-sm">صافي المبلغ المستحق للتحويل إلى حساب التاجر:</td>
                      <td className="p-3.5 text-left font-mono text-base font-black text-orange-400">
                        {formatMoney(selectedInvoice.netPayoutAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Notes & Digital Stamp */}
              <div className="flex justify-between items-end pt-2 text-[11px] text-slate-400">
                <div className="space-y-1">
                  <p>• هذه الفاتورة صادرة إلكترونياً من منصة LogistteX ومعتمدة محاسبياً وقانونياً دون حاجة لتوقيع يدوي.</p>
                  <p>• تم تدقيق الأرقام ومطابقتها مع اليومية النقدية للأسطول والمستودعات.</p>
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
                onClick={() => setSelectedInvoice(null)}
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

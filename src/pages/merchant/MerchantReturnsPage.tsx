import { useState } from 'react';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Eye, 
  Package
} from 'lucide-react';
import type { ReturnItemInspection } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Badge, Button, Card, StatCard, Table, Tabs, Modal, rowClass, tdClass } from '../../components/ui';

export function MerchantReturnsPage() {
  const { activeMerchantId } = useAuth();
  const { state } = useData();

  const merchant = state.merchants.find((m) => m.id === activeMerchantId) || state.merchants[0];
  const merchantReturns = state.returns.filter((r) => r.merchantId === (merchant?.id || activeMerchantId));

  const [activeTab, setActiveTab] = useState<'ALL' | 'RESTOCKED' | 'DAMAGED_SCRAPPED' | 'PENDING_INSPECTION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReturnItemInspection | null>(null);

  const filteredReturns = merchantReturns.filter((ret) => {
    const matchesTab = activeTab === 'ALL' || ret.inspectionStatus === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      ret.returnNumber.toLowerCase().includes(q) ||
      ret.orderNumber.toLowerCase().includes(q) ||
      ret.trackingNumber.toLowerCase().includes(q) ||
      ret.sku.toLowerCase().includes(q) ||
      ret.itemName.toLowerCase().includes(q) ||
      ret.customerName.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const restockedCount = merchantReturns.filter((r) => r.inspectionStatus === 'RESTOCKED').length;
  const damagedCount = merchantReturns.filter((r) => r.inspectionStatus === 'DAMAGED_SCRAPPED').length;
  const pendingCount = merchantReturns.filter((r) => r.inspectionStatus === 'PENDING_INSPECTION').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-orange-500" />
            <span>المرتجعات وفحص الجودة اللوجستي (Returns & QC Inspections)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة الشحنات المرتجعة من مناديب التوصيل، فحص مهندسي الجودة، وإعادة الصالح منها للرفوف المخزنية أو إثبات التالف.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي المرتجعات"
          value={`${merchantReturns.length} صنف`}
          hint="كافة الشحنات المرتجعة للمستودع"
          icon={RotateCcw}
          tone="orange"
        />
        <StatCard
          label="أعيد للمخزون (Restocked)"
          value={`${restockedCount} صنف`}
          hint="صالح للاستخدام ومتاح للبيع مجدداً"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="أصناف تالفة ومستهلكة"
          value={`${damagedCount} صنف`}
          hint="تقرر إهلاكها بناءً على تقرير الجودة"
          icon={AlertTriangle}
          tone="red"
        />
        <StatCard
          label="بانتظار فحص الجودة (QC)"
          value={`${pendingCount} صنف`}
          hint="بمنطقة الاستلام بانتظار المعاينة"
          icon={Clock}
          tone="amber"
        />
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <Tabs
            value={activeTab}
            onChange={(t) => setActiveTab(t as any)}
            tabs={[
              { id: 'ALL', label: 'كافة المرتجعات', count: merchantReturns.length, icon: RotateCcw },
              { id: 'RESTOCKED', label: 'سليم وأعيد للرف', count: restockedCount, icon: CheckCircle2 },
              { id: 'DAMAGED_SCRAPPED', label: 'تالف ومستهلك', count: damagedCount, icon: AlertTriangle },
              { id: 'PENDING_INSPECTION', label: 'قيد الفحص المخزني', count: pendingCount, icon: Clock },
            ]}
          />

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="بحث برقم الشحنة، البوليصة، أو SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#070D1F] pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none w-64"
            />
          </div>
        </div>

        <Table
          columns={[
            'رقم المرتجع',
            'الشحنة والبوليصة',
            'العميل وسبب الرفض',
            'الصنف ورمز SKU',
            'الكمية',
            'نتيجة الفحص (QC)',
            'تاريخ الفحص',
            'تقرير الفحص',
          ]}
          isEmpty={filteredReturns.length === 0}
        >
          {filteredReturns.map((ret) => (
            <tr key={ret.id} className={rowClass}>
              <td className={`${tdClass} font-mono font-bold text-orange-400 text-xs`}>
                {ret.returnNumber}
              </td>
              <td className={tdClass}>
                <div className="font-mono text-xs font-bold text-white">{ret.orderNumber}</div>
                <div className="font-mono text-[10px] text-slate-400">{ret.trackingNumber}</div>
              </td>
              <td className={tdClass}>
                <div className="font-bold text-slate-200 text-xs">{ret.customerName}</div>
                <div className="text-[11px] text-slate-400 max-w-xs truncate" title={ret.returnReason}>
                  {ret.returnReason}
                </div>
              </td>
              <td className={tdClass}>
                <div className="text-white text-xs font-semibold">{ret.itemName}</div>
                <div className="font-mono text-[10px] text-slate-400">{ret.sku}</div>
              </td>
              <td className={`${tdClass} text-center font-mono font-bold text-white`}>
                {ret.quantity}
              </td>
              <td className={tdClass}>
                <Badge
                  tone={
                    ret.inspectionStatus === 'RESTOCKED'
                      ? 'emerald'
                      : ret.inspectionStatus === 'DAMAGED_SCRAPPED'
                      ? 'red'
                      : 'amber'
                  }
                >
                  {ret.inspectionStatus === 'RESTOCKED'
                    ? 'سليم وأعيد للرف'
                    : ret.inspectionStatus === 'DAMAGED_SCRAPPED'
                    ? 'تالف تقرر إهلاكه'
                    : 'بانتظار الفحص'}
                </Badge>
              </td>
              <td className={`${tdClass} font-mono text-[11px] text-slate-400`}>
                {ret.inspectionDate || '—'}
              </td>
              <td className={tdClass}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedReport(ret)}
                  className="flex items-center gap-1 text-[11px] py-1 px-2.5"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>تقرير QC</span>
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Detailed Inspection Report Modal */}
      {selectedReport && (
        <Modal
          open
          onClose={() => setSelectedReport(null)}
          title={`تقرير فحص ومطابقة المرتجع (${selectedReport.returnNumber})`}
          subtitle="تقرير فني صادر عن فريق ضبط الجودة بمستودع التخزين"
          icon={FileCheck}
          size="md"
        >
          <div className="space-y-4 text-xs">
            
            <div className="grid grid-cols-2 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
              <div>
                <span className="text-slate-400 block text-[10px]">رقم الشحنة الأصلية:</span>
                <span className="font-mono font-bold text-white">{selectedReport.orderNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">رقم التتبع:</span>
                <span className="font-mono font-bold text-orange-400">{selectedReport.trackingNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">العميل المستلم:</span>
                <span className="font-bold text-slate-200">{selectedReport.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">هاتف العميل:</span>
                <span className="font-mono text-slate-300" dir="ltr">{selectedReport.customerPhone}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-orange-400" />
                  <span>{selectedReport.itemName}</span>
                </span>
                <span className="font-mono text-slate-400">{selectedReport.sku}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-white/[0.04]">
                <span>الكمية المرتجعة:</span>
                <span className="font-bold text-white font-mono">{selectedReport.quantity} قطعة</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block text-[10px] mb-0.5">سبب رفض الاستلام / الإرجاع:</span>
                <p className="text-slate-200 bg-black/20 p-2 rounded-lg font-medium">{selectedReport.returnReason}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">قرار مهندس الجودة (QC Verdict):</span>
                <Badge
                  tone={
                    selectedReport.inspectionStatus === 'RESTOCKED'
                      ? 'emerald'
                      : selectedReport.inspectionStatus === 'DAMAGED_SCRAPPED'
                      ? 'red'
                      : 'amber'
                  }
                >
                  {selectedReport.inspectionStatus === 'RESTOCKED'
                    ? 'سليم تماماً وأعيد للرف'
                    : selectedReport.inspectionStatus === 'DAMAGED_SCRAPPED'
                    ? 'تالف - غير صالح لإعادة البيع'
                    : 'قيد الفحص والمعاينة'}
                </Badge>
              </div>

              {selectedReport.inspectedBy && (
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>تم الفحص بواسطة: <strong className="text-slate-200">{selectedReport.inspectedBy}</strong></span>
                  <span className="font-mono">{selectedReport.inspectionDate}</span>
                </div>
              )}

              {selectedReport.notes && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-slate-400 block mb-0.5">ملاحظات الفحص التفصيلية:</span>
                  <p className="text-slate-300 font-mono text-[11px] bg-black/30 p-2.5 rounded-lg border border-white/5">
                    {selectedReport.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedReport(null)}>
                إغلاق التقرير
              </Button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
}

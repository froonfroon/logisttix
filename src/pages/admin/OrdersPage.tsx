import { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Eye, 
  Truck, 
  CheckSquare, 
  X,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { downloadCsv, formatMoney } from '../../lib/format';
import { Button, Card, StatusBadge, Table, Modal, Field, inputClass, rowClass, tdClass } from '../../components/ui';

interface Props {
  onOpenNewOrder: () => void;
  onSelectOrder: (orderId: string) => void;
  onPrintWaybills: (orders: Order[]) => void;
}

const STATUS_TABS: { id: string; label: string; status?: OrderStatus }[] = [
  { id: 'ALL', label: 'كافة الشحنات' },
  { id: 'PENDING', label: 'قيد المراجعة', status: 'PENDING' },
  { id: 'CONFIRMED', label: 'مؤكدة ومحجوزة', status: 'CONFIRMED' },
  { id: 'FULFILLMENT', label: 'تجهيز المستودع' },
  { id: 'READY_FOR_DISPATCH', label: 'جاهز للشحن', status: 'READY_FOR_DISPATCH' },
  { id: 'OUT_FOR_DELIVERY', label: 'مع المناديب', status: 'OUT_FOR_DELIVERY' },
  { id: 'DELIVERED', label: 'تم التسليم والتحصيل', status: 'DELIVERED' },
  { id: 'RETURNED', label: 'مرتجعات', status: 'RETURNED' },
  { id: 'CANCELLED', label: 'ملغاة', status: 'CANCELLED' },
];

export function OrdersPage({
  onOpenNewOrder,
  onSelectOrder,
  onPrintWaybills,
}: Props) {
  const { state, bulkAssignOrdersToDriver } = useData();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<string>('ALL');
  const [merchantFilter, setMerchantFilter] = useState<string>('ALL');
  const [govFilter, setGovFilter] = useState<string>('ALL');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Bulk Assign Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>(state.drivers[0]?.id || '');

  // Unique governorates present in current orders
  const governorates = useMemo(() => {
    const set = new Set<string>();
    state.orders.forEach((o) => {
      if (o.governorate) set.add(o.governorate);
    });
    return Array.from(set).sort();
  }, [state.orders]);

  // Dynamic status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: state.orders.length, FULFILLMENT: 0 };
    STATUS_TABS.forEach((tab) => {
      if (tab.status) {
        counts[tab.id] = state.orders.filter((o) => o.status === tab.status).length;
      }
    });
    counts.FULFILLMENT = state.orders.filter((o) => ['PICKING', 'PACKING'].includes(o.status)).length;
    return counts;
  }, [state.orders]);

  const filteredOrders = useMemo(() => {
    return state.orders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.includes(searchQuery) ||
        o.customerPhone.includes(searchQuery);

      let matchesStatus = true;
      if (statusTab === 'FULFILLMENT') {
        matchesStatus = ['PICKING', 'PACKING'].includes(o.status);
      } else if (statusTab !== 'ALL') {
        matchesStatus = o.status === statusTab;
      }

      const matchesMerchant = merchantFilter === 'ALL' || o.merchantId === merchantFilter;
      const matchesGov = govFilter === 'ALL' || o.governorate === govFilter;

      return matchesSearch && matchesStatus && matchesMerchant && matchesGov;
    });
  }, [state.orders, searchQuery, statusTab, merchantFilter, govFilter]);

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    const ordersToExport = selectedOrderIds.length > 0
      ? state.orders.filter((o) => selectedOrderIds.includes(o.id))
      : filteredOrders;

    const headers = ['رقم الطلب', 'رقم التتبع', 'التاجر', 'اسم العميل', 'هاتف العميل', 'المحافظة', 'المدينة', 'العنوان', 'قيمة التحصيل COD', 'رسوم الشحن', 'الحالة', 'مندوب التوزيع', 'التاريخ'];
    const rows = ordersToExport.map((o) => [
      o.orderNumber,
      o.trackingNumber,
      o.merchantName,
      o.customerName,
      o.customerPhone,
      o.governorate,
      o.city,
      o.address,
      o.codAmount,
      o.shippingFee,
      o.status,
      o.driverName || 'غير مسند',
      o.createdAt.slice(0, 10),
    ]);
    downloadCsv(`logisttex-orders-${Date.now()}.csv`, headers, rows);
    toast(`تم تصدير ${ordersToExport.length} طلب إلى ملف CSV بنجاح`);
  };

  const handleBulkPrint = () => {
    const selected = state.orders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length > 0) {
      onPrintWaybills(selected);
    }
  };

  const handleBulkAssignConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId) {
      toast('يرجى اختيار سائق الأسطول أولاً', 'error');
      return;
    }
    const res = bulkAssignOrdersToDriver(selectedOrderIds, selectedDriverId);
    if (res.ok) {
      const driver = state.drivers.find((d) => d.id === selectedDriverId);
      toast(`تم إسناد ${selectedOrderIds.length} شحنة للسائق ${driver?.name || ''} وإنشاء كشف التوزيع بنجاح`);
      setIsAssignModalOpen(false);
      setSelectedOrderIds([]);
    } else {
      toast(res.error || 'فشل إسناد الشحنات', 'error');
    }
  };

  // Metrics summary
  const totalFilteredCod = filteredOrders.reduce((acc, o) => acc + o.codAmount, 0);
  const selectedOrders = state.orders.filter((o) => selectedOrderIds.includes(o.id));
  const selectedCod = selectedOrders.reduce((acc, o) => acc + o.codAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <span>إدارة الطلبات والشحنات الذكية (Orders & Dispatches)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            إجمالي {state.orders.length} شحنة مسجلة • تحكم شامل في الإسناد المجمع، كشوف المناديب، وطباعة البوالص الحرارية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={toggleSelectAll}
          >
            {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
          </Button>

          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExportCsv}
          >
            تصدير CSV
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={onOpenNewOrder}
          >
            إنشاء طلب جديد
          </Button>
        </div>
      </div>

      {/* Status Pill Tabs Bar */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex gap-1.5 p-1.5 rounded-2xl bg-[#0A1228]/90 border border-white/[0.08] min-w-full sm:min-w-0">
          {STATUS_TABS.map((tab) => {
            const count = statusCounts[tab.id] ?? 0;
            const isActive = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div className="relative md:col-span-2">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-orange-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برقم الشحنة، الباركود، اسم العميل، الهاتف..."
              className={`${inputClass} pr-10`}
            />
          </div>

          <div>
            <select
              value={merchantFilter}
              onChange={(e) => setMerchantFilter(e.target.value)}
              className={inputClass}
            >
              <option value="ALL">كافة المتاجر والتجار</option>
              {state.merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={govFilter}
              onChange={(e) => setGovFilter(e.target.value)}
              className={inputClass}
            >
              <option value="ALL">كافة المحافظات ({governorates.length})</option>
              {governorates.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Live Filter Ribbon & Totals */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06] text-xs">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
              <span>نتائج الفلترة: <strong className="text-white font-mono">{filteredOrders.length}</strong> شحنة</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>إجمالي COD المعروض: <strong className="text-emerald-400 font-mono font-bold">{formatMoney(totalFilteredCod)}</strong></span>
            </span>
          </div>

          {selectedOrderIds.length > 0 && (
            <div className="flex items-center gap-2 text-orange-400 font-bold">
              <span>محدد: {selectedOrderIds.length} شحنة ({formatMoney(selectedCod)})</span>
              <button
                type="button"
                onClick={() => setSelectedOrderIds([])}
                className="text-slate-400 hover:text-white p-1"
                title="إلغاء التحديد"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Multi-Selection Sticky Action Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0B1953] to-[#122268] border border-orange-500/40 shadow-xl shadow-black/40 flex flex-wrap items-center justify-between gap-3 animate-pop">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                تم تحديد {selectedOrderIds.length} شحنة
              </div>
              <div className="text-xs text-slate-300">
                إجمالي المبالغ المستحقة للتحصيل: <strong className="text-orange-300 font-mono">{formatMoney(selectedCod)}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              icon={Truck}
              onClick={() => setIsAssignModalOpen(true)}
            >
              إسناد لمندوب توزيع
            </Button>

            <Button
              variant="secondary"
              icon={Printer}
              onClick={handleBulkPrint}
              className="text-white bg-white/10 hover:bg-white/20"
            >
              طباعة البوالص الحرارية ({selectedOrderIds.length})
            </Button>

            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportCsv}
              className="text-slate-200"
            >
              تصدير المحدد
            </Button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <Table
          columns={[
            '✓',
            'رقم الشحنة / الباركود',
            'التاجر',
            'العميل والعنوان',
            'نوع التجهيز',
            'التحصيل (COD)',
            'حالة الشحنة',
            'مندوب الأسطول',
            'إجراءات',
          ]}
          isEmpty={filteredOrders.length === 0}
          empty="لا توجد طلبات مطابقة لمعايير البحث الحالية"
        >
          {filteredOrders.map((order) => {
            const isChecked = selectedOrderIds.includes(order.id);
            return (
              <tr
                key={order.id}
                className={`${rowClass} ${isChecked ? 'bg-orange-500/10' : ''}`}
              >
                <td className={`${tdClass} text-center w-10`} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSelect(order.id)}
                    className="rounded bg-slate-900 border-slate-700 text-orange-500 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                </td>

                <td className={`${tdClass} cursor-pointer`} onClick={() => onSelectOrder(order.id)}>
                  <div className="font-bold text-white flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                    <span>{order.orderNumber}</span>
                  </div>
                  <div className="font-mono text-orange-400 text-[11px] mt-0.5 tracking-wider font-semibold">{order.trackingNumber}</div>
                </td>

                <td className={`${tdClass} font-semibold text-slate-200`}>
                  {order.merchantName}
                </td>

                <td className={tdClass}>
                  <div className="font-bold text-white">{order.customerName}</div>
                  <div className="text-[11px] text-slate-300 font-mono">{order.customerPhone}</div>
                  <div className="text-[11px] text-slate-400">{order.governorate} - {order.city}</div>
                </td>

                <td className={`${tdClass} text-center`}>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                    order.fulfillmentType === 'WAREHOUSE_FULFILLMENT'
                      ? 'bg-blue-500/10 text-sky-300 border-sky-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {order.fulfillmentType === 'WAREHOUSE_FULFILLMENT' ? 'تجهيز مستودع WMS' : 'شحن وتوصيل فقط'}
                  </span>
                </td>

                <td className={`${tdClass} text-center font-mono font-bold text-orange-400 text-sm`}>
                  {formatMoney(order.codAmount)}
                </td>

                <td className={`${tdClass} text-center`}>
                  <StatusBadge status={order.status} />
                </td>

                <td className={`${tdClass} text-center`}>
                  {order.driverName ? (
                    <span className="font-semibold text-slate-200">{order.driverName}</span>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic">غير مسند بعد</span>
                  )}
                </td>

                <td className={`${tdClass} text-left`}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order.id)}
                      className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="عرض التفاصيل ومحاولات التسليم والمسار"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onPrintWaybills([order])}
                      className="p-1.5 bg-slate-800/80 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors cursor-pointer"
                      title="طباعة البوليصة الحرارية"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      {/* ---------------- BULK ASSIGN TO DRIVER MODAL ---------------- */}
      <Modal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="إسناد مجمع لشحنات الأسطول وإنشاء كشف التوزيع"
        subtitle={`سيتم إسناد ${selectedOrderIds.length} شحنة وتحديث حالتها إلى (خرج للتسليم) تلقائياً`}
        icon={Truck}
        size="md"
      >
        <form onSubmit={handleBulkAssignConfirm} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-300">إجمالي شحنات الإسناد المحددة:</span>
            <strong className="text-white font-mono text-sm">{selectedOrderIds.length} شحنة</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-300">إجمالي النقدية المتوقع تحصيلها (COD):</span>
            <strong className="text-orange-400 font-mono text-sm">{formatMoney(selectedCod)}</strong>
          </div>

          <Field label="اختر سائق الأسطول المسؤول عن التوزيع">
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className={inputClass}
            >
              {state.drivers.map((driver) => {
                const assigned = state.orders.filter(
                  (o) => o.driverId === driver.id && ['OUT_FOR_DELIVERY', 'READY_FOR_DISPATCH'].includes(o.status)
                ).length;
                return (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} • {driver.vehicleType} ({driver.plateNumber}) • معه حالياً: {assigned} شحنة • المحافظات: {driver.governorates.join('، ')}
                  </option>
                );
              })}
            </select>
          </Field>

          {/* Selected driver preview card */}
          {(() => {
            const drv = state.drivers.find((d) => d.id === selectedDriverId);
            if (!drv) return null;
            return (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs space-y-1 text-slate-200">
                <div className="flex justify-between font-bold text-white">
                  <span>السائق: {drv.name}</span>
                  <span className="text-orange-400">{drv.phone}</span>
                </div>
                <div>المركبة: {drv.vehicleType} | رقم اللوحة: {drv.plateNumber}</div>
                <div>نطاق التغطية والمحافظات: {drv.governorates.join('، ')}</div>
              </div>
            );
          })()}

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              تأكيد الإسناد وإصدار كشف التوزيع
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

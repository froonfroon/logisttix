import { useState } from 'react';
import { ShoppingBag, Search, Plus, Printer, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatMoney } from '../../lib/format';
import type { Order } from '../../types';
import { Button, Card, StatusBadge, Table, inputClass, rowClass, tdClass } from '../../components/ui';

interface Props {
  onOpenNewOrder: () => void;
  onSelectOrder: (orderId: string) => void;
  onPrintWaybills: (orders: Order[]) => void;
}

export function MerchantOrdersPage({
  onOpenNewOrder,
  onSelectOrder,
  onPrintWaybills,
}: Props) {
  const { activeMerchantId } = useAuth();
  const { state } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const merchantOrders = state.orders
    .filter((o) => o.merchantId === activeMerchantId)
    .filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.includes(searchQuery)
    );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <span>شحنات وطلبات المتجر ({merchantOrders.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة حالة التجهيز، تحميل البوالص، وتتبع خط سير المندوب
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={onOpenNewOrder}
        >
          إنشاء شحنة جديدة
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-3 w-4 h-4 text-orange-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث برقم الشحنة، كود التتبع، أو اسم العميل..."
          className={`${inputClass} pr-10`}
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table
          columns={['رقم الشحنة / التتبع', 'العميل والموقع', 'الأصناف', 'التحصيل (COD)', 'الحالة', 'إجراءات']}
          isEmpty={merchantOrders.length === 0}
          empty="لا توجد شحنات مطابقة للبحث"
        >
          {merchantOrders.map((o) => (
            <tr key={o.id} className={rowClass}>
              <td className={`${tdClass} cursor-pointer`} onClick={() => onSelectOrder(o.id)}>
                <div className="font-bold text-white">{o.orderNumber}</div>
                <div className="font-mono text-orange-400 text-[11px]">{o.trackingNumber}</div>
              </td>
              <td className={tdClass}>
                <div className="font-bold text-white">{o.customerName}</div>
                <div className="text-[11px] text-slate-400">{o.governorate} - {o.city}</div>
              </td>
              <td className={`${tdClass} text-center font-bold text-slate-300`}>
                {o.items.reduce((acc, i) => acc + i.qty, 0)} قطعة
              </td>
              <td className={`${tdClass} text-center font-mono font-bold text-orange-400`}>
                {formatMoney(o.codAmount)}
              </td>
              <td className={`${tdClass} text-center`}>
                <StatusBadge status={o.status} />
              </td>
              <td className={`${tdClass} text-left`}>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectOrder(o.id)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                    title="عرض تفاصيل الشحنة والمسار"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onPrintWaybills([o])}
                    className="p-1.5 bg-slate-800 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors"
                    title="طباعة بوليصة الشحن (Waybill)"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

    </div>
  );
}

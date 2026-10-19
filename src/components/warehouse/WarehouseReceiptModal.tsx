import { useState } from 'react';
import { ArrowDownToLine, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { InboundRequest } from '../../types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Button, Modal, Table, rowClass, tdClass } from '../ui';

interface Props {
  inbound: InboundRequest | null;
  onClose: () => void;
}

export function WarehouseReceiptModal({ inbound, onClose }: Props) {
  const { confirmReceipt } = useData();
  const toast = useToast();

  const [quantities, setQuantities] = useState<Record<string, { received: number; damaged: number }>>(() => {
    if (!inbound) return {};
    return inbound.items.reduce((acc, item) => {
      acc[item.sku] = { received: item.requestedQty, damaged: 0 };
      return acc;
    }, {} as Record<string, { received: number; damaged: number }>);
  });

  if (!inbound) return null;

  const handleUpdate = (sku: string, field: 'received' | 'damaged', value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [sku]: {
        ...prev[sku],
        [field]: Math.max(0, value),
      },
    }));
  };

  const handleConfirm = () => {
    const formatted = Object.entries(quantities).map(([sku, data]) => ({
      sku,
      receivedQty: data.received,
      damagedQty: data.damaged,
    }));
    const res = confirmReceipt(inbound.id, formatted);
    if (res.ok) {
      toast(`تم تأكيد إذن الاستلام ${inbound.requestNumber} وزيادة رصيد المستودع`);
      onClose();
    } else {
      toast(res.error, 'error');
    }
  };

  return (
    <Modal
      open={!!inbound}
      onClose={onClose}
      size="md"
      icon={ArrowDownToLine}
      title="فحص وتأكيد إذن استلام بضاعة (Warehouse Receipt)"
      subtitle={`إشعار توريد رقم: ${inbound.requestNumber} • المستودع: ${inbound.warehouseName}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
          <Button variant="success" icon={CheckCircle2} onClick={handleConfirm}>
            تأكيد الاستلام وزيادة رصيد المستودع
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <strong>قاعدة تشغيلية صارمة:</strong> طلب التوريد لا يزيد الرصيد تلقائياً. تأكيد هذا الإذن الآن هو الخطوة الوحيدة التي ستُحدّث أرصدة المخزون المتاحة للتاجر على الرفوف.
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <Table columns={['الصنف و SKU', 'الكمية المطلوبة', 'المستلم الفعلي السليم', 'التالف المرفوض']}>
            {inbound.items.map((item) => (
              <tr key={item.sku} className={rowClass}>
                <td className={tdClass}>
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="font-mono text-orange-400 text-[11px]">{item.sku}</div>
                </td>
                <td className={`${tdClass} text-center font-bold text-slate-300`}>
                  {item.requestedQty} قطعة
                </td>
                <td className={`${tdClass} text-center`}>
                  <input
                    type="number"
                    min="0"
                    value={quantities[item.sku]?.received ?? item.requestedQty}
                    onChange={(e) => handleUpdate(item.sku, 'received', parseInt(e.target.value) || 0)}
                    className="w-20 bg-slate-900 border border-emerald-500/50 text-emerald-400 font-bold text-center p-1.5 rounded-lg text-xs outline-none"
                  />
                </td>
                <td className={`${tdClass} text-center`}>
                  <input
                    type="number"
                    min="0"
                    value={quantities[item.sku]?.damaged ?? 0}
                    onChange={(e) => handleUpdate(item.sku, 'damaged', parseInt(e.target.value) || 0)}
                    className="w-20 bg-slate-900 border border-red-500/50 text-red-400 font-bold text-center p-1.5 rounded-lg text-xs outline-none"
                  />
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </Modal>
  );
}

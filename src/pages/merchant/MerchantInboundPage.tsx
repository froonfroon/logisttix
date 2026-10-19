import { useState } from 'react';
import { ArrowDownToLine, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Badge, Button, Card, Field, Modal, Table, inputClass, rowClass, tdClass } from '../../components/ui';

export function MerchantInboundPage() {
  const { activeMerchantId } = useAuth();
  const { state, createInbound } = useData();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const merchantItems = state.inventory.filter((i) => i.merchantId === activeMerchantId);
  const merchantInbounds = state.inbounds.filter((i) => i.merchantId === activeMerchantId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = Object.entries(quantities)
      .map(([sku, qty]) => ({ sku, qty }))
      .filter((l) => l.qty > 0);

    const res = createInbound({
      merchantId: activeMerchantId,
      expectedArrivalDate: expectedDate,
      notes,
      lines,
    });

    if (res.ok) {
      toast('تم إرسال طلب التوريد بنجاح وبانتظار موافقة الإدارة');
      setIsModalOpen(false);
      setExpectedDate('');
      setNotes('');
      setQuantities({});
    } else {
      toast(res.error, 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ArrowDownToLine className="w-5 h-5 text-orange-500" />
            <span>طلبات توريد البضاعة للمستودع (Inbound Shipments)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إرسال إشعارات مسبقة بوصول بضاعة جديدة ليتم فحصها وإدخالها على الرفوف
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          طلب توريد جديد
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
        <strong>تنبيه تشغيلي:</strong> بعد وصول شحنة التوريد لمقر المستودع، يقوم مسؤولو الفحص بمطابقة الأصناف وإصدار إذن الاستلام الفعلي (Warehouse Receipt) والذي يزيد أرصدتكم للبيع فوراً.
      </div>

      {/* Inbounds Table */}
      <Card className="overflow-hidden">
        <Table
          columns={['رقم إشعار التوريد', 'المستودع المستلم', 'تاريخ الوصول المتوقع', 'إجمالي القطع', 'الحالة', 'ملاحظات']}
          isEmpty={merchantInbounds.length === 0}
          empty="لا توجد طلبات توريد سابقة"
        >
          {merchantInbounds.map((inb) => (
            <tr key={inb.id} className={rowClass}>
              <td className={`${tdClass} font-mono font-bold text-white`}>
                {inb.requestNumber}
              </td>
              <td className={`${tdClass} text-slate-200`}>
                {inb.warehouseName}
              </td>
              <td className={`${tdClass} text-center font-mono text-slate-400`}>
                {inb.expectedArrivalDate}
              </td>
              <td className={`${tdClass} text-center font-bold text-white`}>
                {inb.items.reduce((acc, i) => acc + i.requestedQty, 0)} قطعة
              </td>
              <td className={`${tdClass} text-center`}>
                <Badge tone={inb.status === 'CONFIRMED' ? 'emerald' : inb.status === 'APPROVED' ? 'blue' : inb.status === 'REJECTED' ? 'red' : 'amber'}>
                  {inb.status === 'CONFIRMED' ? 'تم الاستلام وزيادة الرصيد' : inb.status === 'APPROVED' ? 'معتمد وبانتظار وصول الشاحنة' : inb.status === 'REJECTED' ? 'مرفوض' : 'قيد مراجعة الإدارة'}
                </Badge>
              </td>
              <td className={`${tdClass} text-left text-slate-400`}>
                {inb.notes || '-'}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* New Inbound Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        icon={ArrowDownToLine}
        title="طلب توريد بضاعة للمستودع"
        subtitle="حدد موعد الوصول المتوقع والكميات المراد توريدها"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            <Button variant="primary" type="submit" form="new-inbound-form">
              إرسال طلب التوريد
            </Button>
          </div>
        }
      >
        <form id="new-inbound-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="تاريخ الوصول المتوقع للشاحنة">
            <input
              type="date"
              required
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="ملاحظات الشحنة / رقم السائق الناقل">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: قادمة عبر مصنع المحلة - 20 كرتونة"
              className={inputClass}
            />
          </Field>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">أصناف متجرك والكميات المتوقعة:</label>
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <Table columns={['الصنف و SKU', 'المتاح حالياً', 'الكمية المراد توريدها']}>
                {merchantItems.map((item) => (
                  <tr key={item.sku} className={rowClass}>
                    <td className={tdClass}>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="font-mono text-[11px] text-orange-400">{item.sku}</div>
                    </td>
                    <td className={`${tdClass} text-center font-bold text-slate-400`}>
                      {item.availableQty} قطعة
                    </td>
                    <td className={`${tdClass} text-center`}>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quantities[item.sku] ?? ''}
                        onChange={(e) => setQuantities({ ...quantities, [item.sku]: parseInt(e.target.value) || 0 })}
                        className="w-24 bg-slate-900 border border-white/[0.08] text-white font-bold text-center p-1.5 rounded-lg text-xs outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
}

import { useState } from 'react';
import { Clock, MapPin, Package, Phone, Printer, Truck, User, Wallet, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../lib/format';
import { ORDER_FLOW, TRANSITION_LABEL, TRANSITION_PERMISSION } from '../../lib/orderStatus';
import type { Order, OrderStatus, DeliveryFailureReason } from '../../types';
import { Button, Card, Modal, StatusBadge, inputClass } from '../ui';

interface Props { orderId: string | null; onClose: () => void; onPrint: (orders: Order[]) => void }

const VARIANT_FOR: Partial<Record<OrderStatus, 'success' | 'danger' | 'primary'>> = {
  DELIVERED: 'success',
  FAILED: 'danger',
  CANCELLED: 'danger',
  RETURNED: 'danger',
};

export function OrderDetailsModal({ orderId, onClose, onPrint }: Props) {
  const { portal, can, user } = useAuth();
  const { state, transitionOrder, recordDeliveryAttempt } = useData();
  const toast = useToast();
  const [driverId, setDriverId] = useState('');
  const [note, setNote] = useState('');
  const [showAttemptModal, setShowAttemptModal] = useState(false);
  const [attemptReason, setAttemptReason] = useState<DeliveryFailureReason>('NO_ANSWER');
  const [attemptNotes, setAttemptNotes] = useState('');

  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return null;

  const transitions = ORDER_FLOW[order.status].filter((to) =>
    portal === 'MERCHANT' ? to === 'CANCELLED' && can('m.orders.create') : can(TRANSITION_PERMISSION[to]),
  );
  const needsDriver = transitions.includes('OUT_FOR_DELIVERY');
  const eligibleDrivers = state.drivers.filter((d) => d.status !== 'INACTIVE');

  const run = (to: OrderStatus) => {
    const res = transitionOrder(order.id, to, { actor: user.name, driverId: to === 'OUT_FOR_DELIVERY' ? driverId : undefined, note: note.trim() || undefined });
    if (res.ok) {
      toast(`${order.orderNumber}: ${TRANSITION_LABEL[to]}`);
      setNote('');
    } else toast(res.error || 'فشلت العملية', 'error');
  };

  const handleRecordAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonLabels: Record<DeliveryFailureReason, string> = {
      NO_ANSWER: 'العميل لا يجيب على الهاتف',
      RESCHEDULED_BY_CUSTOMER: 'طلب العميل تأجيل موعد التسليم',
      WRONG_ADDRESS: 'العنوان غير واضح / يحتاج تصحيح',
      REFUSED_PRODUCT: 'رفض الاستلام لعدم مطابقة المنتج',
      CUSTOMER_CANCELLED: 'إلغاء الطلب من قبل العميل',
    };
    const res = recordDeliveryAttempt({
      orderId: order.id,
      driverName: order.driverName || user.name || 'سائق التوزيع',
      reason: attemptReason,
      reasonText: reasonLabels[attemptReason],
      notes: attemptNotes.trim() || undefined,
    });
    if (res.ok) {
      toast(`تم تسجيل محاولة التسليم #${order.deliveryAttempts + 1}`);
      setShowAttemptModal(false);
      setAttemptNotes('');
    } else {
      toast(res.error || 'فشل تسجيل المحاولة', 'error');
    }
  };

  const pieces = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="lg"
        icon={Package}
        title={order.orderNumber}
        subtitle={<span className="flex flex-wrap items-center gap-2"><span className="font-mono text-orange-300">{order.trackingNumber}</span>· {order.merchantName}</span>}
        headerExtra={
          <>
            <StatusBadge status={order.status} />
            {portal === 'ADMIN' && order.status === 'OUT_FOR_DELIVERY' && (
              <Button size="sm" variant="secondary" icon={AlertTriangle} onClick={() => setShowAttemptModal(true)}>
                محاولة فاشلة
              </Button>
            )}
            <Button size="sm" icon={Printer} onClick={() => onPrint([order])}>البوليصة</Button>
          </>
        }
      footer={
        transitions.length > 0 ? (
          <div className="flex w-full flex-col gap-2.5">
            {(needsDriver || transitions.some((t) => t === 'FAILED' || t === 'RETURNED')) && (
              <div className="grid gap-2 sm:grid-cols-2">
                {needsDriver && (
                  <select value={driverId} onChange={(e) => setDriverId(e.target.value)} className={inputClass}>
                    <option value="">— اختر السائق للإسناد —</option>
                    {eligibleDrivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} · {d.vehicleType} · {d.governorates.join('، ')}</option>
                    ))}
                  </select>
                )}
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة تشغيلية (اختياري)" className={inputClass} />
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              {transitions.map((to) => (
                <Button key={to} size="sm" variant={VARIANT_FOR[to] ?? 'primary'} onClick={() => run(to)} disabled={to === 'OUT_FOR_DELIVERY' && !driverId}>
                  {TRANSITION_LABEL[to]}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-500">
            {ORDER_FLOW[order.status].length === 0 ? 'الطلب في حالة نهائية' : 'لا تملك صلاحية تحريك هذا الطلب'}
          </span>
        )
      }
    >
      <div className="space-y-3.5">
        <div className="grid gap-2.5 sm:grid-cols-3">
          <Card className="space-y-1.5 p-3">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><User className="h-3.5 w-3.5 text-orange-400" /> المستلم</h4>
            <div className="text-xs font-bold text-white">{order.customerName}</div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300"><Phone className="h-3 w-3 text-emerald-400" />{order.customerPhone}</div>
            <div className="flex items-start gap-1 text-[11px] leading-relaxed text-slate-300"><MapPin className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />{order.governorate} - {order.city}، {order.address}</div>
          </Card>

          <Card className="space-y-1.5 p-3">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Wallet className="h-3.5 w-3.5 text-emerald-400" /> المالية</h4>
            <Row label="قيمة المنتجات" value={formatMoney(order.totalAmount)} />
            <Row label="الشحن" value={formatMoney(order.shippingFee)} />
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-1.5">
              <span className="text-[11px] font-semibold text-white">{order.paymentType === 'COD' ? 'التحصيل COD' : 'مدفوع مسبقاً'}</span>
              <span className="font-mono text-sm font-extrabold text-orange-400">{formatMoney(order.codAmount)}</span>
            </div>
          </Card>

          <Card className="space-y-1.5 p-3">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Truck className="h-3.5 w-3.5 text-cyan-400" /> النقل</h4>
            <Row label="السائق" value={order.driverName ?? 'غير مسند'} />
            <Row label="محاولات التسليم" value={String(order.deliveryAttempts)} />
            <Row label="الكشف" value={state.manifests.find((m) => m.id === order.manifestId)?.manifestNumber ?? '—'} />
            {order.status === 'DELIVERED' && <Row label="تسوية التاجر" value={order.settled ? 'تمت' : 'بانتظار إغلاق الكشف'} />}
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2 text-xs font-semibold text-slate-300">
            <span>الأصناف ({pieces} قطعة)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="px-3.5 py-2 font-semibold">الصنف</th>
                  <th className="px-3.5 py-2 font-semibold">SKU</th>
                  <th className="px-3.5 py-2 text-center font-semibold">الكمية</th>
                  <th className="px-3.5 py-2 font-semibold">السعر</th>
                  <th className="px-3.5 py-2 font-semibold">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {order.items.map((i) => (
                  <tr key={i.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-3.5 py-2 font-semibold text-white">{i.name}</td>
                    <td className="px-3.5 py-2 font-mono text-[11px] text-orange-400">{i.sku}</td>
                    <td className="px-3.5 py-2 text-center font-bold text-white">{i.qty}</td>
                    <td className="px-3.5 py-2 text-slate-300">{formatMoney(i.price)}</td>
                    <td className="px-3.5 py-2 font-bold text-white">{formatMoney(i.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-300"><Clock className="h-3.5 w-3.5 text-orange-400" /> المسار الزمني</h4>
          <ol className="relative space-y-2 border-r border-white/[0.08] pr-4 max-h-40 overflow-y-auto">
            {[...order.timeline].reverse().map((e, idx) => (
              <li key={idx} className="relative">
                <span className={`absolute -right-[21px] top-2.5 h-2.5 w-2.5 rounded-full ring-4 ring-[#0A1228] ${idx === 0 ? 'bg-orange-500' : 'bg-slate-600'}`} />
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{e.title}</span>
                    <span className="font-mono text-[10px] text-slate-500">{e.timestamp}</span>
                  </div>
                  {e.note && <p className="mt-0.5 text-xs text-slate-400">{e.note}</p>}
                  {e.actor && <p className="mt-0.5 text-[10px] text-orange-300/70">{e.actor}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Modal>

    {showAttemptModal && (
      <Modal
        open
        onClose={() => setShowAttemptModal(false)}
        title="تسجيل محاولة تسليم غير ناجحة"
        subtitle={`الشحنة ${order.orderNumber} • المحاولة رقم ${order.deliveryAttempts + 1}`}
        icon={AlertTriangle}
        size="md"
      >
        <form onSubmit={handleRecordAttempt} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">سبب عدم إتمام التسليم</label>
            <select
              value={attemptReason}
              onChange={(e) => setAttemptReason(e.target.value as any)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="NO_ANSWER">العميل لا يجيب على الهاتف (3 اتصالات)</option>
              <option value="RESCHEDULED_BY_CUSTOMER">طلب العميل تأجيل موعد التسليم لوقت لاحق</option>
              <option value="WRONG_ADDRESS">العنوان غير واضح / يحتاج تصحيح من التاجر</option>
              <option value="REFUSED_PRODUCT">رفض الاستلام لعدم مطابقة المنتج أو المقاس</option>
              <option value="CUSTOMER_CANCELLED">إلغاء الطلب من قبل العميل عند الباب</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">ملاحظات المندوب التفصيلية</label>
            <textarea
              rows={3}
              placeholder="اكتب ما حدث بدقة لتوثيقه في السجل والخط الزمني للعميل والتاجر..."
              value={attemptNotes}
              onChange={(e) => setAttemptNotes(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAttemptModal(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              توثيق المحاولة
            </Button>
          </div>
        </form>
      </Modal>
    )}
  </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-200">{value}</span>
    </div>
  );
}

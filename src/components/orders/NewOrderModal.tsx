import { useMemo, useState, type FormEvent } from 'react';
import { Minus, PackagePlus, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { GOVERNORATE_RATES } from '../../data/mockData';
import { calcShippingFee, cn, formatMoney } from '../../lib/format';
import { Button, Field, Modal, inputClass } from '../ui';

interface Line { sku: string; qty: number }

export function NewOrderModal({ onClose }: { onClose: () => void }) {
  const { portal, activeMerchantId } = useAuth();
  const { state, createOrder } = useData();
  const toast = useToast();

  const lockedMerchant = portal === 'MERCHANT';
  const [merchantId, setMerchantId] = useState(lockedMerchant ? activeMerchantId : state.merchants[0].id);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', governorate: 'القاهرة', city: '', address: '' });
  const [paymentType, setPaymentType] = useState<'COD' | 'PREPAID'>('COD');
  const [lines, setLines] = useState<Line[]>([]);
  const [pickSku, setPickSku] = useState('');

  const merchant = state.merchants.find((m) => m.id === merchantId)!;
  const stock = useMemo(() => state.inventory.filter((i) => i.merchantId === merchantId), [state.inventory, merchantId]);
  const stockOf = (sku: string) => stock.find((s) => s.sku === sku)!;

  const itemsTotal = lines.reduce((s, l) => s + stockOf(l.sku).sellingPrice * l.qty, 0);
  const shippingFee = calcShippingFee(form.governorate, merchant.shippingDiscountPercent);
  const cod = paymentType === 'COD' ? itemsTotal + shippingFee : 0;

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addLine = () => {
    if (!pickSku || lines.some((l) => l.sku === pickSku)) return;
    setLines((ls) => [...ls, { sku: pickSku, qty: 1 }]);
    setPickSku('');
  };

  const changeQty = (sku: string, delta: number) =>
    setLines((ls) => ls.map((l) => (l.sku === sku ? { ...l, qty: Math.min(stockOf(sku).availableQty, Math.max(1, l.qty + delta)) } : l)));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const res = createOrder({ merchantId, paymentType, lines, ...form });
    if (res.ok) {
      toast('تم إنشاء الطلب وحجز المخزون بنجاح');
      onClose();
    } else toast(res.error, 'error');
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      icon={PackagePlus}
      title="طلب شحن جديد"
      subtitle="يتم حجز الكميات من المستودع وحساب الشحن تلقائياً"
      footer={
        <>
          <div className="text-xs text-slate-400">
            الإجمالي المطلوب تحصيله: <span className="font-mono text-lg font-extrabold text-orange-400">{formatMoney(cod)}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>إلغاء</Button>
            <Button variant="primary" type="submit" form="new-order-form" disabled={lines.length === 0}>إنشاء وحجز المخزون</Button>
          </div>
        </>
      }
    >
      <form id="new-order-form" onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="التاجر">
            <select
              disabled={lockedMerchant}
              value={merchantId}
              onChange={(e) => { setMerchantId(e.target.value); setLines([]); }}
              className={cn(inputClass, lockedMerchant && 'opacity-60')}
            >
              {state.merchants.map((m) => <option key={m.id} value={m.id}>{m.companyName}</option>)}
            </select>
          </Field>
          <Field label="طريقة الدفع">
            <div className="grid grid-cols-2 gap-2">
              {(['COD', 'PREPAID'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaymentType(p)}
                  className={cn('h-10 rounded-xl text-xs font-semibold ring-1 ring-inset transition',
                    paymentType === p ? 'bg-orange-500/15 text-orange-300 ring-orange-500/50' : 'text-slate-400 ring-white/[0.08] hover:text-white')}
                >
                  {p === 'COD' ? 'دفع عند الاستلام' : 'مدفوع مسبقاً'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <fieldset className="space-y-4 rounded-2xl border border-white/[0.06] p-4">
          <legend className="px-2 text-xs font-bold text-slate-300">بيانات المستلم</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="اسم العميل"><input required value={form.customerName} onChange={set('customerName')} className={inputClass} placeholder="محمد سعيد" /></Field>
            <Field label="الهاتف"><input required dir="ltr" value={form.customerPhone} onChange={set('customerPhone')} className={cn(inputClass, 'text-right font-mono')} placeholder="01012345678" /></Field>
            <Field label="المحافظة" hint={`سعر الشحن بعد خصم التاجر ${merchant.shippingDiscountPercent}%: ${formatMoney(shippingFee)}`}>
              <select value={form.governorate} onChange={set('governorate')} className={inputClass}>
                {Object.keys(GOVERNORATE_RATES).map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="المنطقة / الحي"><input required value={form.city} onChange={set('city')} className={inputClass} placeholder="مدينة نصر" /></Field>
          </div>
          <Field label="العنوان التفصيلي"><input required value={form.address} onChange={set('address')} className={inputClass} placeholder="الشارع - رقم العمارة - الدور - الشقة" /></Field>
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-white/[0.06] p-4">
          <legend className="px-2 text-xs font-bold text-slate-300">الأصناف من مخزون التاجر</legend>
          <div className="flex gap-2">
            <select value={pickSku} onChange={(e) => setPickSku(e.target.value)} className={inputClass}>
              <option value="">— اختر صنفاً —</option>
              {stock.map((s) => (
                <option key={s.sku} value={s.sku} disabled={s.availableQty === 0 || lines.some((l) => l.sku === s.sku)}>
                  {s.name} · متاح {s.availableQty} · {formatMoney(s.sellingPrice)}
                </option>
              ))}
            </select>
            <Button icon={Plus} onClick={addLine} disabled={!pickSku}>إضافة</Button>
          </div>

          {lines.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/[0.08] py-6 text-center text-xs text-slate-500">لم تُضف أصناف بعد</p>
          ) : (
            <ul className="space-y-2">
              {lines.map((l) => {
                const s = stockOf(l.sku);
                return (
                  <li key={l.sku} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.02] px-4 py-3 ring-1 ring-inset ring-white/[0.05]">
                    <div>
                      <div className="text-xs font-bold text-white">{s.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">{s.sku} · {s.zone}/{s.bin} · متاح {s.availableQty}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg ring-1 ring-inset ring-white/10">
                        <button type="button" onClick={() => changeQty(l.sku, -1)} className="p-2 text-slate-400 hover:text-white"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center font-mono text-sm font-bold">{l.qty}</span>
                        <button type="button" onClick={() => changeQty(l.sku, 1)} className="p-2 text-slate-400 hover:text-white"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="w-24 text-left font-mono text-xs font-bold text-white">{formatMoney(s.sellingPrice * l.qty)}</span>
                      <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.sku !== l.sku))} className="p-1 text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-400">
            <span>المنتجات {formatMoney(itemsTotal)} + الشحن {formatMoney(shippingFee)}</span>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}

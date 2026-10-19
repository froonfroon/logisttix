import { useState } from 'react';
import { Check, Copy, Printer } from 'lucide-react';
import { formatDate, formatMoney } from '../../lib/format';
import type { Order } from '../../types';
import { BrandLogo } from '../layout/BrandLogo';
import { Barcode, Button, Modal, Tabs } from '../ui';

type Format = 'THERMAL' | 'A4' | 'ZPL';

const toZpl = (o: Order) => `^XA
^PW812^LL1218
^FO40,40^A0N,42,42^FDLOGISTTEX EXPRESS^FS
^FO40,100^BY3^BCN,120,Y,N,N^FD${o.trackingNumber}^FS
^FO40,270^GB730,3,3^FS
^FO40,290^A0N,30,30^FDTO: ${o.customerName}^FS
^FO40,330^A0N,26,26^FDTEL: ${o.customerPhone}^FS
^FO40,370^A0N,26,26^FD${o.governorate} - ${o.city}^FS
^FO40,430^GB730,3,3^FS
^FO40,450^A0N,40,40^FDCOD: EGP ${o.codAmount}^FS
^FO40,510^A0N,24,24^FDREF: ${o.orderNumber}^FS
^XZ`;

export function WaybillPrintModal({ orders, onClose }: { orders: Order[]; onClose: () => void }) {
  const [format, setFormat] = useState<Format>('THERMAL');
  const [copied, setCopied] = useState(false);
  if (orders.length === 0) return null;

  const zpl = orders.map(toZpl).join('\n');
  const copyZpl = async () => {
    await navigator.clipboard.writeText(zpl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="lg"
        icon={Printer}
        title={orders.length > 1 ? `طباعة ${orders.length} بوالص شحن` : 'بوليصة الشحن'}
        subtitle={orders.length === 1 ? <span className="font-mono">{orders[0].trackingNumber}</span> : 'طباعة مجمعة - كل بوليصة في صفحة'}
        footer={
          <>
            <Tabs
              value={format}
              onChange={(id) => setFormat(id as Format)}
              tabs={[{ id: 'THERMAL', label: 'حراري 4×6' }, { id: 'A4', label: 'A4' }, { id: 'ZPL', label: 'ZPL Zebra' }]}
            />
            {format === 'ZPL' ? (
              <Button variant="primary" icon={copied ? Check : Copy} onClick={copyZpl}>{copied ? 'تم النسخ' : 'نسخ كود ZPL'}</Button>
            ) : (
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>طباعة الآن</Button>
            )}
          </>
        }
      >
        {format === 'ZPL' ? (
          <pre dir="ltr" className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#060B19] p-4 text-left font-mono text-xs leading-relaxed text-orange-200">{zpl}</pre>
        ) : (
          <div className="flex flex-col items-center gap-6 rounded-xl bg-slate-200/5 p-6">
            {orders.map((o) => <Label key={o.id} order={o} format={format} />)}
          </div>
        )}
      </Modal>

      {/* Paper copy — the only thing visible when printing */}
      <div id="print-area" className="print-only">
        {orders.map((o) => (
          <div key={o.id} className="print-break flex justify-center pt-2">
            <Label order={o} format={format === 'ZPL' ? 'THERMAL' : format} />
          </div>
        ))}
      </div>
    </>
  );
}

function Label({ order: o, format }: { order: Order; format: Exclude<Format, 'ZPL'> }) {
  const pieces = o.items.reduce((s, i) => s + i.qty, 0);
  return (
    <div dir="rtl" className={`rounded-md border-2 border-slate-900 bg-white p-4 text-slate-900 shadow-xl ${format === 'THERMAL' ? 'w-[384px] text-[11px]' : 'w-full max-w-[640px] text-[13px]'}`}>
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
        <BrandLogo width={130} />
        <div className="text-left">
          <div className="font-mono text-xs font-black">{o.orderNumber}</div>
          <div className="text-[10px] text-slate-500">{formatDate(o.createdAt)}</div>
        </div>
      </div>

      <div className="border-b-2 border-slate-900 py-2 text-center">
        <Barcode value={o.trackingNumber} height={54} className="text-slate-900" />
        <div className="mt-1 font-mono text-sm font-black tracking-[0.2em]">{o.trackingNumber}</div>
      </div>

      <div className="space-y-0.5 border-b-2 border-slate-900 py-2">
        <div className="text-[10px] font-bold text-slate-500">المرسل إليه</div>
        <div className="text-sm font-black">{o.customerName}</div>
        <div className="font-mono font-bold">{o.customerPhone}</div>
        <div><span className="font-black">[{o.governorate} - {o.city}]</span> {o.address}</div>
      </div>

      <div className="flex items-center justify-between border-b-2 border-slate-900 bg-slate-100 px-2 py-2">
        <div>
          <div className="text-[10px] font-bold text-slate-500">{o.paymentType === 'COD' ? 'الدفع عند الاستلام' : 'مدفوع مسبقاً'}</div>
          <div className="text-xl font-black">{formatMoney(o.codAmount)}</div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded border-2 border-slate-900 text-lg font-black">{o.governorate.slice(0, 2)}</div>
      </div>

      <div className="flex justify-between pt-2 text-[10px]">
        <span>التاجر: <b>{o.merchantName}</b></span>
        <span>{o.items.length} صنف · {pieces} قطعة</span>
      </div>
    </div>
  );
}

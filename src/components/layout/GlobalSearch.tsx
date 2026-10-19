import { useEffect, useMemo, useState } from 'react';
import { ArrowUpLeft, Boxes, Search, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatMoney } from '../../lib/format';
import { StatusBadge } from '../ui';

interface GlobalSearchProps { open: boolean; onClose: () => void; onSelectOrder: (id: string) => void }

export function GlobalSearch({ open, onClose, onSelectOrder }: GlobalSearchProps) {
  const { portal, activeMerchantId } = useAuth();
  const { state } = useData();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { orders: [], items: [] };
    const scope = portal === 'MERCHANT' ? activeMerchantId : null;
    const orders = state.orders
      .filter((o) => !scope || o.merchantId === scope)
      .filter((o) => [o.orderNumber, o.trackingNumber, o.customerName, o.customerPhone].some((v) => v.toLowerCase().includes(q)))
      .slice(0, 6);
    const items = state.inventory
      .filter((i) => !scope || i.merchantId === scope)
      .filter((i) => [i.name, i.sku, i.barcode].some((v) => v.toLowerCase().includes(q)))
      .slice(0, 5);
    return { orders, items };
  }, [query, state, portal, activeMerchantId]);

  if (!open) return null;
  const hasResults = results.orders.length + results.items.length > 0;

  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center bg-[#02050d]/75 px-4 pt-[12vh] backdrop-blur-sm" onMouseDown={onClose}>
      <div onMouseDown={(e) => e.stopPropagation()} className="animate-pop w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A1228] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4">
          <Search className="h-5 w-5 text-orange-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="رقم الطلب، رقم التتبع، اسم العميل، الهاتف، SKU أو الباركود..."
            className="h-14 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <kbd className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">ESC</kbd>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-3">
          {!query.trim() && <p className="py-10 text-center text-sm text-slate-500">ابدأ الكتابة للبحث الفوري في الشحنات والمخزون</p>}
          {query.trim() && !hasResults && <p className="py-10 text-center text-sm text-slate-500">لا توجد نتائج مطابقة لـ "{query}"</p>}

          {results.orders.length > 0 && (
            <section>
              <h4 className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-bold text-slate-400"><ShoppingBag className="h-3.5 w-3.5" /> الشحنات</h4>
              {results.orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { onSelectOrder(o.id); onClose(); }}
                  className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      {o.orderNumber}
                      <span className="font-mono text-[11px] font-medium text-orange-300">{o.trackingNumber}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{o.customerName} · {o.governorate} · {formatMoney(o.codAmount)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={o.status} />
                    <ArrowUpLeft className="h-4 w-4 text-slate-600 group-hover:text-orange-400" />
                  </div>
                </button>
              ))}
            </section>
          )}

          {results.items.length > 0 && (
            <section>
              <h4 className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-bold text-slate-400"><Boxes className="h-3.5 w-3.5" /> أصناف المخزون</h4>
              {results.items.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-xl px-3 py-2.5">
                  <div>
                    <div className="text-xs font-bold text-white">{i.name}</div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-400">{i.sku} · {i.zone}/{i.bin}</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-300">{i.availableQty} متاح</span>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

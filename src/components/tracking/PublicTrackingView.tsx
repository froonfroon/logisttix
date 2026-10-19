import { useState, type FormEvent } from 'react';
import { Search, Package, CheckCircle2, Clock, ShieldCheck, ArrowRight, Truck, AlertCircle, Share2 } from 'lucide-react';
import { BrandLogo } from '../layout/BrandLogo';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { maskName } from '../../lib/format';
import { TRACKING_STEPS } from '../../lib/orderStatus';
import { Button, Card, inputClass } from '../ui';

export function PublicTrackingView() {
  const { state } = useData();
  const toast = useToast();
  const [trackingInput, setTrackingInput] = useState('LTX9842104EGY');
  const [searchedOrder, setSearchedOrder] = useState(() =>
    state.orders.find((o) => o.trackingNumber === 'LTX9842104EGY') || state.orders[0] || null
  );
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const clean = trackingInput.trim().toUpperCase();
    const found = state.orders.find(
      (o) => o.trackingNumber.toUpperCase() === clean || o.orderNumber.toUpperCase() === clean
    );

    if (found) {
      setSearchedOrder(found);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  };

  const copyShareLink = async () => {
    if (!searchedOrder) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/track?num=${searchedOrder.trackingNumber}`);
      toast('تم نسخ رابط التتبع لمشاركته مع العميل');
    } catch {
      toast('تم نسخ رقم التتبع');
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col justify-between py-10 px-4">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Header Logo & Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <BrandLogo height={56} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            تتبع شحنتك المباشر مع <span className="text-orange-500">LogistteX</span>
          </h1>
          <p className="text-xs text-slate-400">
            أدخل رقم بوليصة الشحن لمعرفة مسار الطرد لحظة بلحظة وتوقيت التسليم المتوقع
          </p>
        </div>

        {/* Tracking Input Card */}
        <Card className="p-3 border-orange-500/30">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-orange-500" />
              <input
                type="text"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="أدخل رقم الشحنة (مثال: LTX9842104EGY)..."
                className={`${inputClass} pr-10 pl-4 font-mono uppercase font-bold text-sm h-12`}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={ArrowRight}
              className="h-12 px-6"
            >
              تتبع
            </Button>
          </form>
        </Card>

        {/* Not found alert */}
        {notFound && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-pop">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>لم يتم العثور على شحنة بهذا الرقم. يرجى التأكد من كتابة الرقم بشكل صحيح.</span>
          </div>
        )}

        {/* Tracking Result Card */}
        {searchedOrder && !notFound && (
          <Card className="overflow-hidden border-white/[0.08] animate-pop">
            
            {/* Status Highlight Banner */}
            <div className="p-6 bg-gradient-to-r from-[#0B1953] to-[#122365] border-b border-orange-500/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                  {searchedOrder.status === 'OUT_FOR_DELIVERY' ? 'في الطريق إليك اليوم' : searchedOrder.status === 'DELIVERED' ? 'تم التسليم بنجاح' : 'قيد المعالجة في المستودع'}
                </span>
                <h2 className="text-xl font-bold text-white mt-2 font-mono">
                  {searchedOrder.trackingNumber}
                </h2>
                <div className="text-xs text-slate-300 mt-1">
                  الوجهة: <strong className="text-white">{searchedOrder.governorate} - {searchedOrder.city}</strong>
                </div>
              </div>

              <div className="text-left bg-black/30 p-3 rounded-xl border border-white/5">
                <div className="text-[10px] text-slate-400">المستلم:</div>
                <div className="text-sm font-bold text-white">{maskName(searchedOrder.customerName)}</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  بيانات مشفرة ومحمية
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="p-6 border-b border-white/[0.06]">
              <div className="relative flex items-center justify-between max-w-lg mx-auto">
                <div className="absolute top-4 right-4 left-4 h-1 bg-slate-800 -z-0">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                    style={{
                      width:
                        searchedOrder.status === 'DELIVERED'
                          ? '100%'
                          : searchedOrder.status === 'OUT_FOR_DELIVERY'
                          ? '66%'
                          : ['PACKING', 'READY_FOR_DISPATCH'].includes(searchedOrder.status)
                          ? '33%'
                          : '10%',
                    }}
                  />
                </div>

                {TRACKING_STEPS.map((step, idx) => {
                  const isReached = step.reachedBy.includes(searchedOrder.status);
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isReached
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-slate-900 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {idx === 0 && <CheckCircle2 className="w-4 h-4" />}
                        {idx === 1 && <Package className="w-4 h-4" />}
                        {idx === 2 && <Truck className="w-4 h-4" />}
                        {idx === 3 && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <span className="text-[11px] font-bold text-slate-300 mt-2">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sanitized Timeline */}
            <div className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                سجل تتبع الشحنة العام
              </h3>

              <div className="space-y-3 relative before:absolute before:inset-0 before:right-2.5 before:w-0.5 before:bg-slate-800">
                {[...searchedOrder.timeline].reverse().map((item, index) => (
                  <div key={index} className="relative flex items-start gap-3.5 pr-0.5">
                    <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-orange-500 flex items-center justify-center shrink-0 z-10 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="flex-1 bg-white/[0.02] p-3 rounded-xl border border-white/[0.06]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#070D1F] border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>نظام التتبع الآمن من LogistteX</span>
              </div>
              <button
                type="button"
                onClick={copyShareLink}
                className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-bold"
              >
                <Share2 className="w-3.5 h-3.5" />
                مشاركة الرابط
              </button>
            </div>

          </Card>
        )}

      </div>

      <footer className="text-center text-[11px] text-slate-500 mt-8">
        منظومة اللوجستيات الذكية © 2026 LogistteX Fulfillment ERP • جميع الحقوق محفوظة
      </footer>
    </div>
  );
}

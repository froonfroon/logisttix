import { Clock, CheckCircle2, Store, RefreshCw, MessageSquare } from 'lucide-react';
import type { Merchant } from '../../types';
import { Card, Button, Badge } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function MerchantPendingScreen({ merchant }: { merchant: Merchant }) {
  const { setActiveMerchantId } = useAuth();
  const toast = useToast();

  const handleDemoSwitch = () => {
    setActiveMerchantId('m1');
    toast('تم التبديل إلى متجر معتمد نشط (براند زون) لمعاينة كافة مميزات البوابة', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4 animate-fadeIn">
      {/* Hero Pending Status Card */}
      <Card className="p-8 relative overflow-hidden border-orange-500/30 bg-gradient-to-b from-[#0F1C3F] to-[#0A1228] text-center space-y-6 shadow-2xl">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />
        
        {/* Pulsing Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center rounded-3xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-xl shadow-orange-500/10">
          <Clock className="w-10 h-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500" />
          </span>
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <Badge tone="orange">طلب قيد التدقيق الإداري (Pending Review)</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            مرحباً بك في لوجستكس، {merchant.companyName}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            تم استلام بيانات طلب انضمام متجرك بنجاح، ويقوم فريق الامتثال والعمليات حالياً بمراجعة السجل وتخصيص أفضل خطة تسعير ومستودع تغطية لمتجرك.
          </p>
        </div>

        {/* 4-Step Interactive Progression Bar */}
        <div className="pt-4 pb-2 border-t border-b border-white/[0.08]">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-right sm:text-center">
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                1. استلام الطلب
              </div>
              <p className="text-[10px] text-slate-400">تم تسجيل كافة البيانات</p>
            </div>

            {/* Step 2 (Active Pending) */}
            <div className="p-3 rounded-xl bg-orange-500/15 border border-orange-500/40 space-y-1 ring-2 ring-orange-500/20">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-400">
                <Clock className="w-4 h-4 animate-spin-slow" />
                2. تدقيق KYB والوثائق
              </div>
              <p className="text-[10px] text-orange-300 font-bold">جاري الفحص الآن</p>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1 opacity-60">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400">
                3. تعيين خطة التسعير
              </div>
              <p className="text-[10px] text-slate-500">تخصيص الخصم والمستودع</p>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-1 opacity-60">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400">
                4. التفعيل وبدء الشحن
              </div>
              <p className="text-[10px] text-slate-500">فتح البوابة بالكامل</p>
            </div>
          </div>
        </div>

        {/* Store Submitted Details Summary */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/[0.06] text-right space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-400" />
            ملخص البيانات المسجلة بالطلب
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">اسم المتجر المسجل:</span>
              <span className="font-bold text-white">{merchant.companyName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">اسم المسؤول:</span>
              <span className="font-bold text-white">{merchant.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">رقم هاتف التواصل:</span>
              <span className="font-mono font-bold text-emerald-400">{merchant.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">تصنيف المنتجات:</span>
              <span className="text-white">{merchant.category || 'عام'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">موقع ومقر الاستلام:</span>
              <span className="text-white">{merchant.governorate} - {merchant.city || ''}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">حجم الشحنات المتوقع:</span>
              <span className="font-bold text-orange-400 font-mono">{merchant.expectedDailyOrders || '50 شحنة/يوم'}</span>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => window.open(`https://wa.me/201000008899?text=مرحباً، أود متابعة طلب انضمام متجري (${merchant.companyName}) في منصة لوجستكس`, '_blank')}
            className="w-full sm:w-auto text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
          >
            <MessageSquare className="w-4 h-4 ml-1.5" />
            التواصل مع مسؤول العمليات عبر واتساب
          </Button>

          <Button
            variant="ghost"
            onClick={handleDemoSwitch}
            className="w-full sm:w-auto text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 ml-1.5" />
            معاينة حساب تاجر معتمد (تجربة تجريبية)
          </Button>
        </div>
      </Card>
    </div>
  );
}

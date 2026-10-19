import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import type { Merchant } from '../../types';
import { Card, Button, Badge } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function MerchantRejectedScreen({ merchant, onReapply }: { merchant: Merchant; onReapply: () => void }) {
  const { setActiveMerchantId } = useAuth();
  const toast = useToast();

  const handleDemoSwitch = () => {
    setActiveMerchantId('m1');
    toast('تم التبديل إلى متجر معتمد نشط لمعاينة المنصة', 'info');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8 px-4 animate-fadeIn">
      <Card className="p-8 text-center space-y-6 border-red-500/30 bg-gradient-to-b from-red-950/20 to-[#0A1228] shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <Badge tone="red">طلب الانضمام معتذر عنه حالياً</Badge>
          <h2 className="text-2xl font-black text-white">
            نعتذر منك، لم نتمكن من اعتماد متجر ({merchant.companyName})
          </h2>
          <p className="text-xs text-slate-300">
            راجع فريق التدقيق الأوراق والبيانات المقدمة، ولم يتم استيفاء بعض الشروط المطلوبة لفتح الحساب.
          </p>
        </div>

        {/* Reason Box */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-right space-y-1">
          <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            سبب الاعتذار المسجل من قبل الإدارة:
          </div>
          <p className="text-xs text-slate-200 pr-5 leading-relaxed">
            {merchant.rejectionReason || 'عدم استيفاء الوثائق القانونية والسجل التجاري المطلوب للشحن والتخزين.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="primary" onClick={onReapply}>
            <RefreshCw className="w-4 h-4 ml-1.5" />
            إعادة تقديم الطلب وتحديث المستندات
          </Button>

          <Button variant="ghost" onClick={handleDemoSwitch} className="text-slate-400 hover:text-white">
            معاينة حساب تجريبي
          </Button>
        </div>
      </Card>
    </div>
  );
}

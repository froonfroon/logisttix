import { useState } from 'react';
import { DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import type { PayoutRequest } from '../../types';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../lib/format';
import { Button, Modal, Card, inputClass } from '../ui';

interface Props {
  payout: PayoutRequest | null;
  onClose: () => void;
}

export function PayoutActionModal({ payout, onClose }: Props) {
  const { state, approvePayout, rejectPayout, markPayoutPaid } = useData();
  const toast = useToast();
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  if (!payout) return null;

  const merchant = state.merchants.find((m) => m.id === payout.merchantId);

  const handleApprove = () => {
    const res = approvePayout(payout.id);
    if (res.ok) {
      toast(`تم اعتماد طلب السحب ${payout.requestNumber}`);
      onClose();
    } else {
      toast(res.error, 'error');
    }
  };

  const handleExecutePaid = () => {
    const res = markPayoutPaid(payout.id);
    if (res.ok) {
      toast(`تم تسجيل التحويل البنكي وصرف مستحقات ${payout.requestNumber}`);
      onClose();
    } else {
      toast(res.error, 'error');
    }
  };

  const handleReject = () => {
    const res = rejectPayout(payout.id, rejectReason || 'تم الرفض لعدم استيفاء الشروط المالية');
    if (res.ok) {
      toast(`تم رفض طلب السحب ${payout.requestNumber}`);
      onClose();
    } else {
      toast(res.error, 'error');
    }
  };

  return (
    <Modal
      open={!!payout}
      onClose={onClose}
      size="sm"
      icon={DollarSign}
      title="مراجعة واعتماد سحب الأرباح (Payout)"
      subtitle={`طلب رقم: ${payout.requestNumber} • التاجر: ${merchant?.companyName ?? payout.merchantId}`}
      footer={
        !isRejecting ? (
          <div className="flex w-full items-center justify-between">
            <Button variant="danger" icon={XCircle} onClick={() => setIsRejecting(true)}>
              رفض الطلب
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>إغلاق</Button>
              {payout.status === 'PENDING' && (
                <Button variant="primary" icon={CheckCircle2} onClick={handleApprove}>
                  اعتماد الطلب المالي
                </Button>
              )}
              {payout.status === 'APPROVED' && (
                <Button variant="success" icon={CheckCircle2} onClick={handleExecutePaid}>
                  تأكيد التحويل البنكي (تم الصرف)
                </Button>
              )}
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        <Card className="p-4 space-y-2 text-xs bg-slate-900/60">
          <div className="flex justify-between text-slate-400">
            <span>التاجر المستحق:</span>
            <strong className="text-white">{merchant?.companyName}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>المبلغ المطلوب:</span>
            <strong className="text-orange-400 font-mono text-base">{formatMoney(payout.amount)}</strong>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>البنك المستفيد:</span>
            <span className="text-slate-200">{payout.bankName}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>اسم صاحب الحساب:</span>
            <span className="text-slate-200">{payout.accountHolder}</span>
          </div>
          <div className="text-slate-400 pt-2 border-t border-white/[0.06]">
            <span>رقم الآيبان الدولي (IBAN):</span>
            <div className="font-mono text-slate-200 bg-[#060B19] p-2.5 rounded-lg border border-white/[0.08] mt-1 select-all">
              {payout.iban}
            </div>
          </div>
        </Card>

        {isRejecting && (
          <div className="space-y-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5">
            <label className="block text-xs text-red-300 font-semibold">سبب رفض طلب التحويل:</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض لتوضيحه للتاجر في حسابه..."
              className={`${inputClass} h-20 p-2.5`}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsRejecting(false)}>
                إلغاء
              </Button>
              <Button size="sm" variant="danger" onClick={handleReject}>
                تأكيد الرفض
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

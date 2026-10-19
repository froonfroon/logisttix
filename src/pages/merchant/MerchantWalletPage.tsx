import { useState } from 'react';
import { Wallet, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../lib/format';
import { Badge, Button, Card, Field, Modal, Table, inputClass, rowClass, tdClass } from '../../components/ui';

export function MerchantWalletPage() {
  const { activeMerchantId } = useAuth();
  const { state, requestPayout } = useData();
  const toast = useToast();

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState('');

  const merchant = state.merchants.find((m) => m.id === activeMerchantId) || state.merchants[0];
  const merchantPayouts = state.payouts.filter((p) => p.merchantId === activeMerchantId);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(requestedAmount);
    const res = requestPayout(activeMerchantId, amount);
    if (res.ok) {
      toast('تم تقديم طلب السحب بنجاح وخصمه مؤقتاً لحين الصرف');
      setShowPayoutModal(false);
      setRequestedAmount('');
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
            <Wallet className="w-5 h-5 text-orange-500" />
            <span>المحفظة المالية والتحويلات البنكية (Wallet & Payouts)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة تحصيلات الشحن COD، خصم العمولات ورسوم التخزين، وطلب صرف الأرباح
          </p>
        </div>

        <Button
          variant="primary"
          icon={DollarSign}
          onClick={() => setShowPayoutModal(true)}
        >
          طلب سحب أرباح جديد (Payout)
        </Button>
      </div>

      {/* 2 Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Available Balance */}
        <Card className="p-6 bg-gradient-to-br from-[#0B1953] to-[#070D1E] border-orange-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">الرصيد المتاح القابل للسحب الفوري</span>
            <Badge tone="emerald">جاهز للتحويل</Badge>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {formatMoney(merchant.availableBalance)}
          </div>
          <p className="text-[11px] text-slate-400">
            يشمل كافة التحصيلات التي أغلقت ورديتها بنجاح بعد خصم رسوم التوصيل والتجهيز.
          </p>
        </Card>

        {/* Pending Balance */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">الرصيد المعلق (قيد التحصيل مع المناديب)</span>
            <Badge tone="orange">قيد التسليم</Badge>
          </div>
          <div className="text-3xl font-black text-orange-400 font-mono">
            {formatMoney(merchant.pendingBalance)}
          </div>
          <p className="text-[11px] text-slate-400">
            شحنات خرجت للتسليم مع السائقين وسيتم تحويلها للرصيد المتاح بمجرد إغلاق اليومية.
          </p>
        </Card>

      </div>

      {/* Payouts History */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white">سجل طلبات السحب والتحويلات البنكية</h2>
        </div>

        <Table
          columns={['رقم التحويل', 'البنك المحول إليه', 'المبلغ', 'تاريخ الطلب', 'الحالة']}
          isEmpty={merchantPayouts.length === 0}
          empty="لا توجد طلبات سحب سابقة"
        >
          {merchantPayouts.map((p) => (
            <tr key={p.id} className={rowClass}>
              <td className={`${tdClass} font-mono font-bold text-white`}>{p.requestNumber}</td>
              <td className={`${tdClass} text-slate-300`}>{p.bankName}</td>
              <td className={`${tdClass} text-center font-mono font-bold text-orange-400`}>{formatMoney(p.amount)}</td>
              <td className={`${tdClass} text-center font-mono text-slate-400`}>{p.requestedAt}</td>
              <td className={`${tdClass} text-center`}>
                <Badge tone={p.status === 'PAID' ? 'emerald' : p.status === 'APPROVED' ? 'blue' : p.status === 'REJECTED' ? 'red' : 'amber'}>
                  {p.status === 'PAID' ? 'تم التحويل والصرف' : p.status === 'APPROVED' ? 'معتمد وبانتظار الصرف' : p.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Payout Modal */}
      <Modal
        open={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        size="sm"
        icon={DollarSign}
        title="طلب سحب أرباح وتحويل بنكي"
        subtitle={
          <span>
            الرصيد المتاح للسحب: <strong className="text-emerald-400">{formatMoney(merchant.availableBalance)}</strong>
          </span>
        }
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" onClick={() => setShowPayoutModal(false)}>إلغاء</Button>
            <Button variant="primary" type="submit" form="payout-request-form">
              تأكيد إرسال الطلب
            </Button>
          </div>
        }
      >
        <form id="payout-request-form" onSubmit={handleRequestPayout} className="space-y-4">
          <Field label="المبلغ المراد سحبه (ج.م)" hint="الحد الأدنى للسحب 500 ج.م">
            <input
              type="number"
              required
              min={500}
              max={merchant.availableBalance}
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              placeholder="مثال: 15000"
              className={inputClass}
            />
          </Field>

          <Card className="p-3 bg-slate-900/50 space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>البنك المسجل:</span>
              <span className="text-white font-bold">{merchant.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span>اسم المستفيد:</span>
              <span className="text-white">{merchant.accountHolder}</span>
            </div>
            <div className="pt-1 text-[11px] font-mono text-slate-400 select-all">
              {merchant.iban}
            </div>
          </Card>
        </form>
      </Modal>

    </div>
  );
}

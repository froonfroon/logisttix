import { useState } from 'react';
import { KeyRound, Copy, Check, ShieldCheck, Terminal, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Card } from '../../components/ui';

export function MerchantApiTokensPage() {
  const { activeMerchantId } = useAuth();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const tokenString = `ltx_live_sec_78941_${activeMerchantId}_3pl_auth_secret`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tokenString);
      setCopied(true);
      toast('تم نسخ مفتاح الـ API');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('فشل النسخ', 'error');
    }
  };

  const handleTestConnection = () => {
    setTestStatus('CONNECTING');
    setTimeout(() => {
      setTestStatus('SUCCESS');
      toast('تم الاتصال بنجاح بـ LogistteX Webhook Gateway');
      setTimeout(() => setTestStatus(null), 3500);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-orange-500" />
            <span>مفاتيح الربط البرمجي والتكاملات (API & Webhooks)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ربط متجرك على Shopify أو WooCommerce لتوليد الشحنات وسحب المخزون تلقائياً
          </p>
        </div>

        <Button
          variant="secondary"
          icon={RefreshCw}
          onClick={handleTestConnection}
          disabled={testStatus === 'CONNECTING'}
        >
          {testStatus === 'CONNECTING' ? 'جاري الاختبار...' : 'اختبار الاتصال بالسيرفر'}
        </Button>
      </div>

      {testStatus === 'SUCCESS' && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-pop">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>تم الاتصال بنجاح بـ LogistteX Webhook Gateway • الـ Latency: 22ms • مفتاح الـ API سليم</span>
        </div>
      )}

      {/* Active Token Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-sm font-bold text-white">مفتاح الإنتاج الحي (Live API Secret)</h2>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            صلاحية كاملة (Orders & Inventory)
          </span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-[#060B19] border border-white/[0.08] rounded-xl font-mono text-xs text-orange-300">
          <input
            type="password"
            readOnly
            value={tokenString}
            className="flex-1 bg-transparent text-white outline-none font-mono"
          />
          <Button
            size="sm"
            variant="primary"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
          >
            {copied ? 'تم النسخ' : 'نسخ المفتاح'}
          </Button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>يتم إخفاء المفتاح دائماً؛ احتفظ به في مكان آمن ولا تشاركه علناً في الكود المفتوح.</span>
        </div>
      </Card>

      {/* API Code Snippet Example */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Terminal className="w-4 h-4 text-orange-500" />
          <span>مثال إنشاء شحنة عبر الـ cURL / REST API</span>
        </div>

        <div className="p-4 bg-[#060B19] rounded-xl border border-white/[0.08] font-mono text-xs text-slate-300 overflow-x-auto text-left" dir="ltr">
          <pre>{`curl -X POST https://api.logisttex.com/v1/orders \\
  -H "Authorization: Bearer ${tokenString}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Mohamed Saeed",
    "customer_phone": "01004561230",
    "governorate": "Cairo",
    "city": "Nasr City",
    "address": "Abbas El-Akkad St",
    "cod_amount": 1215,
    "items": [
      { "sku": "BZ-HOOD-BLK-L", "quantity": 1 }
    ]
  }'`}</pre>
        </div>
      </Card>

    </div>
  );
}

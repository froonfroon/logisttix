import { useState } from 'react';
import { 
  Calculator, 
  MapPin, 
  CheckCircle2, 
  TrendingDown
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { GOVERNORATE_RATES } from '../../data/mockData';
import { formatMoney } from '../../lib/format';
import { Button, Card, Table, Tabs, rowClass, tdClass } from '../../components/ui';

export function PricingPage() {
  const { state } = useData();
  const [activeTab, setActiveTab] = useState<'CALCULATOR' | 'RATES' | 'PLANS'>('CALCULATOR');

  // Calculator State
  const [calcGov, setCalcGov] = useState<string>('القاهرة');
  const [calcWeight, setCalcWeight] = useState<number>(1);
  const [calcMerchantId, setCalcMerchantId] = useState<string>('m1');
  const [calcCod, setCalcCod] = useState<number>(500);

  // Selected merchant for discount
  const currentMerchant = state.merchants.find((m) => m.id === calcMerchantId) || state.merchants[0];
  const discountPercent = currentMerchant?.shippingDiscountPercent || 0;

  // Calculation logic
  const baseRate = GOVERNORATE_RATES[calcGov] || 65;
  const extraKg = Math.max(0, calcWeight - 1);
  const extraKgFee = extraKg * 10;
  const rawShipping = baseRate + extraKgFee;
  const discountAmount = Math.round(rawShipping * (discountPercent / 100));
  const finalShipping = rawShipping - discountAmount;
  const codFee = Math.round(calcCod * 0.015); // 1.5% COD handling
  const totalCustomerPays = calcCod + finalShipping;

  const governoratesList = Object.entries(GOVERNORATE_RATES).map(([gov, rate]) => {
    let zone = 'القاهرة الكبرى';
    let sla = '24 ساعة';
    if (['الإسكندرية', 'بورسعيد', 'الإسماعيلية', 'السويس'].includes(gov)) {
      zone = 'الإسكندرية والقناة';
      sla = '24 - 48 ساعة';
    } else if (['البحيرة', 'الدقهلية', 'الغربية', 'الشرقية', 'المنوفية', 'دمياط'].includes(gov)) {
      zone = 'محافظات الدلتا';
      sla = '48 ساعة';
    } else if (['بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان'].includes(gov)) {
      zone = 'محافظات الصعيد';
      sla = '48 - 72 ساعة';
    }
    return { name: gov, rate, zone, sla };
  });

  return (
    <div className="space-y-6">
      
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20 shadow-lg shadow-orange-500/10">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white">المناطق والتسعير وحاسبة الشحن (Pricing & Zones)</h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[11px] font-mono font-bold text-orange-400">
                RATE MATRIX
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              إدارة تسعير المحافظات الـ 27، خطط الأسعار بحسب شرائح التجار، وحاسبة التكلفة الفورية قبل الشحن
            </p>
          </div>
        </div>
      </div>

      {/* Dedicated Executive Full-Width Tab Bar */}
      <Tabs
        value={activeTab}
        onChange={(id) => setActiveTab(id as 'CALCULATOR' | 'RATES' | 'PLANS')}
        tabs={[
          { id: 'CALCULATOR', label: 'حاسبة الشحن التفاعلية', icon: Calculator },
          { id: 'RATES', label: 'تسعير المحافظات الـ 27', count: governoratesList.length, icon: MapPin },
          { id: 'PLANS', label: 'خطط وشرائح أسعار التجار', count: state.pricingPlans.length, icon: TrendingDown },
        ]}
      />

      {/* Tab 1: Interactive Shipping Calculator */}
      {activeTab === 'CALCULATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Inputs Card (2 cols) */}
          <Card className="lg:col-span-2 p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-orange-500" />
                مدخلات تسعير الشحنة
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                اختر المحافظة، الوزن بالكيلوجرام، والتاجر لحساب السعر الفعلي وخصم الشريحة
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Governorate */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المحافظة المستلمة
                </label>
                <select
                  value={calcGov}
                  onChange={(e) => setCalcGov(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  {Object.keys(GOVERNORATE_RATES).map((gov) => (
                    <option key={gov} value={gov}>
                      {gov} (الأساسي: {GOVERNORATE_RATES[gov]} ج.م)
                    </option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الوزن الإجمالي (كجم)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Math.max(0.5, Number(e.target.value) || 1))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">أول 1 كجم بالسعر الأساسي + 10 ج.م لكل كجم إضافي</span>
              </div>

              {/* Merchant */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  التاجر / المتجر (نسبة الخصم)
                </label>
                <select
                  value={calcMerchantId}
                  onChange={(e) => setCalcMerchantId(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                >
                  {state.merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.companyName} (خصم: {m.shippingDiscountPercent}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* COD Value */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  مبلغ التحصيل من العميل COD (ج.م)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={calcCod}
                  onChange={(e) => setCalcCod(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">عمولة تحصيل النقدية 1.5%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-xs text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-400" />
                حساب آلي فوري يطابق دالة التسعير المركزية في محرك الشحن
              </span>
              <span className="font-bold text-orange-300 font-mono">Algorithm: V2.4-EGY</span>
            </div>
          </Card>

          {/* Results Summary Card (1 col) */}
          <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-[#0B1430] to-[#070D1E] border-orange-500/30">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-sm font-bold text-white">تفصيل تكلفة الشحن</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  محسوب تلقائياً
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>سعر الشحن الأساسي ({calcGov}):</span>
                  <span className="font-mono font-bold text-white">{baseRate} ج.م</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>تكلفة الوزن الإضافي ({extraKg} كجم):</span>
                  <span className="font-mono text-slate-300">+{extraKgFee} ج.م</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      خصم التاجر الشريك ({discountPercent}%):
                    </span>
                    <span className="font-mono font-bold">-{discountAmount} ج.م</span>
                  </div>
                )}

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between font-bold text-sm text-white">
                  <span>صافي رسوم الشحن:</span>
                  <span className="font-mono text-orange-400 text-base">{finalShipping} ج.م</span>
                </div>

                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>عمولة تحصيل النقدية COD (1.5%):</span>
                  <span className="font-mono">{codFee} ج.م</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] bg-black/20 p-4 rounded-xl space-y-1">
              <div className="text-[11px] text-slate-400">إجمالي المبلغ المحصل عند الباب:</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {formatMoney(totalCustomerPays)}
              </div>
              <div className="text-[10px] text-slate-500">
                (سعر المنتج {formatMoney(calcCod)} + الشحن {formatMoney(finalShipping)})
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* Tab 2: 27 Governorate Rates Table */}
      {activeTab === 'RATES' && (
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">جدول تسعير المحافظات الـ 27</h2>
              <p className="text-xs text-slate-400 mt-0.5">التسعير الرسمي المعتمد للشحن الداخلي لكافة محافظات الجمهورية</p>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">
              27 محافظة مفعّلة
            </span>
          </div>

          <Table
            columns={['المحافظة', 'المنطقة الجغرافية (Zone)', 'السعر الأساسي (أول 1 كجم)', 'سعر الكيلو الإضافي', 'زمن التسليم المتوقع (SLA)', 'الحالة']}
          >
            {governoratesList.map((gov) => (
              <tr key={gov.name} className={rowClass}>
                <td className={tdClass}>
                  <div className="font-bold text-white flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>{gov.name}</span>
                  </div>
                </td>
                <td className={tdClass}>
                  <span className="text-xs font-medium text-slate-300">{gov.zone}</span>
                </td>
                <td className={tdClass}>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{gov.rate} ج.م</span>
                </td>
                <td className={tdClass}>
                  <span className="font-mono text-slate-300">10 ج.م / كجم</span>
                </td>
                <td className={tdClass}>
                  <span className="text-xs font-mono text-slate-300">{gov.sla}</span>
                </td>
                <td className={tdClass}>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> مفعّل للشحن
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Tab 3: Business Pricing Plans */}
      {activeTab === 'PLANS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {state.pricingPlans.map((plan) => (
            <Card key={plan.id} className="p-6 flex flex-col justify-between border-white/[0.08] hover:border-orange-500/30 transition-all">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    {plan.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    متاحة للربط
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mt-3">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{plan.targetMerchants}</p>

                <div className="mt-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>السعر الأساسي لشحن القاهرة:</span>
                    <span className="font-mono font-bold text-white text-sm">{plan.baseRate} ج.م</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>سعر الكيلو الإضافي:</span>
                    <span className="font-mono text-slate-300">+{plan.perKgAdditionalRate} ج.م / كجم</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>رسوم تحصيل النقدية (COD Fee):</span>
                    <span className="font-mono text-emerald-400 font-bold">{plan.codFeePercent}%</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>رسوم الشحنة المرتجعة:</span>
                    <span className="font-mono text-slate-400">{plan.returnFeePercent}% من قيمة الشحن</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08]">
                <Button
                  variant="secondary"
                  className="w-full justify-center text-xs"
                >
                  تعديل شروط الخطة
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}

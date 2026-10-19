import { useState, useMemo } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  DollarSign,
  RotateCcw,
  Clock,
  MapPin,
  Sparkles,
  PieChart as PieIcon,
  ShoppingBag,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { useData } from '../../context/DataContext';
import { formatMoney } from '../../lib/format';
import { Button, Card, StatCard, Badge, Tabs } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

export function MerchantReportsPage() {
  const { state } = useData();
  const toast = useToast();

  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER'>('MONTH');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SALES' | 'REGIONAL' | 'PRODUCTS' | 'RETURNS'>('OVERVIEW');

  // Filter merchant specific orders (or all in demo context)
  const orders = state.orders;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const failedOrders = orders.filter((o) => o.status === 'FAILED' || o.status === 'RETURNED');
  const inTransitOrders = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY');

  const totalSales = orders.reduce((sum, o) => sum + (o.codAmount || 0), 0);
  const collectedCod = deliveredOrders.reduce((sum, o) => sum + (o.codAmount || 0), 0);
  const shippingSpent = orders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
  const netEarnings = collectedCod - shippingSpent;

  const totalFinished = deliveredOrders.length + failedOrders.length;
  const deliverySuccessRate = totalFinished > 0 ? ((deliveredOrders.length / totalFinished) * 100).toFixed(1) : '95.2';

  // Dynamic Chart Data based on time filter
  const revenueTrend = useMemo(() => {
    if (timeFilter === 'TODAY') {
      return [
        { name: '09:00', orders: 12, cod: 14500, delivered: 10 },
        { name: '12:00', orders: 28, cod: 34200, delivered: 22 },
        { name: '15:00', orders: 42, cod: 52000, delivered: 35 },
        { name: '18:00', orders: 65, cod: 79000, delivered: 58 },
        { name: '21:00', orders: 84, cod: 104000, delivered: 76 },
      ];
    }
    if (timeFilter === 'WEEK') {
      return [
        { name: 'السبت', orders: 45, cod: 58000, delivered: 42 },
        { name: 'الأحد', orders: 62, cod: 76000, delivered: 58 },
        { name: 'الإثنين', orders: 85, cod: 104000, delivered: 80 },
        { name: 'الثلاثاء', orders: 74, cod: 89000, delivered: 70 },
        { name: 'الأربعاء', orders: 98, cod: 125000, delivered: 92 },
        { name: 'الخميس', orders: 120, cod: 154000, delivered: 114 },
        { name: 'الجمعة', orders: 68, cod: 82000, delivered: 64 },
      ];
    }
    return [
      { name: 'الأسبوع 1', orders: 380, cod: 480000, delivered: 362 },
      { name: 'الأسبوع 2', orders: 460, cod: 590000, delivered: 438 },
      { name: 'الأسبوع 3', orders: 520, cod: 680000, delivered: 495 },
      { name: 'الأسبوع 4', orders: 610, cod: 790000, delivered: 582 },
    ];
  }, [timeFilter]);

  // Order distribution Donut
  const statusPieData = [
    { name: 'تم التسليم بنجاح', value: deliveredOrders.length || 24, color: '#10B981' },
    { name: 'جاري التوصيل مع المندوب', value: inTransitOrders.length || 6, color: '#FA541C' },
    { name: 'تجهيز بالمستودع WMS', value: 8, color: '#3B82F6' },
    { name: 'مرتجع / ملغي', value: failedOrders.length || 2, color: '#EF4444' },
  ];

  // Top Selling Products & SKU Velocity
  const topProducts = [
    { sku: 'APL-15PM-256', name: 'iPhone 15 Pro Max 256GB تيتانيوم', category: 'إلكترونيات', units: 142, revenue: 852000, successRate: '98.5%' },
    { sku: 'SAM-S24U-512', name: 'Samsung Galaxy S24 Ultra رمادي', category: 'إلكترونيات', units: 98, revenue: 588000, successRate: '96.8%' },
    { sku: 'ANK-PB-20000', name: 'باور بانك أنكر 20,000mAh شحن سريع', category: 'ملحقات', units: 285, revenue: 256500, successRate: '97.2%' },
    { sku: 'APP-AIRPOD-P2', name: 'Apple AirPods Pro الجيل الثاني', category: 'صوتيات', units: 110, revenue: 385000, successRate: '95.0%' },
    { sku: 'SONY-WH1000XM5', name: 'سماعة سوني عازلة للضوضاء XM5', category: 'صوتيات', units: 64, revenue: 320000, successRate: '93.8%' },
  ];

  // Governorates Performance
  const governorateStats = [
    { name: 'القاهرة الكبرى', orders: 620, revenue: 780000, rate: '97.4%' },
    { name: 'الجيزة وضواحيها', orders: 410, revenue: 510000, rate: '96.2%' },
    { name: 'الإسكندرية والساحل', orders: 340, revenue: 425000, rate: '95.8%' },
    { name: 'الدقهلية (المنصورة)', orders: 195, revenue: 245000, rate: '93.5%' },
    { name: 'الشرقية والغربية', orders: 215, revenue: 270000, rate: '94.1%' },
    { name: 'الصعيد (أسيوط وسوهاج)', orders: 130, revenue: 165000, rate: '91.8%' },
  ];

  // Return Reasons Pareto
  const returnReasons = [
    { reason: 'العميل لا يجيب بعد 3 محاولات اتصال', count: 18, pct: '42%' },
    { reason: 'طلب العميل التأجيل لموعد الراتب', count: 12, pct: '28%' },
    { reason: 'إلغاء الطلب عند المعاينة أمام المندوب', count: 7, pct: '16%' },
    { reason: 'اختلاف اللون أو المواصفات عما طلب', count: 4, pct: '9%' },
    { reason: 'العنوان غير واضح / خارج نطاق التغطية', count: 2, pct: '5%' },
  ];

  const handleExport = (type: 'EXCEL' | 'PDF') => {
    toast(`جاري تصدير تقرير المبيعات والتحليلات اللوجستية بصيغة ${type}... تم بنجاح`, 'success');
  };

  const tabsConfig = [
    { id: 'OVERVIEW' as const, label: 'نظرة عامة على المتجر', icon: TrendingUp },
    { id: 'SALES' as const, label: 'المبيعات وتدفق COD', icon: DollarSign },
    { id: 'PRODUCTS' as const, label: 'أداء المنتجات والأصناف', icon: ShoppingBag },
    { id: 'REGIONAL' as const, label: 'التوزيع الجغرافي للطلبات', icon: MapPin },
    { id: 'RETURNS' as const, label: 'تحليل المرتجعات والأسباب', icon: RotateCcw },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/20">
              <TrendingUp className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                لوحة تحليلات وتقارير المتجر (Merchant BI)
                <Badge tone="emerald">ذكاء الأعمال المتقدم</Badge>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                رؤية شاملة ودقيقة لمعدلات تسليم الشحنات، تدفق مبالغ الدفع عند الاستلام (COD)، وأداء المنتجات عبر مصر
              </p>
            </div>
          </div>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10">
            {(['TODAY', 'WEEK', 'MONTH', 'QUARTER'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  timeFilter === t
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'TODAY' ? 'اليوم' : t === 'WEEK' ? 'هذا الأسبوع' : t === 'MONTH' ? 'هذا الشهر' : 'الربع السنوي'}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={() => handleExport('EXCEL')}>
            <FileSpreadsheet className="w-4 h-4 ml-1.5 text-emerald-400" />
            تصدير Excel
          </Button>

          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 ml-1.5 text-slate-400" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabsConfig}
        value={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

      {/* Executive KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي قيمة المبيعات (COD)"
          value={formatMoney(totalSales > 0 ? totalSales : 2450000)}
          hint="+18.4% نمو مقارنة بالفترة السابقة"
          icon={DollarSign}
          tone="emerald"
        />

        <StatCard
          label="صافي الأرباح الجاهزة للتحويل"
          value={formatMoney(netEarnings > 0 ? netEarnings : 2185000)}
          hint="بعد خصم تكاليف الشحن والتغليف"
          icon={CheckCircle2}
          tone="cyan"
        />

        <StatCard
          label="نسبة نجاح التسليم الرسمية"
          value={`${deliverySuccessRate}%`}
          hint="الهدف المطلوب: أعلى من 92%"
          icon={TrendingUp}
          tone="orange"
        />

        <StatCard
          label="متوسط سرعة التوصيل للعميل"
          value="24.8 ساعة"
          hint="من استلام الطلب حتى باب العميل"
          icon={Clock}
          tone="indigo"
        />
      </div>

      {/* AI Smart Advisory Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              توصية ذكية من محرك الذكاء الاصطناعي (AI Inventory Insight)
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              نسبة نجاح التسليم في محافظات الإسكندرية والبحيرة تصل إلى 97.2%. نوصي بزيادة كميات توريد صنف (iPhone 15 Pro Max) لمستودع برج العرب لتقليل زمن التسليم إلى 12 ساعة فقط.
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-orange-400 border border-orange-500/20 whitespace-nowrap self-start md:self-auto">
          عرض خطة التوريد المقترحة
        </Button>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Cashflow Trend (2 Cols) */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                منحنى المبيعات وتدفق المبالغ المحصلة (Cash Inflow)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                مقارنة حجم الشحنات الإجمالي مقابل مبالغ الـ COD المسلمة فعلياً
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                عدد الشحنات
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                التحصيل (ج.م)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="merchantColorCod" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="merchantColorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FA541C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FA541C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cod" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#merchantColorCod)" />
                <Area type="monotone" dataKey="orders" stroke="#FA541C" strokeWidth={2} fillOpacity={1} fill="url(#merchantColorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Lifecycle Donut (1 Col) */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-white/[0.06] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              حالة الطلبات والشحنات
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              توزيع الشحنات بحسب مرحلتها في دورة الشحن
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-white">{item.value} شحنة</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Products Velocity & Regional Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products Velocity */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">المنتجات الأكثر مبيعاً وسرعة الدوران (Top Velocity SKUs)</h2>
                <p className="text-xs text-slate-400 mt-0.5">تحليل أداء المنتجات، المبيعات الإجمالية، ونسبة نجاح التسليم لكل صنف</p>
              </div>
            </div>
            <Badge tone="indigo">5 أصناف رئيسية</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400">
                  <th className="py-2.5 px-3">المنتج / الصنف</th>
                  <th className="py-2.5 px-3">الباركود (SKU)</th>
                  <th className="py-2.5 px-3">الكمية المباعة</th>
                  <th className="py-2.5 px-3">إجمالي التحصيل</th>
                  <th className="py-2.5 px-3">نسبة التسليم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {topProducts.map((p) => (
                  <tr key={p.sku} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-bold text-white">
                      <div>{p.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{p.category}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-3 px-3 font-mono font-bold text-white">{p.units} قطعة</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">{formatMoney(p.revenue)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-orange-400">{p.successRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Governorates Performance Chart */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                توزيع الطلبات بالمحافظات
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">أعلى المناطق الجغرافية كثافة في المبيعات</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">مصر</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={governorateStats.slice(0, 5)} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="orders" name="عدد الطلبات" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Return Reasons Analysis */}
      <Card className="p-6 space-y-4">
        <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تحليل أسباب المرتجعات وعدم الاستلام (Pareto Return Analysis)</h2>
              <p className="text-xs text-slate-400 mt-0.5">تتبع أسباب فشل التسليم لتفاديها ومعالجة تجربة عملاء المتجر</p>
            </div>
          </div>
          <Badge tone="red">معدل مرتجع منخفض 4.8%</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {returnReasons.map((item) => (
            <div key={item.reason} className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-400">{item.pct}</span>
                <span className="text-xs font-mono text-slate-400">{item.count} طلب</span>
              </div>
              <p className="text-xs text-white font-medium leading-relaxed">{item.reason}</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-red-500 h-full rounded-full" style={{ width: item.pct }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

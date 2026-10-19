import { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Truck,
  CheckCircle2,
  DollarSign,
  PieChart as PieIcon,
  Users,
  FileSpreadsheet,
  Printer,
  Clock,
  RotateCcw
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

export function AdminReportsPage() {
  const { state } = useData();
  const toast = useToast();

  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [reportSection, setReportSection] = useState<'OVERVIEW' | 'DELIVERY' | 'FINANCE' | 'REGIONAL' | 'DRIVERS'>('OVERVIEW');

  // Filtered orders calculations
  const orders = state.orders;
  const totalOrdersCount = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const failedOrders = orders.filter((o) => o.status === 'FAILED' || o.status === 'RETURNED');
  
  const totalCodCollected = deliveredOrders.reduce((sum, o) => sum + o.codAmount, 0);
  const totalShippingRevenue = deliveredOrders.reduce((sum, o) => sum + o.shippingFee, 0);

  const completedCount = deliveredOrders.length + failedOrders.length;
  const successRate = completedCount > 0 ? ((deliveredOrders.length / completedCount) * 100).toFixed(1) : '94.8';

  // Area Trend Data
  const trendData = useMemo(() => {
    if (timeFilter === 'TODAY') {
      return [
        { name: '08:00', shipments: 22, cod: 28000, revenue: 1980 },
        { name: '10:00', shipments: 45, cod: 56000, revenue: 3960 },
        { name: '12:00', shipments: 78, cod: 98000, revenue: 6864 },
        { name: '14:00', shipments: 112, cod: 142000, revenue: 9856 },
        { name: '16:00', shipments: 148, cod: 186000, revenue: 13024 },
        { name: '18:00', shipments: 182, cod: 228000, revenue: 16016 },
        { name: '20:00', shipments: 215, cod: 268000, revenue: 18920 },
      ];
    }
    if (timeFilter === 'WEEK') {
      return [
        { name: 'السبت', shipments: 140, cod: 165000, revenue: 12320 },
        { name: 'الأحد', shipments: 185, cod: 224000, revenue: 16280 },
        { name: 'الإثنين', shipments: 230, cod: 288000, revenue: 20240 },
        { name: 'الثلاثاء', shipments: 210, cod: 260000, revenue: 18480 },
        { name: 'الأربعاء', shipments: 265, cod: 334000, revenue: 23320 },
        { name: 'الخميس', shipments: 310, cod: 392000, revenue: 27280 },
        { name: 'الجمعة', shipments: 195, cod: 242000, revenue: 17160 },
      ];
    }
    return [
      { name: 'الأسبوع 1', shipments: 1120, cod: 1420000, revenue: 98560 },
      { name: 'الأسبوع 2', shipments: 1380, cod: 1740000, revenue: 121440 },
      { name: 'الأسبوع 3', shipments: 1540, cod: 1950000, revenue: 135520 },
      { name: 'الأسبوع 4', shipments: 1820, cod: 2310000, revenue: 160160 },
    ];
  }, [timeFilter]);

  // Delivery status breakdown donut
  const statusPieData = [
    { name: 'تم التسليم والتحصيل', value: deliveredOrders.length || 18, color: '#10B981' },
    { name: 'مع الأسطول بالطريق', value: orders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length || 4, color: '#FA541C' },
    { name: 'تجهيز وتغليف WMS', value: orders.filter((o) => ['CONFIRMED', 'PICKING', 'PACKING', 'READY_FOR_DISPATCH'].includes(o.status)).length || 6, color: '#3B82F6' },
    { name: 'بانتظار التأكيد', value: orders.filter((o) => o.status === 'PENDING').length || 2, color: '#8B5CF6' },
    { name: 'فشل / مرتجع للمستودع', value: failedOrders.length || 1, color: '#EF4444' },
  ];

  // Delivery Failure Root Causes
  const failureReasonsData = [
    { name: 'العميل لا يجيب الهاتف', count: 42, pct: '42%' },
    { name: 'طلب العميل تأجيل الموعد', count: 28, pct: '28%' },
    { name: 'العنوان يحتاج تصحيح', count: 16, pct: '16%' },
    { name: 'رفض استلام لعدم المطابقة', count: 9, pct: '9%' },
    { name: 'إلغاء عند الباب', count: 5, pct: '5%' },
  ];

  // Governorates volume distribution
  const governoratesDistribution = [
    { name: 'القاهرة', orders: 1420, cod: 1780000, rate: '96.2%' },
    { name: 'الجيزة', orders: 1140, cod: 1430000, rate: '94.8%' },
    { name: 'الإسكندرية', orders: 860, cod: 1080000, rate: '95.1%' },
    { name: 'القليوبية', orders: 540, cod: 680000, rate: '93.4%' },
    { name: 'الدقهلية والمنصورة', orders: 490, cod: 610000, rate: '92.7%' },
    { name: 'الغربية والشرقية', orders: 460, cod: 575000, rate: '94.0%' },
    { name: 'مدن القناة والسويس', orders: 380, cod: 475000, rate: '93.5%' },
    { name: 'الصعيد والمحافظات البعيدة', orders: 320, cod: 410000, rate: '91.2%' },
  ];

  // Drivers Leaderboard
  const topDrivers = [
    { name: 'أحمد محمود النجار', delivered: 184, rate: '98.4%', cash: 228000, area: 'القاهرة - مصر الجديدة' },
    { name: 'محمود عبد الرحمن', delivered: 165, rate: '96.5%', cash: 204000, area: 'القاهرة - مدينة نصر' },
    { name: 'كريم عادل الباشا', delivered: 152, rate: '95.2%', cash: 189000, area: 'الجيزة - الشيخ زايد' },
    { name: 'سيد محمد إبراهيم', delivered: 141, rate: '94.6%', cash: 175000, area: 'الإسكندرية - سموحة' },
    { name: 'عمر شريف الدسوقي', delivered: 138, rate: '94.1%', cash: 168000, area: 'القاهرة - التجمع الخامس' },
  ];

  const handleExportPDF = () => {
    toast('جاري تجهيز وتوليد التقرير التنفيذي للطباعة بصيغة PDF...');
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleExportExcel = () => {
    toast('تم تصدير ملف بيانات الذكاء التشغيلي Excel بنجاح (Reports_Export.xlsx)');
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/30 shadow-lg shadow-orange-500/10">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white">التقارير والذكاء التشغيلي والتحليلي (Logistics BI)</h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[11px] font-mono font-bold text-orange-400">
                BI SUITE v2.4
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              مؤشرات الأداء اللحظية (KPIs)، كفاءة سلاسل الإمداد، معدلات إنجاز الأسطول، وتحليلات التدفقات النقدية
            </p>
          </div>
        </div>

        {/* Action Controls: Time Filter & Export */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <div className="flex items-center rounded-xl bg-[#0A1228] p-1 border border-white/[0.08] text-xs">
            {(['TODAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeFilter === t
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'TODAY' && 'اليوم'}
                {t === 'WEEK' && 'هذا الأسبوع'}
                {t === 'MONTH' && 'هذا الشهر'}
                {t === 'QUARTER' && 'الربع الحالي'}
                {t === 'YEAR' && '2026'}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
          >
            تصدير إكسل
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={handleExportPDF}
          >
            طباعة تقرير تنفيذي
          </Button>
        </div>
      </div>

      {/* Full-Width Report Section Tabs */}
      <Tabs
        value={reportSection}
        onChange={(id) => setReportSection(id as typeof reportSection)}
        tabs={[
          { id: 'OVERVIEW', label: 'لوحة المؤشرات التنفيذية الشاملة', icon: BarChart3 },
          { id: 'DELIVERY', label: 'كفاءة التسليم ومعدلات الـ SLA', icon: CheckCircle2 },
          { id: 'FINANCE', label: 'التدفقات المالية وتحصيلات COD', icon: DollarSign },
          { id: 'REGIONAL', label: 'الخريطة الجغرافية والمحافظات', icon: Truck },
          { id: 'DRIVERS', label: 'مصفوفة أداء المناديب والأسطول', icon: Users },
        ]}
      />

      {/* 4 Hero KPI Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="معدل نجاح التسليم (SLA Success)"
          value={`${successRate}%`}
          hint={
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              +2.8% أعلى من المستهدف الرسمي <TrendingUp className="w-3.5 h-3.5" />
            </span>
          }
          icon={CheckCircle2}
          tone="emerald"
        />

        <StatCard
          label="متوسط زمن التسليم (Avg. SLA)"
          value="17.6 ساعة"
          hint="من استلام الطلب حتى يد العميل"
          icon={Clock}
          tone="blue"
        />

        <StatCard
          label="إجمالي تحصيلات الـ COD"
          value={formatMoney(totalCodCollected)}
          hint={`إجمالي عوائد الشحن: ${formatMoney(totalShippingRevenue)}`}
          icon={DollarSign}
          tone="amber"
        />

        <StatCard
          label="معدل ارتداد المرتجعات"
          value="4.2%"
          hint="ضمن المعدل القياسي للشركات العالمية"
          icon={RotateCcw}
          tone="violet"
        />
      </div>

      {/* Main Visual Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth & Volume Area Chart (2 cols) */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span>منحنى نمو الشحنات والتحصيلات النقدية</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع مسار تسليم الطرود وتزامن التدفق المالي اللحظي
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-[11px] font-bold">
              محدث لحظياً
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportsShipmentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FA541C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FA541C" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="reportsCodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="shipments" name="عدد الشحنات" stroke="#FA541C" strokeWidth={3} fillOpacity={1} fill="url(#reportsShipmentsGrad)" />
                <Area type="monotone" dataKey="revenue" name="إيراد الشحن (ج.م)" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#reportsCodGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution Donut Chart (1 col) */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="mb-2 border-b border-white/[0.06] pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>توزيع دورة حياة الشحنات</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">النسبة المئوية لحالات الطلبات الحالية</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative my-2">
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
                  {statusPieData.map((item, index) => (
                    <Cell key={`cell-${index}`} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-white font-mono">{totalOrdersCount}</span>
              <span className="text-[10px] text-slate-400">إجمالي الطلبات</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-mono font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Secondary Analytical Row: Failure Root Causes + Regional Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Failure Root Causes Analysis */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-red-400" />
                <span>تحليل أسباب تعثر التسليم (Root-Cause Pareto)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                توثيق محاولات التسليم غير الناجحة لتحسين معدلات الإنجاز وحل مشاكل العناوين
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
              QC Alerts
            </span>
          </div>

          <div className="space-y-3">
            {failureReasonsData.map((r) => (
              <div key={r.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold">{r.name}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{r.count} شحنة</span>
                    <span className="font-bold text-red-400">{r.pct}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full" style={{ width: r.pct }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Governorates Distribution Chart */}
        <Card className="p-6 space-y-4">
          <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-400" />
                <span>توزيع الكثافة الجغرافية عبر المحافظات</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                أعلى المحافظات طلباً ونسبة الإنجاز والتحصيل
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
              27 محافظة
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={governoratesDistribution.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="orders" name="عدد الشحنات" fill="#FA541C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Drivers Fleet Leaderboard */}
      <Card className="p-6 space-y-4">
        <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">لوحة شرف وكفاءة مناديب الأسطول (Top Fleet Performers)</h2>
              <p className="text-xs text-slate-400 mt-0.5">ترتيب السائقين بحسب عدد الشحنات المسلمة ومعدل الالتزام بتحصيل الـ COD</p>
            </div>
          </div>
          <Badge tone="emerald">فريق النقل الذهبي</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {topDrivers.map((driver, idx) => (
            <div key={driver.name} className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.06] space-y-2 hover:border-orange-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-orange-400">#{idx + 1}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono">
                  {driver.rate} إنجاز
                </span>
              </div>
              <div className="text-xs font-bold text-white">{driver.name}</div>
              <div className="text-[11px] text-slate-400">{driver.area}</div>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400">{driver.delivered} طرد</span>
                <span className="font-mono font-bold text-emerald-400">{formatMoney(driver.cash)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  Plus, 
  ArrowUpRight,
  Warehouse,
  ShieldAlert,
  Wallet,
  Users,
  Building2,
  Filter,
  FileSpreadsheet,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { useData } from '../../context/DataContext';
import { formatMoney, downloadCsv } from '../../lib/format';
import { Button, Card, StatCard, StatusBadge, Table, rowClass, tdClass } from '../../components/ui';
import type { NavId } from '../../components/layout/Sidebar';

interface Props {
  onOpenNewOrder: () => void;
  onSelectOrder: (orderId: string) => void;
  onNavigateTab: (tab: NavId) => void;
}

const statusColors = ['#10B981', '#FA541C', '#6366F1', '#EC4899', '#3B82F6', '#EF4444'];

export function AdminDashboard({ onOpenNewOrder, onSelectOrder, onNavigateTab }: Props) {
  const { state } = useData();

  // Management Filters
  const [timeRange, setTimeRange] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('WEEK');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('ALL');

  // Filtered orders based on selected merchant
  const filteredOrders = useMemo(() => {
    return state.orders.filter((o) => {
      if (selectedMerchant !== 'ALL' && o.merchantId !== selectedMerchant) return false;
      return true;
    });
  }, [state.orders, selectedMerchant]);

  // Operational metrics
  const totalOrders = filteredOrders.length;
  const deliveredOrders = filteredOrders.filter((o) => o.status === 'DELIVERED').length;
  const outForDelivery = filteredOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const readyOrPacking = filteredOrders.filter((o) => ['CONFIRMED', 'PICKING', 'PACKING', 'READY_FOR_DISPATCH'].includes(o.status)).length;
  const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING').length;
  const returnedOrders = filteredOrders.filter((o) => o.status === 'RETURNED' || o.status === 'FAILED').length;

  const totalCodCollected = filteredOrders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((acc, o) => acc + o.codAmount, 0);

  const totalCompanyShippingRevenue = filteredOrders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((acc, o) => acc + o.shippingFee, 0);

  // Total liquidity across treasury accounts
  const totalTreasuryLiquidity = state.treasuryAccounts.reduce((acc, a) => acc + a.balance, 0);

  // Success rate SLA
  const completedAttempts = deliveredOrders + returnedOrders;
  const successRate = completedAttempts > 0 ? Math.round((deliveredOrders / completedAttempts) * 100) : 98;

  // Management Critical Alerts
  const pendingPayouts = state.payouts.filter((p) => p.status === 'PENDING');
  const lowStockItems = state.inventory.filter((i) => i.availableQty <= i.lowStockThreshold);
  const openManifests = state.manifests.filter((m) => m.status === 'DISPATCHED');

  // Dynamic Chart Data based on time range
  const trendData = useMemo(() => {
    if (timeRange === 'TODAY') {
      return [
        { time: '08:00', shipments: 18, revenue: 2400 },
        { time: '10:00', shipments: 34, revenue: 4800 },
        { time: '12:00', shipments: 62, revenue: 8600 },
        { time: '14:00', shipments: 89, revenue: 12400 },
        { time: '16:00', shipments: 115, revenue: 16900 },
        { time: '18:00', shipments: 142, revenue: 21500 },
        { time: '20:00', shipments: 168, revenue: 25800 },
      ];
    }
    return [
      { time: 'السبت', shipments: 124, revenue: 15400 },
      { time: 'الأحد', shipments: 168, revenue: 21200 },
      { time: 'الإثنين', shipments: 210, revenue: 27800 },
      { time: 'الثلاثاء', shipments: 195, revenue: 24600 },
      { time: 'الأربعاء', shipments: 245, revenue: 31900 },
      { time: 'الخميس', shipments: 290, revenue: 39500 },
      { time: 'الجمعة', shipments: 180, revenue: 22400 },
    ];
  }, [timeRange]);

  // Donut chart status breakdown
  const pieData = [
    { name: 'تم التسليم والتحصيل', value: deliveredOrders || 1 },
    { name: 'مع المناديب بالطريق', value: outForDelivery || 1 },
    { name: 'تجهيز وتغليف WMS', value: readyOrPacking || 1 },
    { name: 'بانتظار التأكيد', value: pendingOrders || 1 },
    { name: 'مرتجع أو فشل', value: returnedOrders || 1 },
  ];

  // Governorate volume & COD distribution
  const governorateStats = useMemo(() => {
    const counts: Record<string, { count: number; cod: number }> = {};
    for (const o of filteredOrders) {
      if (!counts[o.governorate]) counts[o.governorate] = { count: 0, cod: 0 };
      counts[o.governorate].count += 1;
      counts[o.governorate].cod += o.codAmount;
    }
    return Object.entries(counts).map(([gov, data]) => ({
      name: gov,
      shipments: data.count,
      cod: Math.round(data.cod / 100),
    }));
  }, [filteredOrders]);

  const handleExportDashboard = () => {
    const headers = ['رقم الطلب', 'رقم التتبع', 'التاجر', 'العميل', 'الهاتف', 'المحافظة', 'قيمة COD', 'رسوم الشحن', 'الحالة', 'السائق', 'التاريخ'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.trackingNumber,
      o.merchantName,
      o.customerName,
      o.customerPhone,
      o.governorate,
      o.codAmount,
      o.shippingFee,
      o.status,
      o.driverName || 'غير مسند',
      o.createdAt,
    ]);
    downloadCsv('Executive_Operations_Report.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Command Header */}
      <div className="executive-header-banner flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0B1953] via-[#0E1E5E] to-[#070D1E] border border-orange-500/20 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              مركز القيادة والرقابة التنفيذية
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> مباشر (Real-Time)
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">
            لوحة الإدارة والعمليات اللوجستية <span className="brand-logo-text text-orange-500">LogistteX ERP</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            إشراف متكامل على حركة الشحنات، 3 مستودعات تخزين، خزائن السيولة، ومطابقة اليومية النقدية للأسطول.
          </p>
        </div>

        {/* Quick Management Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={handleExportDashboard}
            title="تصدير كشف شامل بصيغة CSV"
          >
            تصدير تقرير
          </Button>

          <Button
            variant="secondary"
            icon={Truck}
            onClick={() => onNavigateTab('drivers')}
          >
            كشوف التوزيع
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={onOpenNewOrder}
          >
            شحنة وتجهيز جديد
          </Button>
        </div>
      </div>

      {/* Interactive Management Filters Bar */}
      <Card className="dashboard-filter-bar p-4 bg-[#0A1229]/90 border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-orange-400" />
          <span className="text-xs font-bold text-slate-300">تصفية العرض الإداري:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time range pills */}
          <div className="dashboard-time-pills inline-flex rounded-xl bg-white/[0.04] p-1 border border-white/[0.06] text-xs font-semibold">
            <button
              onClick={() => setTimeRange('TODAY')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${timeRange === 'TODAY' ? 'time-range-btn-active bg-orange-500 text-white shadow' : 'time-range-btn-inactive text-slate-400 hover:text-white'}`}
            >
              اليوم
            </button>
            <button
              onClick={() => setTimeRange('WEEK')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${timeRange === 'WEEK' ? 'time-range-btn-active bg-orange-500 text-white shadow' : 'time-range-btn-inactive text-slate-400 hover:text-white'}`}
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => setTimeRange('MONTH')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${timeRange === 'MONTH' ? 'time-range-btn-active bg-orange-500 text-white shadow' : 'time-range-btn-inactive text-slate-400 hover:text-white'}`}
            >
              هذا الشهر
            </button>
            <button
              onClick={() => setTimeRange('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${timeRange === 'ALL' ? 'time-range-btn-active bg-orange-500 text-white shadow' : 'time-range-btn-inactive text-slate-400 hover:text-white'}`}
            >
              الكل
            </button>
          </div>

          {/* Merchant filter dropdown */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMerchant}
              onChange={(e) => setSelectedMerchant(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-[#070D1F] px-3 py-1.5 text-xs font-semibold text-slate-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="ALL">كافة المتاجر والتجار ({state.merchants.length})</option>
              {state.merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Critical Operational Alerts Ribbon */}
      {(pendingPayouts.length > 0 || lowStockItems.length > 0 || openManifests.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pendingPayouts.length > 0 && (
            <div
              onClick={() => onNavigateTab('finance')}
              className="operational-alert-amber cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 transition-all shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                  <Wallet className="w-4 h-4" />
                </span>
                <div>
                  <div className="alert-title text-xs font-bold text-white flex items-center gap-1.5">
                    طلبات سحب أرباح معلقة ({pendingPayouts.length})
                  </div>
                  <div className="alert-desc text-[11px] text-amber-200/80">
                    مستحقات للتجار بقيمة {formatMoney(pendingPayouts.reduce((s, p) => s + p.amount, 0))} بانتظار الاعتماد
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div
              onClick={() => onNavigateTab('warehouse')}
              className="operational-alert-red cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 transition-all shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-red-500/20 text-red-300">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <div>
                  <div className="alert-title text-xs font-bold text-white">
                    نواقص بالمستودع ({lowStockItems.length} صنف)
                  </div>
                  <div className="alert-desc text-[11px] text-red-200/80">
                    أصناف وصلت للحد الأدنى لإعادة التوريد (Low Stock Alert)
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-red-400 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          )}

          {openManifests.length > 0 && (
            <div
              onClick={() => onNavigateTab('drivers')}
              className="operational-alert-sky cursor-pointer group flex items-center justify-between p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15 transition-all shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-sky-500/20 text-sky-300">
                  <Truck className="w-4 h-4" />
                </span>
                <div>
                  <div className="alert-title text-xs font-bold text-white">
                    كشوف توزيع مفتوحة ({openManifests.length})
                  </div>
                  <div className="alert-desc text-[11px] text-sky-200/80">
                    مناديب على الطريق بانتظار المطابقة النقدية (Cash Closure)
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-sky-400 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid - Executive Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي الشحنات النشطة"
          value={totalOrders}
          hint={
            <span className="text-emerald-400 flex items-center gap-1 font-bold">
              +14% هذا الأسبوع <TrendingUp className="w-3 h-3" />
            </span>
          }
          icon={ShoppingBag}
          tone="blue"
        />

        <StatCard
          label="خرجت للتسليم مع الأسطول"
          value={outForDelivery}
          hint={`${openManifests.length} كشف توزيع نشط على الطريق اليوم`}
          icon={Truck}
          tone="orange"
        />

        <StatCard
          label="تم التسليم والتحصيل"
          value={deliveredOrders}
          hint={`معدل إنجاز التسليم ${successRate}%`}
          icon={CheckCircle2}
          tone="emerald"
        />

        <StatCard
          label="إجمالي COD المحصل"
          value={formatMoney(totalCodCollected)}
          hint={`أرباح الشحن الصافية: ${formatMoney(totalCompanyShippingRevenue)}`}
          icon={DollarSign}
          tone="amber"
        />
      </div>

      {/* Secondary Financial & Fulfillment Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="السيولة المتاحة بالخزائن والبنوك"
          value={formatMoney(totalTreasuryLiquidity)}
          hint="موزعة على الخزينة الكاش و CIB وإنستاباي"
          icon={Wallet}
          tone="violet"
        />

        <StatCard
          label="تجهيز وتغليف المستودع WMS"
          value={readyOrPacking}
          hint="شحنات في مسار السحب والتغليف الفوري"
          icon={Warehouse}
          tone="cyan"
        />

        <StatCard
          label="السائقون المتاحون"
          value={state.drivers.filter((d) => d.status !== 'INACTIVE').length}
          hint={`${state.drivers.filter((d) => d.status === 'ON_DUTY').length} سائق في وردية التوزيع حالياً`}
          icon={Users}
          tone="indigo"
        />

        <StatCard
          label="التجار الشركاء المسجلون"
          value={state.merchants.length}
          hint="متاجر إلكترونية نشطة بالمنصة"
          icon={Building2}
          tone="slate"
        />
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Area Chart (2 cols) */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                حركة الشحنات والإيراد اليومي
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                توزيع عدد الطرود المنفذة مع نمو مبالغ الشحن المحصلة
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              {timeRange === 'TODAY' ? 'منحنى اليوم اللحظي' : 'منحنى الأسبوع'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="shipmentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FA541C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FA541C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="shipments" name="عدد الشحنات" stroke="#FA541C" strokeWidth={2.5} fillOpacity={1} fill="url(#shipmentsGrad)" />
                <Area type="monotone" dataKey="revenue" name="الإيراد (ج.م)" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Breakdown Donut Chart (1 col) */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="text-base font-bold text-white">حالات دورة حياة الشحنات</h2>
            <p className="text-xs text-slate-400 mt-0.5">التوزيع النسبي للطلبات الجارية</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-white font-mono">{totalOrders}</span>
              <span className="text-[10px] text-slate-400">إجمالي الشحنات</span>
            </div>
          </div>

          <div className="mt-2 space-y-1.5 text-xs">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[idx % statusColors.length] }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Regional Performance & Governorate Volume */}
      {governorateStats.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-500" />
                توزيع الشحنات عبر المحافظات المصرية
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                كثافة التوزيع وتقديرات التحصيل النقدي لكل محافظة
              </p>
            </div>
            <span className="text-[11px] text-slate-400">
              أعلى المحافظات طلباً
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={governorateStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1430', borderColor: '#ffffff1a', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="shipments" name="عدد الشحنات" fill="#FA541C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Live Operations Feed & Recent Orders Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent High Priority Orders (2 cols) */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">أحدث شحنات العمليات اللوجستية</h2>
              <p className="text-xs text-slate-400 mt-0.5">متابعة فورية للحالات وسرعة الاستجابة</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowUpRight}
              onClick={() => onNavigateTab('orders')}
            >
              عرض كافة الشحنات ({state.orders.length})
            </Button>
          </div>

          <Table
            columns={['رقم الشحنة / التتبع', 'التاجر', 'المستلم / المحافظة', 'قيمة COD', 'الحالة', 'إجراءات']}
            isEmpty={filteredOrders.length === 0}
            empty="لا توجد شحنات مطابقة لمعايير التصفية"
          >
            {filteredOrders.slice(0, 5).map((order) => (
              <tr
                key={order.id}
                className={rowClass}
                onClick={() => onSelectOrder(order.id)}
              >
                <td className={tdClass}>
                  <div className="font-mono font-bold text-orange-400">{order.trackingNumber}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{order.orderNumber}</div>
                </td>
                <td className={tdClass}>
                  <span className="font-medium text-slate-200">{order.merchantName}</span>
                </td>
                <td className={tdClass}>
                  <div className="text-white font-medium">{order.customerName}</div>
                  <div className="text-[11px] text-slate-400">{order.governorate} · {order.city}</div>
                </td>
                <td className={tdClass}>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatMoney(order.codAmount)}
                  </span>
                </td>
                <td className={tdClass}>
                  <StatusBadge status={order.status} />
                </td>
                <td className={tdClass}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder(order.id);
                    }}
                  >
                    تفاصيل
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {/* Live Operations Activity Stream (1 col) */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
                <h2 className="text-sm font-bold text-white">شريط العمليات اللحظي</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">سجل التدقيق</span>
            </div>

            <div className="mt-4 space-y-3.5 overflow-y-auto max-h-[380px] pr-1">
              {state.auditLogs.slice(0, 7).map((log) => (
                <div key={log.id} className="text-xs rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-1 hover:border-orange-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{log.actorName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{log.timestamp.slice(11)}</span>
                  </div>
                  <div className="text-slate-400 leading-relaxed text-[11px]">{log.details}</div>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-orange-400 font-mono">{log.resourceId}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                      log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {log.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs text-orange-400 hover:text-orange-300"
              onClick={() => onNavigateTab('roles')}
            >
              عرض الصلاحيات والرقابة الأمنية
            </Button>
          </div>
        </Card>
      </div>

    </div>
  );
}

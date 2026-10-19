import { 
  ShoppingBag, 
  Boxes, 
  Wallet, 
  ArrowDownToLine, 
  AlertTriangle, 
  Plus, 
  ArrowUpRight
} from 'lucide-react';
import { useAuth, MERCHANT_ROLE_LABEL } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatMoney } from '../../lib/format';
import { Button, Card, StatCard, StatusBadge, Table, rowClass, tdClass } from '../../components/ui';
import type { NavId } from '../../components/layout/Sidebar';

interface Props {
  onOpenNewOrder: () => void;
  onSelectOrder: (orderId: string) => void;
  onNavigateTab: (tab: NavId) => void;
}

export function MerchantDashboard({
  onOpenNewOrder,
  onSelectOrder,
  onNavigateTab,
}: Props) {
  const { activeMerchantId, user } = useAuth();
  const { state } = useData();

  const merchant = state.merchants.find((m) => m.id === activeMerchantId) || state.merchants[0];

  // Strict tenant data isolation: only filter orders/inventory belonging to active merchant
  const merchantOrders = state.orders.filter((o) => o.merchantId === merchant.id);
  const merchantInventory = state.inventory.filter((i) => i.merchantId === merchant.id);

  const lowStockCount = merchantInventory.filter((i) => i.availableQty <= i.lowStockThreshold).length;
  const activeDeliveryCount = merchantOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;

  return (
    <div className="space-y-6">
      
      {/* Merchant Top Banner */}
      <div className="executive-header-banner flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-orange-950/60 via-[#0B1953] to-[#070D1E] border border-orange-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              بوابة التاجر • معزولة أمنياً
            </span>
            <span className="text-xs text-slate-300 font-mono">ID: {merchant.id}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">
            مرحباً بك، <span className="text-orange-500">{merchant.companyName}</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            دور المستخدم: <strong className="text-white">{user.merchantRole ? MERCHANT_ROLE_LABEL[user.merchantRole] : 'التاجر'}</strong> • متابعة لحظية لحركة بضاعتك، شحناتك، ومحفظتك المالية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={ArrowDownToLine}
            onClick={() => onNavigateTab('m-inbound')}
          >
            طلب توريد بضاعة للمستودع
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={onOpenNewOrder}
          >
            إنشاء شحنة جديدة
          </Button>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <StatCard
          label="الرصيد المتاح للسحب"
          value={formatMoney(merchant.availableBalance)}
          hint={
            <div className="flex items-center justify-between text-xs">
              <span>معلق: {formatMoney(merchant.pendingBalance)}</span>
              <button
                type="button"
                onClick={() => onNavigateTab('m-wallet')}
                className="text-orange-400 hover:text-orange-300 font-bold"
              >
                طلب سحب
              </button>
            </div>
          }
          icon={Wallet}
          tone="emerald"
        />

        <StatCard
          label="شحنات المتجر النشطة"
          value={merchantOrders.length}
          hint={`${activeDeliveryCount} شحنة مع المناديب اليوم`}
          icon={ShoppingBag}
          tone="blue"
        />

        <StatCard
          label="أصنافك في المستودع"
          value={merchantInventory.reduce((acc, i) => acc + i.availableQty + i.reservedQty, 0)}
          hint={`موزعة على ${merchantInventory.length} أصناف SKU`}
          icon={Boxes}
          tone="violet"
        />

        <StatCard
          label="تنبيهات نقص المخزون"
          value={lowStockCount}
          hint={lowStockCount > 0 ? 'أصناف قاربت على النفاد، يُنصح بالتوريد' : 'كافة الأصناف بحالة ممتازة'}
          icon={AlertTriangle}
          tone="amber"
        />

      </div>

      {/* Orders List for This Merchant */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">آخر شحنات متجرك</h2>
            <p className="text-xs text-slate-400">تتبع مسار شحنات عملائك لحظة بلحظة</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('m-orders')}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>عرض كافة الشحنات</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <Table
          columns={['رقم الشحنة والتتبع', 'العميل والمحافظة', 'الأصناف', 'التحصيل المتوقع', 'الحالة', 'التاريخ']}
          isEmpty={merchantOrders.length === 0}
          empty="لا توجد شحنات بعد لهذا المتجر"
        >
          {merchantOrders.slice(0, 5).map((o) => (
            <tr
              key={o.id}
              onClick={() => onSelectOrder(o.id)}
              className={`${rowClass} cursor-pointer`}
            >
              <td className={tdClass}>
                <div className="font-bold text-white">{o.orderNumber}</div>
                <div className="font-mono text-orange-400 text-[11px]">{o.trackingNumber}</div>
              </td>
              <td className={tdClass}>
                <div className="font-bold text-white">{o.customerName}</div>
                <div className="text-[11px] text-slate-400">{o.governorate} - {o.city}</div>
              </td>
              <td className={`${tdClass} text-center font-bold text-slate-300`}>
                {o.items.reduce((acc, i) => acc + i.qty, 0)} قطعة
              </td>
              <td className={`${tdClass} text-center font-mono font-bold text-orange-400`}>
                {formatMoney(o.codAmount)}
              </td>
              <td className={`${tdClass} text-center`}>
                <StatusBadge status={o.status} />
              </td>
              <td className={`${tdClass} text-left font-mono text-slate-400`}>
                {o.createdAt.slice(0, 10)}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

    </div>
  );
}

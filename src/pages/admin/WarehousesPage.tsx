import { useState } from 'react';
import { 
  Warehouse, 
  AlertTriangle, 
  Search, 
  Layers, 
  PackageCheck, 
  CheckCircle2, 
  Edit3, 
  Scan, 
  Barcode, 
  Plus, 
  RotateCcw, 
  ArrowLeftRight, 
  ClipboardCheck, 
  Calculator
} from 'lucide-react';
import type { InboundRequest, WarehouseItem, OrderStatus, ReturnItemInspection } from '../../types';
import { totalQty, useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../lib/format';
import { Badge, Button, Card, StatCard, Table, Tabs, Modal, Field, inputClass, rowClass, tdClass } from '../../components/ui';

interface Props {
  onOpenReceiptModal: (inbound: InboundRequest) => void;
}

export function WarehousesPage({ onOpenReceiptModal }: Props) {
  const { 
    state, 
    setInboundStatus, 
    transitionOrder, 
    adjustStockQuantity, 
    addInventoryItem,
    inspectReturnItem,
    createReturn,
    createStockTransfer,
    updateStockTransferStatus
  } = useData();
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'PICK_PACK' | 'INBOUNDS' | 'RETURNS' | 'TRANSFERS' | 'FEE_RULES' | 'ZONES'>('INVENTORY');
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Adjustment Modal
  const [adjustingItem, setAdjustingItem] = useState<WarehouseItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('جرد دوري ومطابقة الرفوف');

  // Barcode quick scan simulation
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Add Item / SKU Modal State
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemMerchantId, setNewItemMerchantId] = useState(state.merchants[0]?.id || '');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemBarcode, setNewItemBarcode] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('إلكترونيات');
  const [newItemWarehouse, setNewItemWarehouse] = useState('مستودع 6 أكتوبر الرئيسي');
  const [newItemZone, setNewItemZone] = useState('A');
  const [newItemShelf, setNewItemShelf] = useState('01');
  const [newItemBin, setNewItemBin] = useState('01');
  const [newItemQty, setNewItemQty] = useState('50');
  const [newItemThreshold, setNewItemThreshold] = useState('10');
  const [newItemCost, setNewItemCost] = useState('120');
  const [newItemPrice, setNewItemPrice] = useState('210');

  // Returns & QC State
  const [inspectingReturn, setInspectingReturn] = useState<ReturnItemInspection | null>(null);
  const [inspectOutcome, setInspectOutcome] = useState<'RESTOCKED' | 'DAMAGED_SCRAPPED'>('RESTOCKED');
  const [inspectNotes, setInspectNotes] = useState('الصنف سليم تماماً وتمت إعادته للرف');
  const [isNewReturnOpen, setIsNewReturnOpen] = useState(false);
  const [newReturnOrder, setNewReturnOrder] = useState('ORD-2026-');
  const [newReturnTracking, setNewReturnTracking] = useState('LTX9842');
  const [newReturnMerchantId, setNewReturnMerchantId] = useState(state.merchants[0]?.id || '');
  const [newReturnCustomer, setNewReturnCustomer] = useState('');
  const [newReturnPhone, setNewReturnPhone] = useState('010');
  const [newReturnSku, setNewReturnSku] = useState('');
  const [newReturnItemName, setNewReturnItemName] = useState('');
  const [newReturnQty, setNewReturnQty] = useState('1');
  const [newReturnReason, setNewReturnReason] = useState('طلب العميل معاينة ورفض الاستلام');

  // Stock Transfer State
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState('مستودع 6 أكتوبر الرئيسي');
  const [transferTo, setTransferTo] = useState('مستودع العبور اللوجستي');
  const [transferMerchantId, setTransferMerchantId] = useState(state.merchants[0]?.id || '');
  const [transferSku, setTransferSku] = useState('');
  const [transferItemName, setTransferItemName] = useState('');
  const [transferQty, setTransferQty] = useState('20');
  const [transferDriver, setTransferDriver] = useState('كابتن النقل الداخلي');

  // Storage & Fulfillment Fees Calculator Simulator State
  const [calcMerchantId, setCalcMerchantId] = useState(state.merchants[0]?.id || '');
  const [calcItemsCount, setCalcItemsCount] = useState('150');
  const [calcCbmVolume, setCalcCbmVolume] = useState('4.5');
  const [calcFulfillmentOrders, setCalcFulfillmentOrders] = useState('85');

  const filteredInventory = state.inventory.filter((item) => {
    const merchant = state.merchants.find((m) => m.id === item.merchantId);
    return (
      item.name.includes(searchQuery) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.barcode.includes(searchQuery) ||
      (merchant && merchant.companyName.includes(searchQuery))
    );
  });

  const fulfillmentOrders = state.orders.filter((o) =>
    ['CONFIRMED', 'PICKING', 'PACKING', 'READY_FOR_DISPATCH'].includes(o.status)
  );

  const handleApproveInbound = (id: string) => {
    const res = setInboundStatus(id, 'APPROVED');
    if (res.ok) toast('تمت الموافقة على إشعار التوريد');
    else toast(res.error || 'حدث خطأ', 'error');
  };

  const handleRejectInbound = (id: string) => {
    const res = setInboundStatus(id, 'REJECTED');
    if (res.ok) toast('تم رفض إشعار التوريد', 'error');
    else toast(res.error || 'حدث خطأ', 'error');
  };

  const handleAdvanceFulfillment = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = 'PICKING';
    let label = 'بدء سحب الأصناف من الرفوف';
    if (currentStatus === 'CONFIRMED') {
      nextStatus = 'PICKING';
      label = 'بدء سحب الأصناف من الرفوف (Picking)';
    } else if (currentStatus === 'PICKING') {
      nextStatus = 'PACKING';
      label = 'تأكيد السحب والبدء في التغليف (Packing)';
    } else if (currentStatus === 'PACKING') {
      nextStatus = 'READY_FOR_DISPATCH';
      label = 'اكتمال التغليف والجاهزية للشحن (Ready for Dispatch)';
    }

    const res = transitionOrder(orderId, nextStatus, {
      actor: user.name || 'مسؤول WMS',
      note: label,
    });
    if (res.ok) {
      toast(`تم تحديث مسار التجهيز: ${label}`);
    } else {
      toast(res.error || 'فشل تحديث الحالة', 'error');
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addInventoryItem({
      merchantId: newItemMerchantId,
      sku: newItemSku.trim().toUpperCase(),
      barcode: newItemBarcode.trim() || `622${Date.now().toString().slice(-10)}`,
      name: newItemName.trim(),
      category: newItemCategory.trim(),
      warehouseId: 'wh-1',
      warehouseName: newItemWarehouse,
      zone: newItemZone,
      shelf: newItemShelf,
      bin: newItemBin,
      availableQty: parseInt(newItemQty) || 0,
      lowStockThreshold: parseInt(newItemThreshold) || 10,
      unitCost: parseFloat(newItemCost) || 0,
      sellingPrice: parseFloat(newItemPrice) || 0,
    });
    if (res.ok) {
      toast(`تم تسجيل الصنف ${newItemName} بنجاح وحفظه على الرف المخزني`);
      setIsAddItemOpen(false);
      setNewItemSku('');
      setNewItemBarcode('');
      setNewItemName('');
    } else {
      toast(res.error || 'فشلت إضافة الصنف', 'error');
    }
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;
    const res = adjustStockQuantity(adjustingItem.id, adjustDelta, adjustReason, user.name || 'مسؤول المستودع');
    if (res.ok) {
      toast(`تم تعديل جرد الصنف ${adjustingItem.name} وتسجيله في سجل التدقيق بنجاح`);
      setAdjustingItem(null);
      setAdjustDelta(0);
    } else {
      toast(res.error || 'فشل تعديل الجرد', 'error');
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = scannedCode.trim();
    if (!query) return;
    const foundItem = state.inventory.find(
      (i) => i.barcode === query || i.sku.toLowerCase() === query.toLowerCase()
    );
    if (foundItem) {
      setScanResult(`تم التعرف على الصنف: ${foundItem.name} • الموقع: ${foundItem.zone} - رف ${foundItem.shelf} - خانة ${foundItem.bin} • المتاح: ${foundItem.availableQty}`);
    } else {
      const foundOrder = state.orders.find(
        (o) => o.trackingNumber === query || o.orderNumber === query
      );
      if (foundOrder) {
        setScanResult(`تم التعرف على الشحنة: ${foundOrder.orderNumber} • العميل: ${foundOrder.customerName} • الحالة: ${foundOrder.status}`);
      } else {
        setScanResult('لم يتم العثور على صنف أو شحنة مطابقة لهذا الباركود');
      }
    }
  };

  const handleConfirmQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingReturn) return;
    const res = inspectReturnItem(inspectingReturn.id, inspectOutcome, inspectNotes, user.name || 'مهندس الجودة QC');
    if (res.ok) {
      toast(
        inspectOutcome === 'RESTOCKED'
          ? `تم اعتماد الصنف سليم وإعادته إلى رصيد المستودع المتاح (+${inspectingReturn.quantity} قطعة)`
          : `تم تسجيل الصنف كتالف ومستبعد (+${inspectingReturn.quantity} قطعة تالفة)`
      );
      setInspectingReturn(null);
    } else {
      toast(res.error || 'فشل تسجيل الفحص', 'error');
    }
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = state.merchants.find((m) => m.id === newReturnMerchantId);
    const res = createReturn({
      orderNumber: newReturnOrder.trim(),
      trackingNumber: newReturnTracking.trim(),
      merchantId: newReturnMerchantId,
      merchantName: merchant?.companyName || 'متجر شريك',
      customerName: newReturnCustomer.trim() || 'عميل تجريبي',
      customerPhone: newReturnPhone.trim(),
      sku: newReturnSku.trim() || 'SKU-RET',
      itemName: newReturnItemName.trim() || 'صنف مرتجع',
      quantity: parseInt(newReturnQty) || 1,
      returnReason: newReturnReason.trim(),
    });
    if (res.ok) {
      toast('تم تسجيل طلب المرتجع بنجاح وبانتظار فحص مسؤول الجودة');
      setIsNewReturnOpen(false);
      setNewReturnCustomer('');
    } else {
      toast(res.error || 'فشل تسجيل المرتجع', 'error');
    }
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const merchant = state.merchants.find((m) => m.id === transferMerchantId);
    const res = createStockTransfer({
      fromWarehouse: transferFrom,
      toWarehouse: transferTo,
      merchantId: transferMerchantId,
      merchantName: merchant?.companyName || 'متجر',
      sku: transferSku.trim() || 'SKU-TRF',
      itemName: transferItemName.trim() || 'بضاعة محولة',
      quantity: parseInt(transferQty) || 1,
      driverName: transferDriver.trim(),
    });
    if (res.ok) {
      toast('تم إنشاء إذن تحويل البضاعة وبدء خروج الشاحنة للنقل');
      setIsNewTransferOpen(false);
    } else {
      toast(res.error || 'فشل إنشاء إذن التحويل', 'error');
    }
  };

  // Fees calculation simulator math
  const calculatedStorageFees = (parseFloat(calcCbmVolume) || 0) * 120 + (parseInt(calcItemsCount) || 0) * 1.5;
  const calculatedFulfillmentFees = (parseInt(calcFulfillmentOrders) || 0) * 12;
  const calculatedTotalMonthlyFees = calculatedStorageFees + calculatedFulfillmentFees;

  return (
    <div className="space-y-6">
      
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20 shadow-lg shadow-orange-500/10">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white">إدارة المستودعات وسلاسل الإمداد والتجهيز (WMS)</h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[11px] font-mono font-bold text-orange-400">
                PRO WMS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              متابعة أرصدة الرفوف، مسار السحب والتغليف (Pick & Pack)، إشعارات التوريد، فحص المرتجعات، والتحويل بين الفروع
            </p>
          </div>
        </div>

        {/* Action Buttons in Header */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <Button
            variant="secondary"
            icon={ArrowLeftRight}
            size="sm"
            onClick={() => setIsNewTransferOpen(true)}
          >
            إذن تحويل بين الفروع
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            size="sm"
            onClick={() => setIsAddItemOpen(true)}
          >
            تسجيل صنف / SKU جديد
          </Button>
        </div>
      </div>

      {/* Dedicated Executive Full-Width Tab Bar */}
      <Tabs
        value={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        tabs={[
          { id: 'INVENTORY', label: 'أرصدة الأصناف والرفوف', count: state.inventory.length, icon: Warehouse },
          { id: 'PICK_PACK', label: 'السحب والتغليف (Pick & Pack)', count: fulfillmentOrders.length, icon: PackageCheck },
          { id: 'INBOUNDS', label: 'إشعارات التوريد', count: state.inbounds.length, icon: ClipboardCheck },
          { id: 'RETURNS', label: 'المرتجعات وفحص الجودة QC', count: state.returns.length, icon: RotateCcw },
          { id: 'TRANSFERS', label: 'التحويل بين المخازن', count: state.transfers.length, icon: ArrowLeftRight },
          { id: 'FEE_RULES', label: 'قواعد رسوم التخزين والتجهيز', icon: Calculator },
          { id: 'ZONES', label: 'تخطيط الخانات والرفوف', icon: Layers },
        ]}
      />

      {/* Tab 1: Inventory Balances */}
      {activeTab === 'INVENTORY' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              label="إجمالي القطع بالمخازن"
              value={state.inventory.reduce((acc, i) => acc + totalQty(i), 0)}
              hint="في جميع المستودعات"
              icon={Warehouse}
              tone="blue"
            />
            <StatCard
              label="القطع المحجوزة للطلبات"
              value={state.inventory.reduce((acc, i) => acc + i.reservedQty, 0)}
              hint="حجز آلي محمي من البيع الزائد"
              icon={PackageCheck}
              tone="orange"
            />
            <StatCard
              label="القطع المتاحة للبيع الفوري"
              value={state.inventory.reduce((acc, i) => acc + i.availableQty, 0)}
              hint="جاهزة لاستقبال طلبات شحن"
              icon={CheckCircle2}
              tone="emerald"
            />
            <StatCard
              label="أصناف وصلت لحد النواقص"
              value={state.inventory.filter((i) => i.availableQty <= i.lowStockThreshold).length}
              hint="تحتاج إشعار توريد من التاجر"
              icon={AlertTriangle}
              tone="red"
            />
          </div>

          <Card className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث بالصنف، الباركود، أو التاجر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputClass} pr-9 text-xs`}
              />
            </div>

            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => setIsAddItemOpen(true)}
            >
              تسجيل صنف / SKU جديد
            </Button>
          </Card>

          <Card className="overflow-hidden">
            <Table
              columns={[
                'الصنف والباركود',
                'التاجر',
                'المستودع والموقع',
                'المتاح',
                'المحجوز',
                'التالف',
                'الإجمالي',
                'سعر التكلفة / البيع',
                'تعديل الجرد',
              ]}
              isEmpty={filteredInventory.length === 0}
            >
              {filteredInventory.map((item) => {
                const merchant = state.merchants.find((m) => m.id === item.merchantId);
                const isLowStock = item.availableQty <= item.lowStockThreshold;

                return (
                  <tr key={item.id} className={rowClass}>
                    <td className={tdClass}>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{item.name}</span>
                        {isLowStock && (
                          <span className="p-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-mono flex items-center gap-1 border border-red-500/20">
                            <AlertTriangle className="w-3 h-3" /> ناقص
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-orange-400 text-[11px] font-semibold">{item.sku}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Barcode className="w-3 h-3 text-slate-500" />
                        <span>{item.barcode}</span>
                      </div>
                    </td>

                    <td className={`${tdClass} text-slate-200 font-semibold`}>
                      {merchant?.companyName || 'غير محدد'}
                    </td>

                    <td className={tdClass}>
                      <div className="text-white font-semibold text-xs">{item.warehouseName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">
                        منطقة {item.zone} • رف {item.shelf} • خانة {item.bin}
                      </div>
                    </td>

                    <td className={`${tdClass} text-center font-bold text-emerald-400 text-sm font-mono`}>
                      {item.availableQty}
                    </td>

                    <td className={`${tdClass} text-center font-bold text-orange-400 text-sm font-mono`}>
                      {item.reservedQty}
                    </td>

                    <td className={`${tdClass} text-center font-bold text-red-400 text-sm font-mono`}>
                      {item.damagedQty}
                    </td>

                    <td className={`${tdClass} text-center font-extrabold text-white text-sm font-mono`}>
                      {totalQty(item)}
                    </td>

                    <td className={`${tdClass} text-center text-xs font-mono`}>
                      <div className="text-slate-300">تكلفة: {formatMoney(item.unitCost)}</div>
                      <div className="text-emerald-400 font-bold">بيع: {formatMoney(item.sellingPrice)}</div>
                    </td>

                    <td className={`${tdClass} text-center`}>
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustingItem(item);
                          setAdjustDelta(0);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-orange-500/20 text-orange-400 transition-colors cursor-pointer"
                        title="تعديل جرد يدوي"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Card>

          {/* Barcode Quick Lookup Tool */}
          <Card className="p-4 space-y-3 bg-[#060B19]/80 border-white/[0.08]">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Scan className="w-4 h-4 text-orange-500" />
              <span>محاكي المسح الضوئي وقارئ الباركود (Barcode Handheld Scanner Simulation)</span>
            </div>
            <form onSubmit={handleScanSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="امسح أو اكتب الباركود أو SKU للبحث الفوري عن الرف أو الشحنة..."
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                className={`${inputClass} text-xs font-mono`}
              />
              <Button type="submit" variant="secondary" size="sm">
                فحص الباركود
              </Button>
            </form>
            {scanResult && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 font-semibold animate-pop">
                {scanResult}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 2: Pick & Pack Pipeline */}
      {activeTab === 'PICK_PACK' && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">مسار تجهيز الشحنات والمستودع (Pick & Pack Pipeline)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  تتبع حركة أمر التجهيز من الحجز بالمستودع إلى التغليف والجاهزية للتسليم لمندوب التوزيع
                </p>
              </div>
              <Badge tone="blue">{fulfillmentOrders.length} شحنة قيد التجهيز</Badge>
            </div>

            <Table
              columns={[
                'رقم الشحنة',
                'التاجر',
                'موقع الرف المطلوب سحبه',
                'الأصناف والكميات',
                'المرحلة الحالية',
                'الإجراء التشغيلي',
              ]}
              isEmpty={fulfillmentOrders.length === 0}
              empty="لا توجد شحنات بحاجة لتجهيز أو تغليف حالياً"
            >
              {fulfillmentOrders.map((order) => {
                return (
                  <tr key={order.id} className={rowClass}>
                    <td className={`${tdClass} font-bold text-white font-mono`}>
                      {order.orderNumber}
                      <div className="text-[11px] text-orange-400 font-mono">{order.trackingNumber}</div>
                    </td>

                    <td className={`${tdClass} text-slate-200`}>
                      {order.merchantName}
                    </td>

                    <td className={`${tdClass} font-mono text-xs text-slate-300`}>
                      {order.items.map((i) => {
                        const itm = state.inventory.find((inv) => inv.sku === i.sku);
                        return (
                          <div key={i.id} className="text-orange-300">
                            {i.sku} ➔ {itm?.zone ? `Zone ${itm.zone} - رف ${itm.shelf}` : 'المستودع الرئيسي'}
                          </div>
                        );
                      })}
                    </td>

                    <td className={tdClass}>
                      {order.items.map((i) => (
                        <div key={i.id} className="text-xs text-slate-200">
                          {i.qty}× {i.name}
                        </div>
                      ))}
                    </td>

                    <td className={`${tdClass} text-center`}>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        order.status === 'CONFIRMED' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                        order.status === 'PICKING' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                        order.status === 'PACKING' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                        'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {order.status === 'CONFIRMED' ? 'بانتظار السحب' :
                         order.status === 'PICKING' ? 'جاري السحب من الرفوف' :
                         order.status === 'PACKING' ? 'جاري التغليف والفحص' : 'جاهز للتسليم للسائق'}
                      </span>
                    </td>

                    <td className={`${tdClass} text-left`}>
                      {order.status !== 'READY_FOR_DISPATCH' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAdvanceFulfillment(order.id, order.status)}
                        >
                          {order.status === 'CONFIRMED' && 'بدء السحب (Picking)'}
                          {order.status === 'PICKING' && 'تأكيد السحب والبدء بالتغليف'}
                          {order.status === 'PACKING' && 'إكمال التغليف (Ready)'}
                        </Button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> جاهز للتسليم لمندوب التوزيع
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 3: Inbounds */}
      {activeTab === 'INBOUNDS' && (
        <Card className="overflow-hidden">
          <Table
            columns={[
              'رقم إشعار التوريد',
              'التاجر',
              'المستودع المستلم',
              'تاريخ الوصول المتوقع',
              'إجمالي القطع',
              'الحالة',
              'إجراءات',
            ]}
            isEmpty={state.inbounds.length === 0}
          >
            {state.inbounds.map((inb) => (
              <tr key={inb.id} className={rowClass}>
                <td className={`${tdClass} font-mono font-bold text-white`}>
                  {inb.requestNumber}
                </td>
                <td className={`${tdClass} font-semibold text-slate-200`}>
                  {state.merchants.find((m) => m.id === inb.merchantId)?.companyName || 'متجر معتمد'}
                </td>
                <td className={`${tdClass} text-slate-300`}>
                  {inb.warehouseName}
                </td>
                <td className={`${tdClass} text-center font-mono text-slate-400`}>
                  {inb.expectedArrivalDate}
                </td>
                <td className={`${tdClass} text-center font-bold text-white font-mono`}>
                  {inb.items.reduce((acc, i) => acc + i.requestedQty, 0)} قطعة
                </td>
                <td className={`${tdClass} text-center`}>
                  <Badge tone={inb.status === 'CONFIRMED' ? 'emerald' : inb.status === 'APPROVED' ? 'blue' : inb.status === 'REJECTED' ? 'red' : 'amber'}>
                    {inb.status === 'CONFIRMED' ? 'تم الفحص والاستلام وزيادة الرصيد' : inb.status === 'APPROVED' ? 'معتمد وبانتظار وصول الشاحنة' : inb.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                  </Badge>
                </td>
                <td className={`${tdClass} text-left`}>
                  <div className="flex items-center justify-end gap-2">
                    {inb.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleApproveInbound(inb.id)}
                        >
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRejectInbound(inb.id)}
                        >
                          رفض
                        </Button>
                      </>
                    )}
                    {inb.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onOpenReceiptModal(inb)}
                      >
                        إجراء فحص والاستلام الفعلي
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* Tab 4: Returns & Quality Inspection QC */}
      {activeTab === 'RETURNS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              label="إجمالي المرتجعات"
              value={state.returns.length}
              hint="شحنات وطرود مرتجعة"
              icon={RotateCcw}
              tone="amber"
            />
            <StatCard
              label="بانتظار الفحص الفني QC"
              value={state.returns.filter((r) => r.inspectionStatus === 'PENDING_INSPECTION').length}
              hint="تحتاج تقرير فحص"
              icon={ClipboardCheck}
              tone="orange"
            />
            <StatCard
              label="سليم وأعيد للرف (Restocked)"
              value={state.returns.filter((r) => r.inspectionStatus === 'RESTOCKED').length}
              hint="عادت للأرصدة المتاحة للبيع"
              icon={CheckCircle2}
              tone="emerald"
            />
            <StatCard
              label="تالف ومستبعد (Damaged)"
              value={state.returns.filter((r) => r.inspectionStatus === 'DAMAGED_SCRAPPED').length}
              hint="تم إثباته في رصيد التوالف"
              icon={AlertTriangle}
              tone="red"
            />
          </div>

          <Card className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">إدارة اللوجستيات العكسية وفحص المرتجعات (Reverse Logistics & QC)</h3>
              <p className="text-xs text-slate-400">فحص الطرود المرتجعة وإعادة السليم للرف أو إثبات التالف مع توثيق الأثر في سجل الرقابة</p>
            </div>

            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => setIsNewReturnOpen(true)}
            >
              تسجيل مرتجع شحنة جديد
            </Button>
          </Card>

          <Card className="overflow-hidden">
            <Table
              columns={[
                'رقم المرتجع / الشحنة',
                'التاجر والعميل',
                'الصنف والكمية',
                'سبب الإرجاع',
                'حالة الفحص والقرار',
                'المسؤول والتاريخ',
                'إجراءات',
              ]}
              isEmpty={state.returns.length === 0}
            >
              {state.returns.map((ret) => (
                <tr key={ret.id} className={rowClass}>
                  <td className={`${tdClass} font-mono`}>
                    <div className="font-bold text-white">{ret.returnNumber}</div>
                    <div className="text-[11px] text-orange-400 font-bold">{ret.orderNumber}</div>
                    <div className="text-[10px] text-slate-400">{ret.trackingNumber}</div>
                  </td>

                  <td className={tdClass}>
                    <div className="font-bold text-white">{ret.merchantName}</div>
                    <div className="text-xs text-slate-300">{ret.customerName} ({ret.customerPhone})</div>
                  </td>

                  <td className={tdClass}>
                    <div className="font-bold text-slate-200">{ret.itemName}</div>
                    <div className="text-xs text-orange-400 font-mono">{ret.quantity} قطعة • SKU: {ret.sku}</div>
                  </td>

                  <td className={`${tdClass} text-xs text-slate-300 max-w-xs`}>
                    {ret.returnReason}
                  </td>

                  <td className={`${tdClass} text-center`}>
                    <Badge tone={ret.inspectionStatus === 'RESTOCKED' ? 'emerald' : ret.inspectionStatus === 'DAMAGED_SCRAPPED' ? 'red' : 'amber'}>
                      {ret.inspectionStatus === 'RESTOCKED' ? 'سليم وأعيد للرف للبيع' : ret.inspectionStatus === 'DAMAGED_SCRAPPED' ? 'تالف ومستبعد' : 'بانتظار الفحص الفني QC'}
                    </Badge>
                  </td>

                  <td className={`${tdClass} text-center text-xs text-slate-400`}>
                    {ret.inspectedBy ? (
                      <>
                        <div className="text-slate-200 font-semibold">{ret.inspectedBy}</div>
                        <div className="font-mono text-[10px]">{ret.inspectionDate}</div>
                      </>
                    ) : (
                      <span className="italic">لم يفحص بعد</span>
                    )}
                  </td>

                  <td className={`${tdClass} text-left`}>
                    {ret.inspectionStatus === 'PENDING_INSPECTION' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={ClipboardCheck}
                        onClick={() => {
                          setInspectingReturn(ret);
                          setInspectOutcome('RESTOCKED');
                        }}
                      >
                        فحص الجودة QC
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">مغلق ومسجل</span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 5: Inter-Warehouse Stock Transfers */}
      {activeTab === 'TRANSFERS' && (
        <div className="space-y-4">
          <Card className="p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-orange-500" />
                <span>التحويلات المخزنية بين الفروع والمستودعات (Inter-Warehouse Transfers)</span>
              </h3>
              <p className="text-xs text-slate-400">إدارة حركة نقل البضائع بين مستودع 6 أكتوبر والعبور والإسكندرية مع إثبات السائق والتأكيد</p>
            </div>

            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => setIsNewTransferOpen(true)}
            >
              إصدار إذن تحويل جديد
            </Button>
          </Card>

          <Card className="overflow-hidden">
            <Table
              columns={[
                'رقم الإذن',
                'من مستودع',
                'إلى مستودع',
                'التاجر والصنف',
                'الكمية المحولة',
                'سائق الشاحنة',
                'الحالة',
                'إجراءات',
              ]}
              isEmpty={state.transfers.length === 0}
            >
              {state.transfers.map((trf) => (
                <tr key={trf.id} className={rowClass}>
                  <td className={`${tdClass} font-mono font-bold text-white`}>
                    {trf.transferNumber}
                    <div className="text-[10px] text-slate-400">{trf.createdDate}</div>
                  </td>

                  <td className={`${tdClass} font-semibold text-slate-300`}>
                    {trf.fromWarehouse}
                  </td>

                  <td className={`${tdClass} font-bold text-orange-400`}>
                    {trf.toWarehouse}
                  </td>

                  <td className={tdClass}>
                    <div className="font-bold text-white">{trf.itemName}</div>
                    <div className="text-xs text-slate-400 font-mono">{trf.merchantName} • {trf.sku}</div>
                  </td>

                  <td className={`${tdClass} text-center font-black text-white font-mono text-sm`}>
                    {trf.quantity} قطعة
                  </td>

                  <td className={`${tdClass} text-center text-xs text-slate-300`}>
                    {trf.driverName || 'شاحنة النقل الداخلي'}
                  </td>

                  <td className={`${tdClass} text-center`}>
                    <Badge tone={trf.status === 'RECEIVED' ? 'emerald' : trf.status === 'DISPATCHED' ? 'blue' : 'amber'}>
                      {trf.status === 'RECEIVED' ? 'تم الاستلام وتحديث الرصيد' : trf.status === 'DISPATCHED' ? 'في الطريق بالشاحنة' : 'مسودة'}
                    </Badge>
                  </td>

                  <td className={`${tdClass} text-left`}>
                    {trf.status === 'DISPATCHED' && (
                      <Button
                        size="sm"
                        variant="success"
                        icon={CheckCircle2}
                        onClick={() => {
                          const res = updateStockTransferStatus(trf.id, 'RECEIVED');
                          if (res.ok) toast(`تم تأكيد استلام الشحنة في ${trf.toWarehouse} بنجاح`);
                        }}
                      >
                        تأكيد الاستلام بالمستودع
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 6: Storage & Fulfillment Fee Rules Simulator */}
      {activeTab === 'FEE_RULES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5 space-y-2 border-orange-500/30">
              <span className="text-xs font-bold text-orange-400 block">رسوم التخزين الشهرية (Storage)</span>
              <div className="text-2xl font-black text-white font-mono">120 ج.م <span className="text-xs text-slate-400 font-normal">/ متر مكعب (CBM)</span></div>
              <p className="text-[11px] text-slate-300">أو 1.50 ج.م شهرياً لكل قطعة للمتاجر ذات الأحجام الصغيرة، مع فترة سماح مجانية 14 يوماً للبضاعة سريعة الدوران.</p>
            </Card>

            <Card className="p-5 space-y-2 border-sky-500/30">
              <span className="text-xs font-bold text-sky-400 block">رسوم السحب والتغليف (Pick & Pack)</span>
              <div className="text-2xl font-black text-white font-mono">12 ج.م <span className="text-xs text-slate-400 font-normal">/ لكل شحنة</span></div>
              <p className="text-[11px] text-slate-300">تشمل باركود بوليصة الشحن، كرتونة الشحن الآمنة المقواة، شريط الأمان اللاصق، وفقاعات الحماية الهوائية.</p>
            </Card>

            <Card className="p-5 space-y-2 border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 block">رسوم إعادة التخزين والفحص (Restock QC)</span>
              <div className="text-2xl font-black text-white font-mono">8 ج.م <span className="text-xs text-slate-400 font-normal">/ للمرتجع الصالح</span></div>
              <p className="text-[11px] text-slate-300">إجراءات الفحص الفني، إعادة التغليف إن لزم، وإدراج الصنف على الرف الإلكتروني للمتجر مرة أخرى.</p>
            </Card>
          </div>

          {/* Interactive Calculator Simulator */}
          <Card className="p-6 bg-gradient-to-br from-[#0B1953]/50 to-[#070D1E] border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Calculator className="w-5 h-5 text-orange-500" />
              <span>حاسبة ومحاكي رسوم التخزين والتجهيز الشهري التقديرية للتاجر</span>
            </div>
            <p className="text-xs text-slate-300">
              أداة إدارية ذكية لتقدير الفاتورة الشهرية ومطابقتها قبل إصدار فواتير التجار الرسمية.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <Field label="اختر التاجر المستهدف">
                <select
                  value={calcMerchantId}
                  onChange={(e) => setCalcMerchantId(e.target.value)}
                  className={inputClass}
                >
                  {state.merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.companyName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="حجم التخزين بالمتر المكعب (CBM)">
                <input
                  type="number"
                  step="0.1"
                  value={calcCbmVolume}
                  onChange={(e) => setCalcCbmVolume(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="عدد القطع الإجمالية بالمستودع">
                <input
                  type="number"
                  value={calcItemsCount}
                  onChange={(e) => setCalcItemsCount(e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="عدد الشحنات المجهزة (Pick & Pack)">
                <input
                  type="number"
                  value={calcFulfillmentOrders}
                  onChange={(e) => setCalcFulfillmentOrders(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.08] flex flex-wrap justify-between items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">رسوم التخزين المقدرة:</span>
                <strong className="text-white font-mono text-sm">{formatMoney(calculatedStorageFees)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">رسوم التجهيز والتغليف:</span>
                <strong className="text-white font-mono text-sm">{formatMoney(calculatedFulfillmentFees)}</strong>
              </div>
              <div>
                <span className="text-orange-400 block font-bold">إجمالي فاتورة المستودع الشهرية التقديرية:</span>
                <strong className="text-orange-400 font-mono text-lg font-black">{formatMoney(calculatedTotalMonthlyFees)}</strong>
              </div>
              <div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => toast(`تم حفظ تقدير التكلفة للمتجر بقيمة ${formatMoney(calculatedTotalMonthlyFees)} بنجاح`)}
                >
                  اعتماد التقدير في تقرير الشهر
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 7: Zones Layout */}
      {activeTab === 'ZONES' && (
        <div className="space-y-6">
          {/* Warehouse Floorplan Capacity & IoT Telemetry HUD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">إجمالي سعة الخانات والرفوف</span>
              <div className="text-2xl font-black text-white font-mono">1,200 <span className="text-xs text-slate-400 font-normal">خانة تخزين</span></div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" style={{ width: '72%' }} />
              </div>
              <div className="text-[11px] text-orange-400 font-semibold pt-1">نسبة الإشغال الكلية: 72% (864 خانة مشغولة)</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">المناطق المعتمدة (Active Zones)</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">4 <span className="text-xs text-slate-400 font-normal">مناطق تخزين رئيسية</span></div>
              <div className="text-[11px] text-slate-300 pt-2">A: ملابس • B: إلكترونيات • C: مبرد • D: أرصفة الشحن</div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">بوابات الشحن والتفريغ (Docks)</span>
              <div className="text-2xl font-black text-sky-400 font-mono">4 <span className="text-xs text-slate-400 font-normal">بوابات هيدروليكية</span></div>
              <div className="text-[11px] text-sky-300 pt-2 flex items-center gap-1.5 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                جميع البوابات تعمل بكفاءة تامة
              </div>
            </Card>

            <Card className="p-4 space-y-1">
              <span className="text-xs text-slate-400 font-bold block">مراقبة المناخ وإنذار الحريق IoT</span>
              <div className="text-2xl font-black text-amber-400 font-mono">19.4°C <span className="text-xs text-slate-400 font-normal">/ رطوبة 48%</span></div>
              <div className="text-[11px] text-emerald-400 pt-2 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> الأجواء مثالية لمستحضرات التجميل
              </div>
            </Card>
          </div>

          {/* 4 Interactive Zone Rack Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Zone A */}
            <Card className="p-5 space-y-3.5 border-orange-500/25">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <span>Zone A - ملابس وأقمشة</span>
                </h3>
                <Badge tone="orange">عالية الحركة</Badge>
              </div>
              <p className="text-xs text-slate-300">رفوف حديدية سريعة الوصول للملابس الجاهزة والمنسوجات بممرات واسعة لعربات السحب</p>
              
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">الرف SH-01</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">85% ممتلئ</div>
                  <div className="text-[9px] text-slate-500 font-mono">هودي قطن</div>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">الرف SH-02</div>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">45% ممتلئ</div>
                  <div className="text-[9px] text-slate-500 font-mono">تيشرت كاجوال</div>
                </div>
                <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-center">
                  <div className="text-[10px] text-orange-300">الرف SH-03</div>
                  <div className="text-xs font-bold text-orange-400 mt-0.5">متاح للاستلام</div>
                  <div className="text-[9px] text-orange-300 font-mono">جاهز للتسكين</div>
                </div>
              </div>
            </Card>

            {/* Zone B */}
            <Card className="p-5 space-y-3.5 border-sky-500/25">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Zone B - إلكترونيات وقيمة</span>
                </h3>
                <Badge tone="blue">خزائن مؤمنة</Badge>
              </div>
              <p className="text-xs text-slate-300">منطقة بكاميرات مراقبة مستمرة 24/7 وخزائن حديدية مغلقة ببصمة يد إلكترونية وسجل دخول</p>
              
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">الخانة SAFE-01</div>
                  <div className="text-xs font-bold text-sky-400 mt-0.5">ساعات ذكية</div>
                  <div className="text-[9px] text-slate-500 font-mono">35 قطعة</div>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">الخانة SAFE-02</div>
                  <div className="text-xs font-bold text-sky-400 mt-0.5">سماعات ANC</div>
                  <div className="text-[9px] text-slate-500 font-mono">48 قطعة</div>
                </div>
                <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-center">
                  <div className="text-[10px] text-sky-300">الخانة SAFE-03</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">مؤمنة وفارغة</div>
                  <div className="text-[9px] text-sky-300 font-mono">جاهزة للطلب</div>
                </div>
              </div>
            </Card>

            {/* Zone C */}
            <Card className="p-5 space-y-3.5 border-emerald-500/25">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Zone C - مستحضرات مبردة</span>
                </h3>
                <Badge tone="emerald">تحكم بالحرارة</Badge>
              </div>
              <p className="text-xs text-slate-300">درجة حرارة ثابتة 18-22 مئوية مع مستشعرات رطوبة رقمية معتمدة لهيئة الدواء المصرية</p>
              
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">الخانة COLD-01</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">عطور وبخور</div>
                  <div className="text-[9px] text-slate-500 font-mono">60 زجاجة</div>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">الخانة COLD-02</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">سيروم وعناية</div>
                  <div className="text-[9px] text-slate-500 font-mono">110 عبوة</div>
                </div>
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <div className="text-[10px] text-emerald-300">الخانة COLD-03</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">19.2°C مستقر</div>
                  <div className="text-[9px] text-emerald-300 font-mono">سعة 50%</div>
                </div>
              </div>
            </Card>

            {/* Zone D */}
            <Card className="p-5 space-y-3.5 border-purple-500/25">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-purple-400" />
                  <span>Zone D - رصيف الاستلام والتجهيز</span>
                </h3>
                <Badge tone="violet">أرصفة الشحن</Badge>
              </div>
              <p className="text-xs text-slate-300">منطقة استلام شاحنات التوريد (Inbound Staging) وتسليم الطرود المجهزة لمناديب التوزيع اليومية</p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-center">
                  <div className="text-[10px] text-purple-300">رصيف DOCK-01</div>
                  <div className="text-xs font-bold text-purple-400 mt-0.5">شاحنة التوريد</div>
                  <div className="text-[9px] text-slate-400 font-mono">تفريغ فوري</div>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
                  <div className="text-[10px] text-slate-400">رصيف DOCK-02</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">تسليم الأسطول</div>
                  <div className="text-[9px] text-slate-400 font-mono">كشوف نشطة</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingItem && (
        <Modal
          open
          onClose={() => setAdjustingItem(null)}
          title={`تعديل جرد يدوي: ${adjustingItem.name}`}
          subtitle={`الموقع: ${adjustingItem.warehouseName} · ${adjustingItem.zone} - رف ${adjustingItem.shelf}`}
          icon={Edit3}
          size="md"
        >
          <form onSubmit={handleApplyAdjustment} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-slate-400">الرصيد المتاح الحالي:</span>
              <span className="font-mono font-bold text-white text-sm">{adjustingItem.availableQty} قطعة</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                مقدار التعديل (الفرق بالقطع)
              </label>
              <input
                type="number"
                required
                placeholder="مثال: 5 للزيادة أو -3 للنقصان"
                value={adjustDelta || ''}
                onChange={(e) => setAdjustDelta(Number(e.target.value))}
                className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs font-mono text-white focus:border-orange-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                الرصيد الجديد بعد التعديل: {Math.max(0, adjustingItem.availableQty + adjustDelta)} قطعة
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                سبب التعديل الرقابي (Audit Reason)
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="مثال: جرد سنوي، عجز كرتونة، إهلاك تالف..."
                className="w-full rounded-xl border border-white/[0.08] bg-[#070D1F] px-3.5 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAdjustingItem(null)}
              >
                إلغاء
              </Button>
              <Button type="submit" variant="primary">
                حفظ التعديل الرقابي
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Inventory Item Modal */}
      <Modal
        open={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title="تسجيل صنف مخزني جديد (SKU) وتحديد الرف والخانات"
        subtitle="إدخال رمز التخزين، الباركود، المستودع، ورصيد البداية"
        icon={Plus}
        size="lg"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="التاجر الشريك صاحب البضاعة">
              <select
                value={newItemMerchantId}
                onChange={(e) => setNewItemMerchantId(e.target.value)}
                className={inputClass}
              >
                {state.merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.companyName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="رمز التخزين الفريد (SKU)">
              <input
                type="text"
                required
                placeholder="مثال: ELEC-SPK-01"
                value={newItemSku}
                onChange={(e) => setNewItemSku(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field label="الباركود الدولي (EAN/UPC)">
              <input
                type="text"
                placeholder="اتركه فارغاً للتوليد التلقائي"
                value={newItemBarcode}
                onChange={(e) => setNewItemBarcode(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="اسم الصنف والوصف">
              <input
                type="text"
                required
                placeholder="مثال: سماعة بلوتوث لاسلكية عازلة للضوضاء"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="تصنيف الصنف (Category)">
              <input
                type="text"
                required
                placeholder="مثال: إلكترونيات / ملابس / مستحضرات"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-950/70 border border-white/[0.08]">
            <Field label="المستودع">
              <select
                value={newItemWarehouse}
                onChange={(e) => setNewItemWarehouse(e.target.value)}
                className={inputClass}
              >
                <option value="مستودع 6 أكتوبر الرئيسي">مستودع 6 أكتوبر الرئيسي</option>
                <option value="مستودع العبور اللوجستي">مستودع العبور اللوجستي</option>
                <option value="مستودع الإسكندرية المركزي">مستودع الإسكندرية المركزي</option>
              </select>
            </Field>

            <Field label="المنطقة (Zone)">
              <input
                type="text"
                value={newItemZone}
                onChange={(e) => setNewItemZone(e.target.value)}
                className={inputClass}
                placeholder="A / B / C"
              />
            </Field>

            <Field label="الرف (Shelf)">
              <input
                type="text"
                value={newItemShelf}
                onChange={(e) => setNewItemShelf(e.target.value)}
                className={inputClass}
                placeholder="01"
              />
            </Field>

            <Field label="الخانة (Bin)">
              <input
                type="text"
                value={newItemBin}
                onChange={(e) => setNewItemBin(e.target.value)}
                className={inputClass}
                placeholder="01"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Field label="الرصيد المتاح الأولي (قطع)">
              <input
                type="number"
                min="0"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="حد إعادة الطلب (النواقص)">
              <input
                type="number"
                min="1"
                value={newItemThreshold}
                onChange={(e) => setNewItemThreshold(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="تكلفة الوحدة (ج.م)">
              <input
                type="number"
                step="0.01"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="سعر البيع (ج.م)">
              <input
                type="number"
                step="0.01"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setIsAddItemOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              تأكيد إضافة الصنف
            </Button>
          </div>
        </form>
      </Modal>

      {/* QC Return Inspection Modal */}
      {inspectingReturn && (
        <Modal
          open={!!inspectingReturn}
          onClose={() => setInspectingReturn(null)}
          title={`تقرير فحص الجودة للمرتجع: ${inspectingReturn.returnNumber}`}
          subtitle={`الشحنة ${inspectingReturn.orderNumber} • العميل: ${inspectingReturn.customerName} • الصنف: ${inspectingReturn.itemName} (${inspectingReturn.quantity} قطعة)`}
          icon={ClipboardCheck}
          size="md"
        >
          <form onSubmit={handleConfirmQC} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.08] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">التاجر:</span>
                <strong className="text-white">{inspectingReturn.merchantName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">سبب الإرجاع المسجل:</span>
                <span className="text-orange-400 font-semibold">{inspectingReturn.returnReason}</span>
              </div>
            </div>

            <Field label="قرار فحص الجودة (QC Decision)">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInspectOutcome('RESTOCKED')}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    inspectOutcome === 'RESTOCKED'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                      : 'border-white/[0.08] bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="text-xs text-emerald-400 font-bold mb-1">✓ سليم وقابل لإعادة العرض</div>
                  <div className="text-[11px] text-slate-300">يتم إضافة القطعة فوراً إلى رصيد المتجر المتاح للبيع.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectOutcome('DAMAGED_SCRAPPED')}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    inspectOutcome === 'DAMAGED_SCRAPPED'
                      ? 'border-red-500 bg-red-500/10 text-white font-bold'
                      : 'border-white/[0.08] bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="text-xs text-red-400 font-bold mb-1">✕ تالف ومستبعد (Damaged)</div>
                  <div className="text-[11px] text-slate-300">يتم عزل الصنف وإضافته لرصيد التوالف مع تقرير فني.</div>
                </button>
              </div>
            </Field>

            <Field label="ملاحظات مهندس الفحص الفني">
              <input
                type="text"
                required
                value={inspectNotes}
                onChange={(e) => setInspectNotes(e.target.value)}
                placeholder="مثال: تم فحص غلاف المصنع وسلامة المحتويات"
                className={inputClass}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <Button variant="ghost" onClick={() => setInspectingReturn(null)}>
                إلغاء
              </Button>
              <Button variant="primary" type="submit">
                اعتماد نتيجة الفحص وتحديث الرصيد
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Register New Return Modal */}
      <Modal
        open={isNewReturnOpen}
        onClose={() => setIsNewReturnOpen(false)}
        title="تسجيل مرتجع شحنة جديد"
        subtitle="إدخال بيانات الشحنة المرتجعة وبدء مسار الفحص الفني بالمستودع"
        icon={RotateCcw}
        size="md"
      >
        <form onSubmit={handleCreateReturn} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="رقم الشحنة">
              <input
                type="text"
                required
                placeholder="ORD-2026-8809"
                value={newReturnOrder}
                onChange={(e) => setNewReturnOrder(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="رقم التتبع (Tracking)">
              <input
                type="text"
                required
                placeholder="LTX9842109EGY"
                value={newReturnTracking}
                onChange={(e) => setNewReturnTracking(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="التاجر الشريك">
              <select
                value={newReturnMerchantId}
                onChange={(e) => setNewReturnMerchantId(e.target.value)}
                className={inputClass}
              >
                {state.merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.companyName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="اسم العميل المستلم">
              <input
                type="text"
                required
                placeholder="محمد عادل"
                value={newReturnCustomer}
                onChange={(e) => setNewReturnCustomer(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="رقم هاتف العميل">
              <input
                type="text"
                required
                placeholder="01012345678"
                value={newReturnPhone}
                onChange={(e) => setNewReturnPhone(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="رمز SKU">
              <input
                type="text"
                required
                placeholder="BZ-HOOD-BLK-L"
                value={newReturnSku}
                onChange={(e) => setNewReturnSku(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="اسم الصنف">
              <input
                type="text"
                required
                placeholder="هودي قطن أوفر سايز"
                value={newReturnItemName}
                onChange={(e) => setNewReturnItemName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="الكمية المرتجعة">
              <input
                type="number"
                min="1"
                required
                value={newReturnQty}
                onChange={(e) => setNewReturnQty(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="سبب الإرجاع">
            <input
              type="text"
              required
              value={newReturnReason}
              onChange={(e) => setNewReturnReason(e.target.value)}
              placeholder="مثال: رفض استلام عند المعاينة أو خطأ في المقاس"
              className={inputClass}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setIsNewReturnOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              تسجيل المرتجع
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Stock Transfer Modal */}
      <Modal
        open={isNewTransferOpen}
        onClose={() => setIsNewTransferOpen(false)}
        title="إصدار إذن تحويل بضاعة بين المستودعات"
        subtitle="نقل بضاعة من مستودع إلى مستودع آخر مع تتبع الشاحنة ورقم الإذن"
        icon={ArrowLeftRight}
        size="md"
      >
        <form onSubmit={handleCreateTransfer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="من مستودع (المصدر)">
              <select
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
                className={inputClass}
              >
                <option value="مستودع 6 أكتوبر الرئيسي">مستودع 6 أكتوبر الرئيسي</option>
                <option value="مستودع العبور اللوجستي">مستودع العبور اللوجستي</option>
                <option value="مستودع الإسكندرية المركزي">مستودع الإسكندرية المركزي</option>
              </select>
            </Field>

            <Field label="إلى مستودع (الوجهة)">
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className={inputClass}
              >
                <option value="مستودع العبور اللوجستي">مستودع العبور اللوجستي</option>
                <option value="مستودع 6 أكتوبر الرئيسي">مستودع 6 أكتوبر الرئيسي</option>
                <option value="مستودع الإسكندرية المركزي">مستودع الإسكندرية المركزي</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="التاجر صاحب البضاعة">
              <select
                value={transferMerchantId}
                onChange={(e) => setTransferMerchantId(e.target.value)}
                className={inputClass}
              >
                {state.merchants.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.companyName}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="رمز SKU">
              <input
                type="text"
                required
                placeholder="EP-PWR-20K"
                value={transferSku}
                onChange={(e) => setTransferSku(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field label="الكمية المحولة">
              <input
                type="number"
                min="1"
                required
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="اسم الصنف والوصف">
              <input
                type="text"
                required
                placeholder="باور بانك 20000 مللي أمبير"
                value={transferItemName}
                onChange={(e) => setTransferItemName(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="سائق الشاحنة / وسيلة النقل">
              <input
                type="text"
                required
                placeholder="كابتن النقل الداخلي"
                value={transferDriver}
                onChange={(e) => setTransferDriver(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setIsNewTransferOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              تأكيد إصدار الإذن وبدء النقل
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

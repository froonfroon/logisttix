import { useState } from 'react';
import { Boxes, Search, AlertTriangle, QrCode, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatMoney } from '../../lib/format';
import { Badge, Button, Card, Table, inputClass, rowClass, tdClass } from '../../components/ui';

export function MerchantInventoryPage() {
  const { activeMerchantId } = useAuth();
  const { state } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const merchantItems = state.inventory
    .filter((item) => item.merchantId === activeMerchantId)
    .filter(
      (item) =>
        item.name.includes(searchQuery) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.includes(searchQuery)
    );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-orange-500" />
            <span>منتجات ومخزون المتجر بالمستودع ({merchantItems.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة أرصدة بضاعتك المودعة في مستودعات LogistteX وجاهزيتها للشحن الفوري
          </p>
        </div>

        <Button
          variant="secondary"
          icon={Printer}
          onClick={() => window.print()}
        >
          طباعة باركود المنتجات (Labels)
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3.5 top-3 w-4 h-4 text-orange-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم، كود الصنف SKU، الباركود..."
          className={`${inputClass} pr-10`}
        />
      </div>

      {/* Inventory Table */}
      <Card className="overflow-hidden">
        <Table
          columns={[
            'الصنف والوصف',
            'SKU / الباركود',
            'المستودع وموقع التخزين',
            'الرصيد المتاح للبيع',
            'محجوز لطلبات',
            'الإجمالي',
            'سعر البيع',
            'حالة الصنف',
          ]}
          isEmpty={merchantItems.length === 0}
          empty="لا توجد منتجات مسجلة لهذا المتجر"
        >
          {merchantItems.map((item) => {
            const isLow = item.availableQty <= item.lowStockThreshold;
            const total = item.availableQty + item.reservedQty + item.damagedQty;
            return (
              <tr key={item.id} className={rowClass}>
                <td className={`${tdClass} font-bold text-white`}>
                  {item.name}
                </td>
                <td className={`${tdClass} font-mono`}>
                  <div className="text-orange-400 font-bold">{item.sku}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-slate-500" />
                    {item.barcode}
                  </div>
                </td>
                <td className={tdClass}>
                  <div className="text-slate-200">{item.warehouseName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.zone} • رف {item.shelf} • خانة {item.bin}
                  </div>
                </td>
                <td className={`${tdClass} text-center font-bold text-emerald-400 text-sm`}>
                  {item.availableQty}
                </td>
                <td className={`${tdClass} text-center font-bold text-blue-400`}>
                  {item.reservedQty}
                </td>
                <td className={`${tdClass} text-center font-bold text-white`}>
                  {total}
                </td>
                <td className={`${tdClass} text-center font-mono text-slate-300`}>
                  {formatMoney(item.sellingPrice)}
                </td>
                <td className={`${tdClass} text-center`}>
                  {isLow ? (
                    <Badge tone="amber">
                      <AlertTriangle className="w-3 h-3" />
                      مخزون منخفض
                    </Badge>
                  ) : (
                    <Badge tone="emerald">متوفر</Badge>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

    </div>
  );
}

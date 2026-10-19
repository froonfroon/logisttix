import { useState } from 'react';
import { 
  Users, 
  Phone, 
  Printer, 
  CheckCircle2, 
  Plus, 
  Truck, 
  FileText, 
  DollarSign, 
  Search,
  Calendar
} from 'lucide-react';
import type { DriverManifest } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatMoney } from '../../lib/format';
import { Badge, Button, Card, Tabs, Modal, Field, StatusBadge, inputClass } from '../../components/ui';

const EGYPT_GOVS = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'القليوبية',
  'الشرقية',
  'الدقهلية',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'كفر الشيخ',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
];

export function DriversPage() {
  const { state, addDriver, reconcileManifest } = useData();
  const { can } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'DRIVERS' | 'MANIFESTS'>('DRIVERS');
  const [driverSearch, setDriverSearch] = useState('');

  // Modals state
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [viewingManifest, setViewingManifest] = useState<DriverManifest | null>(null);
  const [reconcilingManifest, setReconcilingManifest] = useState<DriverManifest | null>(null);

  // New Driver Form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('010');
  const [newVehicle, setNewVehicle] = useState('موتوسيكل سريع');
  const [newPlate, setNewPlate] = useState('');
  const [selectedGovs, setSelectedGovs] = useState<string[]>(['القاهرة', 'الجيزة']);

  const toggleGov = (gov: string) => {
    setSelectedGovs((prev) =>
      prev.includes(gov) ? prev.filter((g) => g !== gov) : [...prev, gov]
    );
  };

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGovs.length === 0) {
      toast('اختر محافظة واحدة على الأقل لنطاق تغطية السائق', 'error');
      return;
    }
    const res = addDriver({
      name: newName.trim(),
      phone: newPhone.trim(),
      vehicleType: newVehicle,
      plateNumber: newPlate.trim(),
      status: 'ON_DUTY',
      governorates: selectedGovs,
    });

    if (res.ok) {
      toast(`تم تسجيل السائق ${newName} بنجاح وإضافته إلى قوة الأسطول`);
      setIsAddDriverOpen(false);
      setNewName('');
      setNewPhone('010');
      setNewPlate('');
      setSelectedGovs(['القاهرة', 'الجيزة']);
    } else {
      toast(res.error || 'فشل تسجيل السائق', 'error');
    }
  };

  const handleConfirmReconcile = (manifestId: string) => {
    const res = reconcileManifest(manifestId);
    if (res.ok) {
      toast('تمت مطابقة وإغلاق الكشف اليومي بنجاح وتحويل مستحقات التجار لرصيدهم المتاح');
      setReconcilingManifest(null);
    } else {
      toast(res.error || 'فشلت التسوية والمطابقة', 'error');
    }
  };

  const filteredDrivers = state.drivers.filter(
    (d) =>
      d.name.includes(driverSearch) ||
      d.phone.includes(driverSearch) ||
      d.plateNumber.includes(driverSearch) ||
      d.governorates.some((g) => g.includes(driverSearch))
  );

  return (
    <div className="space-y-6">
      
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <span>السائقون والأسطول وكشوف التوزيع (Fleet & Manifests)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            متابعة خطوط السير اليومية، طباعة كشوف التوزيع (Run Sheets)، ومطابقة النقدية المحصلة (Cash Closure)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs
            value={activeTab}
            onChange={(id) => setActiveTab(id as 'DRIVERS' | 'MANIFESTS')}
            tabs={[
              { id: 'DRIVERS', label: 'سائقي الأسطول', count: state.drivers.length, icon: Users },
              { id: 'MANIFESTS', label: 'كشوف التوزيع اليومية', count: state.manifests.length, icon: FileText },
            ]}
          />

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddDriverOpen(true)}
          >
            إضافة سائق جديد
          </Button>
        </div>
      </div>

      {/* Tab 1: Drivers List */}
      {activeTab === 'DRIVERS' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-orange-500" />
            <input
              type="text"
              value={driverSearch}
              onChange={(e) => setDriverSearch(e.target.value)}
              placeholder="ابحث باسم السائق، الهاتف، رقم اللوحة، أو المحافظة..."
              className={`${inputClass} pr-10`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredDrivers.map((driver) => {
              const assignedCount = state.orders.filter(
                (o) => o.driverId === driver.id && ['OUT_FOR_DELIVERY', 'READY_FOR_DISPATCH'].includes(o.status)
              ).length;
              const deliveredOrders = state.orders.filter(
                (o) => o.driverId === driver.id && o.status === 'DELIVERED'
              );
              const collectedCod = deliveredOrders.reduce((sum, o) => sum + o.codAmount, 0);

              return (
                <Card
                  key={driver.id}
                  className="p-5 hover:border-orange-500/40 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{driver.name}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="text-xs text-slate-300 font-mono flex items-center gap-1 mt-1">
                          <Phone className="w-3.5 h-3.5 text-orange-500" />
                          <span>{driver.phone}</span>
                        </div>
                      </div>
                      <Badge tone={driver.status === 'ON_DUTY' ? 'emerald' : 'slate'}>
                        {driver.status === 'ON_DUTY' ? 'في الوردية الآن' : 'متاح'}
                      </Badge>
                    </div>

                    <div className="driver-vehicle-box p-3 rounded-xl bg-slate-950/70 border border-white/[0.08] text-xs space-y-2">
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">نوع المركبة:</span>
                        <span className="font-semibold text-white flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-orange-400" /> {driver.vehicleType}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-400">رقم اللوحة:</span>
                        <span className="font-bold text-orange-400 font-mono">{driver.plateNumber}</span>
                      </div>
                      <div className="pt-1 border-t border-white/[0.06]">
                        <span className="text-slate-400 block text-[11px] mb-1">نطاق المحافظات المغطاة:</span>
                        <div className="flex flex-wrap gap-1">
                          {driver.governorates.map((g) => (
                            <span key={g} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-semibold border border-white/5">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="driver-metric-box p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.08]">
                        <div className="text-slate-400 text-[10px]">شحنات اليوم المسندة</div>
                        <div className="text-base font-black text-orange-400 font-mono mt-0.5">
                          {assignedCount}
                        </div>
                      </div>
                      <div className="driver-metric-box p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.08]">
                        <div className="text-slate-400 text-[10px]">نقدية COD المحصلة اليوم</div>
                        <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                          {formatMoney(collectedCod)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06]">
                    <div className="flex justify-between items-center text-xs text-slate-300">
                      <span>إجمالي الطرود المسلمة تاريخياً:</span>
                      <strong className="text-white font-mono font-bold">{driver.totalDelivered} طرد</strong>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Manifests List (Card Grid) */}
      {activeTab === 'MANIFESTS' && (
        <div className="space-y-4">
          {state.manifests.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-12 h-12 mx-auto text-slate-500 opacity-60" />
              <p className="font-bold text-sm text-slate-200">لا توجد كشوف توزيع مسجلة حالياً</p>
              <p className="text-xs text-slate-400">يتم إنشاء كشوف التوزيع تلقائياً عند إسناد الشحنات للسائقين من صفحة الطلبات.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.manifests.map((mnf) => {
                const driver = state.drivers.find((d) => d.id === mnf.driverId);
                const manifestOrders = state.orders.filter((o) => mnf.orderIds.includes(o.id));
                const totalCount = manifestOrders.length;
                const deliveredCount = manifestOrders.filter((o) => o.status === 'DELIVERED').length;
                const remainingCount = totalCount - deliveredCount;
                const totalCodAmount = manifestOrders.reduce((acc, o) => acc + o.codAmount, 0);
                const collectedAmount = manifestOrders
                  .filter((o) => o.status === 'DELIVERED')
                  .reduce((acc, o) => acc + o.codAmount, 0);

                const canReconcile = mnf.status === 'DISPATCHED' && can('drivers.cash_close');
                const completionPercent = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0;

                return (
                  <Card
                    key={mnf.id}
                    className="p-5 hover:border-orange-500/40 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      {/* Header: Number, Date, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                              <FileText className="w-4 h-4" />
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewingManifest(mnf)}
                              className="font-mono font-bold text-sm text-white hover:text-orange-500 transition-colors text-right cursor-pointer"
                            >
                              {mnf.manifestNumber}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{mnf.date}</span>
                          </div>
                        </div>

                        <Badge tone={mnf.status === 'RECONCILED' ? 'emerald' : 'orange'}>
                          {mnf.status === 'RECONCILED' ? 'تمت المطابقة والإغلاق' : 'قيد التوزيع والتسليم'}
                        </Badge>
                      </div>

                      {/* Driver Information Tile */}
                      <div className="driver-vehicle-box p-3 rounded-xl bg-slate-950/70 border border-white/[0.08] text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 rounded-lg bg-white/5 text-orange-400">
                            <Truck className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-slate-400 block text-[10px]">السائق المكلف بالخط:</span>
                            <span className="font-bold text-white text-xs">{driver?.name || 'سائق غير محدد'}</span>
                          </div>
                        </div>
                        {driver?.phone && (
                          <a
                            href={`tel:${driver.phone}`}
                            className="flex items-center gap-1 text-[11px] font-mono text-slate-300 hover:text-orange-500 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-orange-500" />
                            <span>{driver.phone}</span>
                          </a>
                        )}
                      </div>

                      {/* Delivery Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">معدل الإنجاز والتسليم:</span>
                          <span className="font-mono text-xs">
                            <strong className="text-emerald-500">{deliveredCount} تم</strong>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-slate-300">{totalCount} طرد</span>
                            {remainingCount > 0 && (
                              <span className="text-amber-500 text-[11px] mr-1">({remainingCount} متبقي)</span>
                            )}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Expected COD vs Actual Collected */}
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="driver-metric-box p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.08]">
                          <div className="text-slate-400 text-[10px] font-semibold">إجمالي COD المتوقع</div>
                          <div className="text-sm font-bold text-slate-200 font-mono mt-0.5">
                            {formatMoney(totalCodAmount)}
                          </div>
                        </div>
                        <div className="driver-metric-box p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.08]">
                          <div className="text-slate-400 text-[10px] font-semibold">المحصل الفعلي (COD)</div>
                          <div className="text-sm font-black text-emerald-500 font-mono mt-0.5">
                            {formatMoney(collectedAmount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Printer}
                        onClick={() => setViewingManifest(mnf)}
                        className="flex-1 justify-center text-xs"
                      >
                        معاينة وطباعة الكشف
                      </Button>
                      {canReconcile && (
                        <Button
                          size="sm"
                          variant="success"
                          icon={CheckCircle2}
                          onClick={() => setReconcilingManifest(mnf)}
                          className="flex-1 justify-center text-xs"
                        >
                          مطابقة العهدة
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODAL 1: ADD NEW DRIVER ---------------- */}
      <Modal
        open={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
        title="تسجيل سائق أسطول جديد"
        subtitle="إدخال بيانات السائق، نوع المركبة، رقم اللوحة المعدنية، ونطاق تغطية المحافظات"
        icon={Truck}
        size="md"
      >
        <form onSubmit={handleCreateDriver} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسم السائق الثلاثي">
              <input
                type="text"
                required
                placeholder="مثال: حسام الدين عبد الله"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="رقم الهاتف المحمول والواتساب">
              <input
                type="text"
                required
                placeholder="010xxxxxxxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="نوع المركبة المستخدمة">
              <select
                value={newVehicle}
                onChange={(e) => setNewVehicle(e.target.value)}
                className={inputClass}
              >
                <option value="موتوسيكل سريع">موتوسيكل سريع (دراجة نارية)</option>
                <option value="سيارة فان مقفلة">سيارة فان مقفلة (حمولة حتى 800 كجم)</option>
                <option value="سيارة نقل جامبو">سيارة نقل جامبو (حمولة طرود كبرى)</option>
                <option value="سيارة ركوب خاصة">سيارة ركوب ملاكي خاصة</option>
              </select>
            </Field>

            <Field label="رقم اللوحة المعدنية">
              <input
                type="text"
                required
                placeholder="مثال: أ ب ج 5482"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              المحافظات المسندة للتوزيع ({selectedGovs.length} محددة):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-white/[0.08]">
              {EGYPT_GOVS.map((gov) => {
                const isSelected = selectedGovs.includes(gov);
                return (
                  <button
                    key={gov}
                    type="button"
                    onClick={() => toggleGov(gov)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-right transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{gov}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setIsAddDriverOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              تأكيد تسجيل السائق
            </Button>
          </div>
        </form>
      </Modal>

      {/* ---------------- MODAL 2: PRINT MANIFEST RUN SHEET ---------------- */}
      {viewingManifest && (() => {
        const driver = state.drivers.find((d) => d.id === viewingManifest.driverId);
        const manifestOrders = state.orders.filter((o) => viewingManifest.orderIds.includes(o.id));
        const totalCod = manifestOrders.reduce((sum, o) => sum + o.codAmount, 0);

        return (
          <Modal
            open={!!viewingManifest}
            onClose={() => setViewingManifest(null)}
            title={`كشف تسليمات وتوزيع السائق: ${viewingManifest.manifestNumber}`}
            subtitle={`السائق: ${driver?.name} • المركبة: ${driver?.vehicleType} (${driver?.plateNumber}) • التاريخ: ${viewingManifest.date}`}
            icon={FileText}
            size="xl"
            footer={
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-slate-400">
                  إجمالي الطرود: <strong className="text-white font-mono">{manifestOrders.length}</strong> • إجمالي التحصيل: <strong className="text-orange-400 font-mono">{formatMoney(totalCod)}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setViewingManifest(null)}>
                    إغلاق
                  </Button>
                  <Button
                    variant="primary"
                    icon={Printer}
                    onClick={() => window.print()}
                  >
                    طباعة كشف التوزيع الرسمي
                  </Button>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              
              {/* Official Header Badge */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.08] flex flex-wrap justify-between items-center gap-4 text-xs">
                <div>
                  <div className="text-slate-400">كشف تسليمات أسطول الشحن (Driver Run Sheet)</div>
                  <div className="text-base font-black text-white font-mono mt-0.5">{viewingManifest.manifestNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400">اسم المندوب:</div>
                  <div className="text-white font-bold mt-0.5">{driver?.name} ({driver?.phone})</div>
                </div>
                <div>
                  <div className="text-slate-400">المركبة واللوحة:</div>
                  <div className="text-orange-400 font-bold mt-0.5">{driver?.vehicleType} • {driver?.plateNumber}</div>
                </div>
                <div>
                  <div className="text-slate-400">تاريخ الكشف:</div>
                  <div className="text-white font-mono mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" /> {viewingManifest.date}
                  </div>
                </div>
              </div>

              {/* Parcels List Table */}
              <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-[#0B1953]/50 text-slate-300 border-b border-white/[0.08]">
                    <tr>
                      <th className="p-3 w-8 text-center">#</th>
                      <th className="p-3">رقم الشحنة والتتبع</th>
                      <th className="p-3">اسم المستلم والهاتف</th>
                      <th className="p-3">العنوان والمحافظة</th>
                      <th className="p-3 text-center">المطلوب تحصيله (COD)</th>
                      <th className="p-3 text-center">الحالة</th>
                      <th className="p-3 text-center w-28">توقيع المستلم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {manifestOrders.map((o, idx) => (
                      <tr key={o.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{o.orderNumber}</div>
                          <div className="font-mono text-orange-400 text-[10px]">{o.trackingNumber}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{o.customerName}</div>
                          <div className="font-mono text-slate-300 text-[11px]">{o.customerPhone}</div>
                        </td>
                        <td className="p-3 text-slate-300">
                          <div>{o.governorate} - {o.city}</div>
                          <div className="text-slate-400 text-[11px] truncate max-w-xs">{o.address}</div>
                        </td>
                        <td className="p-3 text-center font-mono font-black text-orange-400 text-sm">
                          {formatMoney(o.codAmount)}
                        </td>
                        <td className="p-3 text-center">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="p-3 text-center border-r border-white/5">
                          <div className="h-7 border-b border-dashed border-slate-600"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Run Sheet Signatures Footer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/[0.08] grid grid-cols-2 gap-6 text-xs text-slate-400 pt-4">
                <div>
                  <span>إقرار استلام العهدة وتوقيع المندوب:</span>
                  <div className="mt-4 border-b border-white/20 pb-1 text-white font-semibold">
                    {driver?.name} ____________________
                  </div>
                </div>
                <div>
                  <span>اعتماد مشرف الحركة والتشغيل:</span>
                  <div className="mt-4 border-b border-white/20 pb-1 text-white font-semibold">
                    مشرف الوردية ____________________
                  </div>
                </div>
              </div>

            </div>
          </Modal>
        );
      })()}

      {/* ---------------- MODAL 3: RECONCILE CASH SETTLEMENT ---------------- */}
      {reconcilingManifest && (() => {
        const driver = state.drivers.find((d) => d.id === reconcilingManifest.driverId);
        const manifestOrders = state.orders.filter((o) => reconcilingManifest.orderIds.includes(o.id));
        const deliveredOrders = manifestOrders.filter((o) => o.status === 'DELIVERED');
        const collectedAmount = deliveredOrders.reduce((sum, o) => sum + o.codAmount, 0);
        const totalExpected = manifestOrders.reduce((sum, o) => sum + o.codAmount, 0);

        return (
          <Modal
            open={!!reconcilingManifest}
            onClose={() => setReconcilingManifest(null)}
            title="تسوية ومطابقة العهدة النقدية للمندوب (Cash Closure)"
            subtitle={`مطابقة مبالغ الدفع عند الاستلام للكشف ${reconcilingManifest.manifestNumber} وإيداعها في الخزينة`}
            icon={DollarSign}
            size="md"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0B1953]/40 border border-white/[0.08] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">اسم المندوب:</span>
                  <strong className="text-white">{driver?.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">إجمالي شحنات الكشف:</span>
                  <strong className="text-white font-mono">{manifestOrders.length} شحنة</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الشحنات المسلمة بنجاح:</span>
                  <strong className="text-emerald-400 font-mono font-bold">{deliveredOrders.length} شحنة</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الشحنات المتبقية أو المؤجلة:</span>
                  <strong className="text-orange-400 font-mono">{manifestOrders.length - deliveredOrders.length} شحنة</strong>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 rounded-xl bg-slate-950 border border-white/[0.08]">
                  <span className="text-[11px] text-slate-400 block">إجمالي COD المتوقع</span>
                  <div className="text-lg font-black text-slate-300 font-mono mt-1">
                    {formatMoney(totalExpected)}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-300 block font-semibold">النقدية المحصلة الفعلية</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                    {formatMoney(collectedAmount)}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 space-y-1">
                <div className="font-bold">أثر تأكيد المطابقة والإغلاق:</div>
                <div>1. تحويل مستحقات الشحنات المسلمة تلقائياً من الرصيد المعلق إلى الرصيد المتاح للتاجر.</div>
                <div>2. إثبات استلام النقدية المحصلة في حساب الخزينة الرئيسي وإصدار قيد محاسبي.</div>
                <div>3. تغيير حالة الكشف إلى (تمت المطابقة والإغلاق).</div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <Button variant="ghost" onClick={() => setReconcilingManifest(null)}>
                  إلغاء
                </Button>
                <Button
                  variant="success"
                  icon={CheckCircle2}
                  onClick={() => handleConfirmReconcile(reconcilingManifest.id)}
                >
                  تأكيد استلام النقدية وإغلاق الكشف
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}

    </div>
  );
}

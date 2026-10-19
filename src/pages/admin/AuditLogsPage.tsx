import { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  AlertOctagon,
  User,
  ArrowUpDown
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { downloadCsv } from '../../lib/format';
import { Button, Card, Table, rowClass, tdClass } from '../../components/ui';

export function AuditLogsPage() {
  const { state } = useData();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return state.auditLogs.filter((log) => {
      if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
      if (actionFilter !== 'ALL' && log.actionType !== actionFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          log.actorName.toLowerCase().includes(q) ||
          log.actorRole.toLowerCase().includes(q) ||
          log.resourceId.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [state.auditLogs, severityFilter, actionFilter, search]);

  const criticalCount = state.auditLogs.filter((l) => l.severity === 'CRITICAL').length;
  const warningCount = state.auditLogs.filter((l) => l.severity === 'WARNING').length;
  const infoCount = state.auditLogs.filter((l) => l.severity === 'INFO').length;

  const handleExportCsv = () => {
    const headers = ['المعرف', 'نوع الإجراء', 'المسؤول', 'الدور الوظيفي', 'المورد', 'التفاصيل', 'الأهمية', 'التوقيت', 'عنوان IP'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.actionType,
      l.actorName,
      l.actorRole,
      l.resourceId,
      l.details,
      l.severity,
      l.timestamp,
      l.ipAddress || 'داخلي',
    ]);
    downloadCsv('System_Audit_Trail.csv', headers, rows);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <span>سجل الرقابة والتدقيق الشامل (Enterprise Audit Trail)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            رصد زمني فوري لكافة التعديلات الإدارية، الحركات المالية، قرارات الصرف، وتغيرات حالات المخزون والشحنات.
          </p>
        </div>

        <Button
          variant="secondary"
          icon={Download}
          onClick={handleExportCsv}
        >
          تصدير سجل الرقابة (CSV)
        </Button>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">إجمالي الحركات المسجلة</div>
            <div className="text-2xl font-black text-white font-mono mt-1">{state.auditLogs.length}</div>
          </div>
          <span className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
            <ArrowUpDown className="w-5 h-5" />
          </span>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">عمليات أمنية حرجة (Critical)</div>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">{criticalCount}</div>
          </div>
          <span className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
            <AlertOctagon className="w-5 h-5" />
          </span>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">تنبيهات مالية وإدارية (Warning)</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">{warningCount}</div>
          </div>
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </span>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">إجراءات تشغيلية اعتيادية (Info)</div>
            <div className="text-2xl font-black text-blue-400 font-mono mt-1">{infoCount}</div>
          </div>
          <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Info className="w-5 h-5" />
          </span>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في سجل العمليات باسم الموظف، المورد، أو نص الإجراء..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#070D1F] border border-white/[0.08] rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Severity selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="rounded-xl border border-white/[0.08] bg-[#070D1F] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-orange-500 focus:outline-none"
            >
              <option value="ALL">كافة مستويات الأهمية</option>
              <option value="CRITICAL">حرجة (Critical) فقط</option>
              <option value="WARNING">تنبيهات (Warning) فقط</option>
              <option value="INFO">اعتيادية (Info) فقط</option>
            </select>
          </div>

          {/* Action type selector */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[#070D1F] px-3 py-2 text-xs font-semibold text-slate-200 focus:border-orange-500 focus:outline-none"
          >
            <option value="ALL">كافة أنواع العمليات</option>
            <option value="ORDER_STATUS_CHANGE">تغيير حالة شحنة</option>
            <option value="ORDER_CREATE">إنشاء طلب جديد</option>
            <option value="PAYOUT_APPROVE">اعتماد سحب أرباح</option>
            <option value="PAYOUT_DISBURSE">صرف وتحويل بنكي</option>
            <option value="MANIFEST_RECONCILE">إغلاق كشف مندوب</option>
            <option value="INBOUND_RECEIPT">استلام مخزن WMS</option>
            <option value="STOCK_ADJUSTMENT">تعديل جرد يدوي</option>
            <option value="ROLE_PERMISSION_UPDATE">تعديل صلاحيات أمنية</option>
            <option value="EXPENSE_RECORD">تسجيل مصروفات</option>
          </select>

        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden">
        <Table
          columns={[
            'التوقيت والـ IP',
            'المسؤول والدور الوظيفي',
            'نوع العملية',
            'المورد المرتبط',
            'التفاصيل التشغيلية',
            'مستوى الأهمية'
          ]}
          isEmpty={filteredLogs.length === 0}
          empty="لا توجد سجلات تدقيق مطابقة لمعايير البحث الحالية"
        >
          {filteredLogs.map((log) => {
            return (
              <tr key={log.id} className={rowClass}>
                <td className={tdClass}>
                  <div className="font-mono text-white text-xs font-semibold">{log.timestamp}</div>
                  <div className="font-mono text-[10px] text-slate-500">{log.ipAddress || 'داخلي (Intranet)'}</div>
                </td>

                <td className={tdClass}>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-400" />
                    <span>{log.actorName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{log.actorRole}</div>
                </td>

                <td className={tdClass}>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-slate-300">
                    {log.actionType}
                  </span>
                </td>

                <td className={tdClass}>
                  <div className="font-mono font-bold text-orange-400 text-xs">{log.resourceId}</div>
                  <div className="text-[10px] text-slate-500">{log.resourceType}</div>
                </td>

                <td className={tdClass}>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-md">{log.details}</p>
                </td>

                <td className={tdClass}>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    log.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                    log.severity === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                    'bg-sky-500/10 border-sky-500/30 text-sky-300'
                  }`}>
                    {log.severity === 'CRITICAL' && <AlertOctagon className="w-3 h-3" />}
                    {log.severity === 'WARNING' && <AlertTriangle className="w-3 h-3" />}
                    {log.severity === 'INFO' && <CheckCircle2 className="w-3 h-3" />}
                    {log.severity}
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

    </div>
  );
}

import { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Trash2, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import type { MerchantTeamMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Badge, Button, Card, StatCard, Table, Modal, Field, inputClass, rowClass, tdClass } from '../../components/ui';

export function MerchantTeamPage() {
  const { activeMerchantId } = useAuth();
  const { state, addMerchantTeamMember, removeMerchantTeamMember } = useData();
  const toast = useToast();

  const merchant = state.merchants.find((m) => m.id === activeMerchantId) || state.merchants[0];
  const members = state.merchantTeam.filter((m) => m.merchantId === (merchant?.id || activeMerchantId));

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('010');
  const [role, setRole] = useState<MerchantTeamMember['role']>('Staff');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant) return;

    const res = addMerchantTeamMember({
      merchantId: merchant.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status: 'ACTIVE',
    });

    if (res.ok) {
      toast('تمت إضافة عضو الفريق وتفعيل صلاحيات الدخول بنجاح');
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('010');
      setRole('Staff');
    } else {
      toast(res.error || 'فشل إضافة العضو', 'error');
    }
  };

  const handleRemoveMember = (id: string, memberName: string) => {
    if (confirm(`هل أنت متأكد من حذف ${memberName} من فريق العمل وسحب صلاحياته؟`)) {
      const res = removeMerchantTeamMember(id);
      if (res.ok) {
        toast(`تم حذف ${memberName} من الفريق بنجاح`);
      } else {
        toast(res.error || 'فشل حذف العضو', 'error');
      }
    }
  };

  const roleBadgeTone = (r: MerchantTeamMember['role']) => {
    switch (r) {
      case 'Owner':
        return 'orange';
      case 'Admin':
        return 'blue';
      case 'Accountant':
        return 'emerald';
      case 'Warehouse Viewer':
        return 'amber';
      default:
        return 'slate';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <span>إدارة فريق العمل والصلاحيات (Merchant Team & RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            إضافة وتعيين أدوار موظفي المتجر (مالك، مدير، محاسب، موظف تشغيل، مراقب مستودع) مع تقييد الوصول لكل شاشة.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة عضو جديد للفريق</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي أعضاء الفريق"
          value={`${members.length} عضو`}
          hint="حسابات وصول مخصصة للمتجر"
          icon={Users}
          tone="orange"
        />
        <StatCard
          label="الملاك والمدراء"
          value={`${members.filter((m) => m.role === 'Owner' || m.role === 'Admin').length}`}
          hint="صلاحيات إدارة تشغيلية وتنفيذية"
          icon={ShieldCheck}
          tone="blue"
        />
        <StatCard
          label="الحسابات والمالية"
          value={`${members.filter((m) => m.role === 'Accountant').length}`}
          hint="متابعة الفواتير ومطالبات السحب"
          icon={Lock}
          tone="emerald"
        />
        <StatCard
          label="حالة الحسابات"
          value={`${members.filter((m) => m.status === 'ACTIVE').length} نشط`}
          hint="جميع الحسابات مصرح لها بالدخول"
          icon={CheckCircle2}
          tone="slate"
        />
      </div>

      {/* Role Definitions Guide Card */}
      <Card className="p-4 border-white/[0.08] bg-white/[0.01]">
        <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-orange-400" />
          <span>مصفوفة الأدوار وصلاحيات الوصول للمتجر (Access Control Guide)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <span className="font-bold text-orange-400 block mb-1">المالك (Owner)</span>
            <span className="text-[11px] text-slate-300">تحكم كامل، سحب أرباح، توقيع فواتير، وإدارة الفريق.</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="font-bold text-blue-400 block mb-1">المدير (Admin)</span>
            <span className="text-[11px] text-slate-300">إدارة الشحنات، التوريد، التنازلات، والاطلاع على التقارير.</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="font-bold text-emerald-400 block mb-1">المحاسب (Accountant)</span>
            <span className="text-[11px] text-slate-300">مطالعة الفواتير الدورية، كشف الحساب، والتحصيلات.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <span className="font-bold text-slate-300 block mb-1">موظف (Staff)</span>
            <span className="text-[11px] text-slate-400">إنشاء ومتابعة شحنات العملاء فقط دون صلاحيات مالية.</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="font-bold text-amber-400 block mb-1">المستودع (Warehouse)</span>
            <span className="text-[11px] text-slate-300">جرد المخزون، طلبات التوريد، ومتابعة فحص المرتجعات QC.</span>
          </div>
        </div>
      </Card>

      {/* Team Members Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">قائمة الموظفين والمستخدمين المعتمدين لمتجر {merchant?.companyName}</h2>
            <p className="text-xs text-slate-400">يمكنك سحب الصلاحية أو إضافة أعضاء جدد في أي وقت</p>
          </div>
          <Badge tone="orange">
            {members.length} أعضاء مسجلين
          </Badge>
        </div>

        <Table
          columns={[
            'اسم العضو',
            'البريد الإلكتروني',
            'رقم الهاتف',
            'الدور والصلاحية',
            'تاريخ الانضمام',
            'حالة الحساب',
            'إجراءات',
          ]}
          isEmpty={members.length === 0}
        >
          {members.map((member) => (
            <tr key={member.id} className={rowClass}>
              <td className={`${tdClass} font-bold text-white`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-orange-400">
                    {member.name.slice(0, 1)}
                  </div>
                  <span>{member.name}</span>
                </div>
              </td>
              <td className={`${tdClass} font-mono text-xs text-slate-300`}>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{member.email}</span>
                </div>
              </td>
              <td className={`${tdClass} font-mono text-xs text-slate-300`}>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span dir="ltr">{member.phone}</span>
                </div>
              </td>
              <td className={tdClass}>
                <Badge tone={roleBadgeTone(member.role)}>
                  {member.role === 'Owner' ? 'مالك الحساب الرئيسي' :
                   member.role === 'Admin' ? 'مدير عمليات' :
                   member.role === 'Accountant' ? 'مسؤول مالي ومحاسب' :
                   member.role === 'Warehouse Viewer' ? 'مراقب مخزون WMS' : 'موظف تشغيل شحنات'}
                </Badge>
              </td>
              <td className={`${tdClass} font-mono text-xs text-slate-400`}>
                {member.createdAt}
              </td>
              <td className={tdClass}>
                <Badge tone={member.status === 'ACTIVE' ? 'emerald' : 'red'}>
                  {member.status === 'ACTIVE' ? 'مفعل ونشط' : 'معطل'}
                </Badge>
              </td>
              <td className={tdClass}>
                {member.role !== 'Owner' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </Button>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">الحساب الأساسي</span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Add Team Member Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة مستخدم جديد لفريق المتجر"
        subtitle="سيتم إرسال بيانات الدخول وتفعيل الدور المحدد فور الحفظ"
        icon={UserPlus}
        size="md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <Field label="اسم الموظف / العضو">
            <input
              type="text"
              required
              placeholder="مثال: أحمد عبد الله"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="البريد الإلكتروني المهني">
              <input
                type="email"
                required
                placeholder="ahmed@merchant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>

            <Field label="رقم هاتف التواصل">
              <input
                type="text"
                required
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>

          <Field label="الدور والصلاحيات الوظيفية">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MerchantTeamMember['role'])}
              className={inputClass}
            >
              <option value="Admin">مدير عمليات (Admin) — إدارة شاملة للشحنات والمخزون</option>
              <option value="Staff">موظف تشغيل (Staff) — إدخال بوالص وتتبع الشحنات فقط</option>
              <option value="Accountant">محاسب (Accountant) — استعراض الفواتير والتحصيلات</option>
              <option value="Warehouse Viewer">مراقب مخزون (Warehouse Viewer) — جرد وطلبات التوريد</option>
            </select>
          </Field>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" variant="primary">
              إضافة وتفعيل العضو
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

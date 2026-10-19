import { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  Save, 
  Users, 
  Plus, 
  UserCheck, 
  Mail, 
  Phone, 
  Building2,
  Trash2
} from 'lucide-react';
import { SYSTEM_PERMISSIONS } from '../../data/permissionsList';
import { ADMIN_ROLE_PERMISSIONS, ADMIN_ROLE_LABEL } from '../../context/AuthContext';
import { Badge, Button, Card, Modal, Field, Tabs, inputClass } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import type { AdminRole } from '../../types';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: AdminRole;
  department: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'u-1',
    name: 'م. طارق المنشاوي',
    email: 'tarek.m@logisttex.com',
    phone: '01099234811',
    role: 'SUPER_ADMIN',
    department: 'الإدارة العليا والتطوير',
    status: 'ACTIVE',
    createdAt: '2026-01-15',
  },
  {
    id: 'u-2',
    name: 'كابتن إبراهيم فؤاد',
    email: 'ibrahim.ops@logisttex.com',
    phone: '01284729104',
    role: 'OPERATIONS',
    department: 'العمليات والتوزيع الميداني',
    status: 'ACTIVE',
    createdAt: '2026-02-01',
  },
  {
    id: 'u-3',
    name: 'م. سامح زهران',
    email: 'sameh.wms@logisttex.com',
    phone: '01198302911',
    role: 'WAREHOUSE_MGR',
    department: 'إدارة المستودعات وسلاسل الإمداد',
    status: 'ACTIVE',
    createdAt: '2026-02-10',
  },
  {
    id: 'u-4',
    name: 'أ. مصطفى الشامي',
    email: 'mostafa.fin@logisttex.com',
    phone: '01582049182',
    role: 'FINANCE_HEAD',
    department: 'الرقابة المالية والخزينة',
    status: 'ACTIVE',
    createdAt: '2026-02-15',
  },
  {
    id: 'u-5',
    name: 'سارة محمود',
    email: 'sara.care@logisttex.com',
    phone: '01048291039',
    role: 'OPERATIONS',
    department: 'خدمة العملاء وتتبع الشحنات',
    status: 'ACTIVE',
    createdAt: '2026-03-01',
  },
];

export function RolesSettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'PERMISSIONS' | 'STAFF'>('PERMISSIONS');
  const [activeRole, setActiveRole] = useState<AdminRole>('OPERATIONS');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    ADMIN_ROLE_PERMISSIONS.OPERATIONS
  );

  // Staff Management State
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('010');
  const [userRole, setUserRole] = useState<AdminRole>('OPERATIONS');
  const [userDept, setUserDept] = useState('العمليات والتشغيل');

  const rolesList: { id: AdminRole; desc: string }[] = [
    { id: 'SUPER_ADMIN', desc: 'وصول شامل لكافة الـ 164 مفتاح صلاحية' },
    { id: 'OPERATIONS', desc: 'الطلبات، الشحنات، وكشوف المناديب' },
    { id: 'WAREHOUSE_MGR', desc: 'الجرد، الاستلام، وأذونات السحب' },
    { id: 'FINANCE_HEAD', desc: 'الخزينة، المحافظ، وصرف الأرباح' },
  ];

  // Group permissions by module
  const groupedPermissions = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.moduleNameAr]) {
      acc[perm.moduleNameAr] = [];
    }
    acc[perm.moduleNameAr].push(perm);
    return acc;
  }, {} as Record<string, typeof SYSTEM_PERMISSIONS>);

  const handleSelectRole = (role: AdminRole) => {
    setActiveRole(role);
    setSelectedPermissions(ADMIN_ROLE_PERMISSIONS[role]);
  };

  const handleTogglePerm = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleToggleGroup = (moduleName: string) => {
    const groupKeys = groupedPermissions[moduleName].map((p) => p.key);
    const allSelected = groupKeys.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !groupKeys.includes(k)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...groupKeys])));
    }
  };

  const handleSave = () => {
    toast(`تم حفظ وتحديث مصفوفة صلاحيات ${ADMIN_ROLE_LABEL[activeRole]} بنجاح (${selectedPermissions.length} مفتاح مفعّل)`);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast('يرجى كتابة الاسم والبريد الإلكتروني للموظف', 'error');
      return;
    }
    const newUser: StaffUser = {
      id: `u-${Date.now()}`,
      name: userName.trim(),
      email: userEmail.trim(),
      phone: userPhone.trim(),
      role: userRole,
      department: userDept.trim(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setStaffList([newUser, ...staffList]);
    toast(`تم إنشاء حساب الموظف ${userName} وتعيين دور (${ADMIN_ROLE_LABEL[userRole]}) بنجاح`);
    setIsAddUserOpen(false);
    setUserName('');
    setUserEmail('');
    setUserPhone('010');
  };

  const handleDeleteStaff = (id: string, name: string) => {
    setStaffList(staffList.filter((s) => s.id !== id));
    toast(`تم تعطيل وحذف حساب الموظف ${name}`, 'error');
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20 shadow-lg shadow-orange-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white">مصفوفة الأدوار وفريق العمل (RBAC & Staff Users)</h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[11px] font-mono font-bold text-orange-400">
                RBAC 164 KEYS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              التحكم الدقيق بـ 164 مفتاح صلاحية، بوابات الوصول، وإدارة حسابات الموظفين الداخليين
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {activeTab === 'PERMISSIONS' ? (
            <Button
              variant="primary"
              icon={Save}
              size="sm"
              onClick={handleSave}
            >
              حفظ صلاحيات الدور
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Plus}
              size="sm"
              onClick={() => setIsAddUserOpen(true)}
            >
              إضافة موظف جديد
            </Button>
          )}
        </div>
      </div>

      {/* Dedicated Executive Full-Width Tab Bar */}
      <Tabs
        value={activeTab}
        onChange={(id) => setActiveTab(id as 'PERMISSIONS' | 'STAFF')}
        tabs={[
          { id: 'PERMISSIONS', label: 'مصفوفة الـ 164 مفتاح صلاحية', icon: ShieldCheck },
          { id: 'STAFF', label: 'فريق العمل وموظفي النظام', count: staffList.length, icon: Users },
        ]}
      />

      {/* TAB 1: PERMISSIONS MATRIX */}
      {activeTab === 'PERMISSIONS' && (
        <div className="space-y-6">
          {/* Role Picker Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rolesList.map((role) => (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                  activeRole === role.id
                    ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                    : 'border-white/[0.08] bg-[#0A1228]/80 hover:border-white/20'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{ADMIN_ROLE_LABEL[role.id]}</span>
                  {activeRole === role.id && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </div>
                <div className="text-[11px] text-slate-300 mt-1">{role.desc}</div>
              </div>
            ))}
          </div>

          {/* Permissions Matrix Groups */}
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
              const groupKeys = perms.map((p) => p.key);
              const selectedInGroup = groupKeys.filter((k) => selectedPermissions.includes(k)).length;
              const isAllSelected = selectedInGroup === groupKeys.length;

              return (
                <Card key={moduleName} className="overflow-hidden">
                  
                  {/* Group Header */}
                  <div className="p-4 bg-slate-950/80 border-b border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">{moduleName}</h3>
                        <p className="text-[11px] text-slate-300">
                          مفعل: {selectedInGroup} من أصل {perms.length} مفتاح صلاحية
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleGroup(moduleName)}
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 cursor-pointer"
                    >
                      {isAllSelected ? 'إلغاء تحديد الكل' : 'تحديد كافة صلاحيات الوحدة'}
                    </button>
                  </div>

                  {/* Group Items Grid */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((p) => {
                      const isChecked = selectedPermissions.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className={`permission-checkbox-card flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'permission-checkbox-card-checked bg-slate-900/95 border-orange-500/50 shadow-sm'
                              : 'bg-[#060B19]/60 border-white/[0.06] hover:border-white/10'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePerm(p.key)}
                            className="mt-0.5 rounded bg-slate-900 border-slate-700 text-orange-500 focus:ring-0 cursor-pointer w-4 h-4"
                          />
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-white">{p.nameAr}</div>
                            <div className="text-[10px] font-mono text-orange-400/90 font-semibold">{p.key}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & INTERNAL USERS */}
      {activeTab === 'STAFF' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staffList.map((staff) => (
              <Card key={staff.id} className="p-5 space-y-4 flex flex-col justify-between hover:border-orange-500/30 transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-orange-500" />
                        <span>{staff.name}</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 flex items-center gap-1 font-mono">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.email}</span>
                      </div>
                    </div>
                    <Badge tone={staff.role === 'SUPER_ADMIN' ? 'red' : staff.role === 'FINANCE_HEAD' ? 'amber' : 'blue'}>
                      {ADMIN_ROLE_LABEL[staff.role]}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/[0.08] text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">الإدارة والقسم:</span>
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-orange-400" /> {staff.department}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">رقم الهاتف:</span>
                      <span className="font-mono text-white flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" /> {staff.phone}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">تاريخ التعيين:</span>
                      <span className="font-mono text-slate-300">{staff.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    حساب نشط ومصرح له
                  </span>

                  {staff.role !== 'SUPER_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(staff.id, staff.name)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="تعطيل وحذف الحساب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      <Modal
        open={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="إضافة موظف جديد وتعيين الصلاحيات"
        subtitle="إنشاء حساب داخلي لمسؤول عمليات أو مستودع أو مراقب مالي"
        icon={Users}
        size="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الاسم الثلاثي للموظف">
              <input
                type="text"
                required
                placeholder="مثال: أحمد عبد الوهاب"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="البريد الإلكتروني المؤسسي">
              <input
                type="email"
                required
                placeholder="user@logisttex.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="رقم الهاتف المحمول">
              <input
                type="text"
                required
                placeholder="010xxxxxxxx"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="الإدارة والقسم">
              <input
                type="text"
                required
                placeholder="مثال: العمليات والأسطول / المستودع"
                value={userDept}
                onChange={(e) => setUserDept(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="الدور الوظيفي والصلاحيات المسندة (RBAC Role)">
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as AdminRole)}
              className={inputClass}
            >
              <option value="OPERATIONS">مسؤول عمليات وتشغيل أسطول (Operations)</option>
              <option value="WAREHOUSE_MGR">مدير مستودعات وسلاسل إمداد (Warehouse Manager)</option>
              <option value="FINANCE_HEAD">رئيس الحسابات والخزينة (Finance Head)</option>
              <option value="SUPER_ADMIN">مدير نظام عام (Super Admin)</option>
            </select>
          </Field>

          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300">
            سيتم إرسال رابط تفعيل الحساب وكلمة المرور المؤقتة مباشرة إلى البريد الإلكتروني للموظف.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <Button variant="ghost" onClick={() => setIsAddUserOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" type="submit">
              تأكيد إضافة الموظف
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

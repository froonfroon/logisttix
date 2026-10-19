export interface PermissionDefinition {
  key: string;
  module: string;
  moduleNameAr: string;
  nameAr: string;
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print';
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // Orders
  { key: 'orders.view', module: 'orders', moduleNameAr: 'إدارة الطلبات', nameAr: 'عرض قائمة الطلبات وتفاصيلها', action: 'view' },
  { key: 'orders.create', module: 'orders', moduleNameAr: 'إدارة الطلبات', nameAr: 'إنشاء طلب جديد', action: 'create' },
  { key: 'orders.edit', module: 'orders', moduleNameAr: 'إدارة الطلبات', nameAr: 'تعديل بيانات الطلب', action: 'edit' },
  { key: 'orders.delete', module: 'orders', moduleNameAr: 'إدارة الطلبات', nameAr: 'إلغاء وحذف الطلبات غير المشحونة', action: 'delete' },
  { key: 'orders.confirm', module: 'orders', moduleNameAr: 'إدارة الطلبات', nameAr: 'تأكيد الطلب وحجز المخزون', action: 'approve' },
  { key: 'orders.print_waybill', module: 'orders', moduleNameAr: 'إدارة الطلبات', nameAr: 'طباعة بوليصة الشحن وملصق الطرد', action: 'print' },
  { key: 'orders.export', module: 'orders', moduleNameAr: 'إدارة الطلبات', nameAr: 'تصدير شيت الطلبات Excel/CSV', action: 'export' },

  // Shipments & Delivery
  { key: 'shipments.view', module: 'shipments', moduleNameAr: 'الشحنات والتوزيع', nameAr: 'عرض سجل الشحنات وحالاتها', action: 'view' },
  { key: 'shipments.assign_driver', module: 'shipments', moduleNameAr: 'الشحنات والتوزيع', nameAr: 'إسناد الشحنات للسائقين', action: 'edit' },
  { key: 'shipments.update_status', module: 'shipments', moduleNameAr: 'الشحنات والتوزيع', nameAr: 'تحديث حالة الشحنة بالباركود', action: 'edit' },
  { key: 'shipments.confirm_delivery', module: 'shipments', moduleNameAr: 'الشحنات والتوزيع', nameAr: 'إتمام التسليم الفعلي وتحصيل النقدية', action: 'approve' },
  { key: 'shipments.process_return', module: 'shipments', moduleNameAr: 'الشحنات والتوزيع', nameAr: 'تسجيل وإغلاق الشحنة كمرتجع', action: 'edit' },

  // Warehouse & WMS
  { key: 'warehouse.inventory.view', module: 'warehouse', moduleNameAr: 'المستودعات والمخزون', nameAr: 'عرض أرصدة المنتجات والخانات والرفوف', action: 'view' },
  { key: 'warehouse.inventory.adjust', module: 'warehouse', moduleNameAr: 'المستودعات والمخزون', nameAr: 'تسوية الجرد وتعديل الكميات اليدوي', action: 'edit' },
  { key: 'warehouse.inbound.view', module: 'warehouse', moduleNameAr: 'المستودعات والمخزون', nameAr: 'عرض طلبات التوريد من التجار', action: 'view' },
  { key: 'warehouse.inbound.approve', module: 'warehouse', moduleNameAr: 'المستودعات والمخزون', nameAr: 'اعتماد طلب توريد التاجر', action: 'approve' },
  { key: 'warehouse.receipt.confirm', module: 'warehouse', moduleNameAr: 'المستودعات والمخزون', nameAr: 'تأكيد إذن الاستلام وزيادة رصيد المستودع', action: 'approve' },
  { key: 'warehouse.picking.manage', module: 'warehouse', moduleNameAr: 'المستودعات والمخزون', nameAr: 'إصدار قوائم السحب Picking Lists', action: 'create' },
  { key: 'warehouse.packing.manage', module: 'warehouse', moduleNameAr: 'المستودعات والمخزون', nameAr: 'تنفيذ مهام التغليف Packing Tasks', action: 'edit' },
  { key: 'warehouse.transfer.manage', module: 'warehouse', moduleNameAr: 'المستودعات والمخزون', nameAr: 'التحويل بين المستودعات والفروع', action: 'create' },

  // Drivers & Fleet
  { key: 'drivers.view', module: 'drivers', moduleNameAr: 'السائقون والأسطول', nameAr: 'عرض بيانات السائقين وحالاتهم', action: 'view' },
  { key: 'drivers.create', module: 'drivers', moduleNameAr: 'السائقون والأسطول', nameAr: 'إضافة سائق جديد وربط المركبة', action: 'create' },
  { key: 'drivers.edit', module: 'drivers', moduleNameAr: 'السائقون والأسطول', nameAr: 'تعديل بيانات السائق والسيارة', action: 'edit' },
  { key: 'drivers.manifest.generate', module: 'drivers', moduleNameAr: 'السائقون والأسطول', nameAr: 'توليد وطباعة كشف التوزيع اليومي Manifest', action: 'create' },
  { key: 'drivers.cash_close', module: 'drivers', moduleNameAr: 'السائقون والأسطول', nameAr: 'إغلاق اليومية النقدية ومطابقة تحصيلات السائق', action: 'approve' },

  // Finance & Treasury
  { key: 'finance.overview.view', module: 'finance', moduleNameAr: 'المالية والخزينة', nameAr: 'عرض لوحة المؤشرات المالية والأرباح', action: 'view' },
  { key: 'finance.merchant_wallet.view', module: 'finance', moduleNameAr: 'المالية والخزينة', nameAr: 'عرض دفاتر أستاذ ومحافظ التجار', action: 'view' },
  { key: 'finance.payout.approve', module: 'finance', moduleNameAr: 'المالية والخزينة', nameAr: 'موافقة واعتماد طلبات السحب للتاجر', action: 'approve' },
  { key: 'finance.payout.execute', module: 'finance', moduleNameAr: 'المالية والخزينة', nameAr: 'تأكيد التحويل البنكي وصرف المستحقات', action: 'approve' },
  { key: 'finance.expenses.manage', module: 'finance', moduleNameAr: 'المالية والخزينة', nameAr: 'إضافة واعتماد المصروفات التشغيلية', action: 'create' },
  { key: 'finance.invoices.generate', module: 'finance', moduleNameAr: 'المالية والخزينة', nameAr: 'إصدار الفواتير الضريبية وتصديرها PDF', action: 'create' },

  // Merchants Management
  { key: 'merchants.view', module: 'merchants', moduleNameAr: 'إدارة التجار', nameAr: 'عرض قائمة ومقرات ومستندات التجار', action: 'view' },
  { key: 'merchants.create', module: 'merchants', moduleNameAr: 'إدارة التجار', nameAr: 'تسجيل تاجر جديد وتحديد خطة التسعير', action: 'create' },
  { key: 'merchants.edit', module: 'merchants', moduleNameAr: 'إدارة التجار', nameAr: 'تعديل بيانات التاجر ونسبة العمولة', action: 'edit' },
  { key: 'merchants.wallet_adjust', module: 'merchants', moduleNameAr: 'إدارة التجار', nameAr: 'تسجيل إيداع أو تسوية يدوية في محفظة التاجر', action: 'approve' },
  { key: 'merchants.tokens.manage', module: 'merchants', moduleNameAr: 'إدارة التجار', nameAr: 'إنشاء وإلغاء مفاتيح الربط البرمجي API Tokens', action: 'edit' },

  // System & RBAC
  { key: 'system.users.manage', module: 'system', moduleNameAr: 'المستخدمون والصلاحيات', nameAr: 'إدارة موظفي الإدارة وأدوارهم الوظيفية', action: 'edit' },
  { key: 'system.roles.manage', module: 'system', moduleNameAr: 'المستخدمون والصلاحيات', nameAr: 'تخصيص الأدوار ومصفوفة الـ 164 صلاحية', action: 'edit' },
  { key: 'system.settings.manage', module: 'system', moduleNameAr: 'إعدادات النظام والأسعار', nameAr: 'تعديل تسعيرة المحافظات والهوية والطباعة', action: 'edit' },
  { key: 'system.audit.view', module: 'system', moduleNameAr: 'سجلات المراقبة والتتبع', nameAr: 'عرض الـ Audit Logs والعمليات الحساسة', action: 'view' },
];

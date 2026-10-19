export type PortalType = 'ADMIN' | 'MERCHANT' | 'TRACKING' | 'AUTH';

export type AdminRole = 'SUPER_ADMIN' | 'OPERATIONS' | 'WAREHOUSE_MGR' | 'FINANCE_HEAD';
export type MerchantRole = 'OWNER' | 'ADMIN' | 'STAFF' | 'ACCOUNTANT' | 'WAREHOUSE_VIEWER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  portal: PortalType;
  adminRole?: AdminRole;
  merchantRole?: MerchantRole;
  permissions: string[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKING'
  | 'PACKING'
  | 'READY_FOR_DISPATCH'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface TimelineEvent {
  status: OrderStatus;
  title: string;
  note: string;
  timestamp: string;
  actor: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  city: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  codAmount: number;
  shippingFee: number;
  paymentType: 'COD' | 'PREPAID';
  fulfillmentType: 'WAREHOUSE_FULFILLMENT' | 'DELIVERY_ONLY';
  status: OrderStatus;
  driverId?: string;
  driverName?: string;
  manifestId?: string;
  /** true once the COD of a delivered order has been reconciled into the merchant's available balance */
  settled?: boolean;
  deliveryAttempts: number;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface WarehouseItem {
  id: string;
  merchantId: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  zone: string;
  shelf: string;
  bin: string;
  availableQty: number;
  reservedQty: number;
  damagedQty: number;
  lowStockThreshold: number;
  unitCost: number;
  sellingPrice: number;
  updatedAt: string;
}

export interface InboundItem {
  sku: string;
  name: string;
  requestedQty: number;
  receivedQty: number;
  damagedQty: number;
}

export type InboundStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'CONFIRMED' | 'REJECTED';

export interface InboundRequest {
  id: string;
  requestNumber: string;
  merchantId: string;
  warehouseId: string;
  warehouseName: string;
  expectedArrivalDate: string;
  status: InboundStatus;
  items: InboundItem[];
  notes?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  status: 'ACTIVE' | 'ON_DUTY' | 'INACTIVE';
  totalDelivered: number;
  governorates: string[];
}

export interface DriverManifest {
  id: string;
  manifestNumber: string;
  driverId: string;
  date: string;
  orderIds: string[];
  status: 'DISPATCHED' | 'RECONCILED';
}

export type MerchantStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL' | 'REJECTED';

export interface Merchant {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  status: MerchantStatus;
  availableBalance: number;
  pendingBalance: number;
  shippingDiscountPercent: number;
  bankName: string;
  accountHolder: string;
  iban: string;
  createdAt: string;
  commercialReg?: string;
  storeUrl?: string;
  category?: string;
  governorate?: string;
  city?: string;
  pickupAddress?: string;
  expectedDailyOrders?: string;
  rejectionReason?: string;
  appliedAt?: string;
  approvedAt?: string;
}

export type TransactionType = 'COD_COLLECTION' | 'PAYOUT' | 'STORAGE_FEE' | 'SHIPPING_FEE' | 'EXPENSE';

export interface FinanceTransaction {
  id: string;
  transactionNumber: string;
  type: TransactionType;
  merchantId?: string;
  amount: number;
  description: string;
  date: string;
}

export type PayoutStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';

export interface PayoutRequest {
  id: string;
  requestNumber: string;
  merchantId: string;
  amount: number;
  bankName: string;
  accountHolder: string;
  iban: string;
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
  rejectReason?: string;
}

/* ------------------------------------------------------------------ */
/* Enterprise & Management Types                                      */
/* ------------------------------------------------------------------ */

export type AuditActionType =
  | 'ORDER_STATUS_CHANGE'
  | 'ORDER_CREATE'
  | 'INBOUND_RECEIPT'
  | 'PAYOUT_APPROVE'
  | 'PAYOUT_DISBURSE'
  | 'MANIFEST_RECONCILE'
  | 'ROLE_PERMISSION_UPDATE'
  | 'EXPENSE_RECORD'
  | 'STOCK_ADJUSTMENT'
  | 'INVOICE_GENERATE'
  | 'RETURN_INSPECT'
  | 'STOCK_TRANSFER';

export interface AuditLog {
  id: string;
  actionType: AuditActionType;
  actorName: string;
  actorRole: string;
  resourceType: string;
  resourceId: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  ipAddress?: string;
}

export type DeliveryFailureReason =
  | 'NO_ANSWER'
  | 'RESCHEDULED_BY_CUSTOMER'
  | 'WRONG_ADDRESS'
  | 'REFUSED_PRODUCT'
  | 'CUSTOMER_CANCELLED';

export interface DeliveryAttempt {
  id: string;
  orderId: string;
  attemptNumber: number;
  driverName: string;
  reason: DeliveryFailureReason;
  reasonText: string;
  notes?: string;
  timestamp: string;
}

export interface TreasuryAccount {
  id: string;
  name: string;
  type: 'CASH_VAULT' | 'BANK_ACCOUNT' | 'E_WALLET';
  accountNumber: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export type ExpenseCategory =
  | 'FUEL_VEHICLE'
  | 'WAREHOUSE_RENT'
  | 'PACKAGING_MATERIALS'
  | 'SALARIES'
  | 'UTILITIES'
  | 'OTHER';

export interface OperatingExpense {
  id: string;
  expenseNumber: string;
  category: ExpenseCategory;
  categoryLabel: string;
  amount: number;
  paidTo: string;
  treasuryAccountId: string;
  treasuryAccountName: string;
  recordedBy: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  date: string;
  notes?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  code: string;
  baseRate: number;
  perKgAdditionalRate: number;
  codFeePercent: number;
  returnFeePercent: number;
  targetMerchants: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface MerchantInvoice {
  id: string;
  invoiceNumber: string;
  merchantId: string;
  merchantName: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  deliveredOrdersCount: number;
  shippingFeesTotal: number;
  storageFeesTotal: number;
  fulfillmentFeesTotal: number;
  codCollectedTotal: number;
  netPayoutAmount: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID';
  issuedAt: string;
  dueAt: string;
}

export interface ReturnItemInspection {
  id: string;
  returnNumber: string;
  orderNumber: string;
  trackingNumber: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  customerPhone: string;
  sku: string;
  itemName: string;
  quantity: number;
  returnReason: string;
  inspectionStatus: 'PENDING_INSPECTION' | 'RESTOCKED' | 'DAMAGED_SCRAPPED';
  inspectedBy?: string;
  inspectionDate?: string;
  notes?: string;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromWarehouse: string;
  toWarehouse: string;
  sku: string;
  itemName: string;
  merchantId: string;
  merchantName: string;
  quantity: number;
  status: 'DRAFT' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';
  createdDate: string;
  driverName?: string;
}

export interface MerchantTeamMember {
  id: string;
  merchantId: string;
  name: string;
  email: string;
  phone: string;
  role: 'Owner' | 'Admin' | 'Staff' | 'Accountant' | 'Warehouse Viewer';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}



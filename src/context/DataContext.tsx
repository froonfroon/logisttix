import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type {
  AuditLog,
  DeliveryAttempt,
  Driver,
  DriverManifest,
  FinanceTransaction,
  InboundRequest,
  Merchant,
  MerchantInvoice,
  MerchantTeamMember,
  OperatingExpense,
  Order,
  OrderStatus,
  PayoutRequest,
  PricingPlan,
  ReturnItemInspection,
  StockTransfer,
  TreasuryAccount,
  WarehouseItem,
} from '../types';
import {
  SEED_AUDIT_LOGS,
  SEED_DELIVERY_ATTEMPTS,
  SEED_DRIVERS,
  SEED_INBOUNDS,
  SEED_INVENTORY,
  SEED_MANIFESTS,
  SEED_MERCHANT_INVOICES,
  SEED_MERCHANT_TEAM_MEMBERS,
  SEED_MERCHANTS,
  SEED_OPERATING_EXPENSES,
  SEED_ORDERS,
  SEED_PAYOUTS,
  SEED_PRICING_PLANS,
  SEED_RETURN_INSPECTIONS,
  SEED_STOCK_TRANSFERS,
  SEED_TRANSACTIONS,
  SEED_TREASURY_ACCOUNTS,
} from '../data/mockData';
import { calcShippingFee, isValidEgyptianPhone, serial, stamp, today, uid } from '../lib/format';
import { ORDER_FLOW, RESERVING_STATES, STATUS_META } from '../lib/orderStatus';

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

export interface DataState {
  orders: Order[];
  inventory: WarehouseItem[];
  inbounds: InboundRequest[];
  payouts: PayoutRequest[];
  transactions: FinanceTransaction[];
  manifests: DriverManifest[];
  drivers: Driver[];
  merchants: Merchant[];
  auditLogs: AuditLog[];
  treasuryAccounts: TreasuryAccount[];
  expenses: OperatingExpense[];
  pricingPlans: PricingPlan[];
  deliveryAttempts: DeliveryAttempt[];
  invoices: MerchantInvoice[];
  returns: ReturnItemInspection[];
  transfers: StockTransfer[];
  merchantTeam: MerchantTeamMember[];
}

const initialState: DataState = {
  orders: SEED_ORDERS,
  inventory: SEED_INVENTORY,
  inbounds: SEED_INBOUNDS,
  payouts: SEED_PAYOUTS,
  transactions: SEED_TRANSACTIONS,
  manifests: SEED_MANIFESTS,
  drivers: SEED_DRIVERS,
  merchants: SEED_MERCHANTS,
  auditLogs: SEED_AUDIT_LOGS,
  treasuryAccounts: SEED_TREASURY_ACCOUNTS,
  expenses: SEED_OPERATING_EXPENSES,
  pricingPlans: SEED_PRICING_PLANS,
  deliveryAttempts: SEED_DELIVERY_ATTEMPTS,
  invoices: SEED_MERCHANT_INVOICES,
  returns: SEED_RETURN_INSPECTIONS,
  transfers: SEED_STOCK_TRANSFERS,
  merchantTeam: SEED_MERCHANT_TEAM_MEMBERS,
};

export type Result = { ok: true; error?: undefined } | { ok: false; error: string };
const ok: Result = { ok: true };
const fail = (error: string): Result => ({ ok: false, error });

export interface NewOrderInput {
  merchantId: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  city: string;
  address: string;
  paymentType: 'COD' | 'PREPAID';
  lines: { sku: string; qty: number }[];
}

export interface NewInboundInput {
  merchantId: string;
  expectedArrivalDate: string;
  notes?: string;
  lines: { sku: string; qty: number }[];
}

export interface ReceiptLine { sku: string; receivedQty: number; damagedQty: number }

type Action =
  | { type: 'ORDER_CREATE'; order: Order }
  | { type: 'ORDER_TRANSITION'; orderId: string; to: OrderStatus; driverId?: string; note?: string; actor: string }
  | { type: 'INBOUND_CREATE'; inbound: InboundRequest }
  | { type: 'INBOUND_SET_STATUS'; id: string; status: 'APPROVED' | 'REJECTED' }
  | { type: 'INBOUND_CONFIRM'; id: string; lines: ReceiptLine[] }
  | { type: 'PAYOUT_REQUEST'; payout: PayoutRequest }
  | { type: 'PAYOUT_APPROVE'; id: string }
  | { type: 'PAYOUT_REJECT'; id: string; reason: string }
  | { type: 'PAYOUT_PAID'; id: string }
  | { type: 'MANIFEST_RECONCILE'; id: string }
  | { type: 'AUDIT_LOG_ADD'; log: AuditLog }
  | { type: 'EXPENSE_ADD'; expense: OperatingExpense }
  | { type: 'EXPENSE_APPROVE'; id: string; actor: string }
  | { type: 'DELIVERY_ATTEMPT_RECORD'; attempt: DeliveryAttempt }
  | { type: 'STOCK_ADJUST'; itemId: string; deltaAvailable: number; reason: string; actor: string }
  | { type: 'MERCHANT_ADD'; merchant: Merchant }
  | { type: 'MERCHANT_APPROVE'; id: string; discountPercent: number; warehouseId?: string }
  | { type: 'MERCHANT_REJECT'; id: string; reason: string }
  | { type: 'MERCHANT_ADJUST_BALANCE'; id: string; amount: number; note: string }
  | { type: 'DRIVER_ADD'; driver: Driver }
  | { type: 'INVENTORY_ITEM_ADD'; item: WarehouseItem }
  | { type: 'ORDERS_BULK_ASSIGN'; orderIds: string[]; driverId: string }
  | { type: 'INVOICE_CREATE'; invoice: MerchantInvoice }
  | { type: 'INVOICE_MARK_PAID'; id: string }
  | { type: 'RETURN_INSPECT'; id: string; outcome: 'RESTOCKED' | 'DAMAGED_SCRAPPED'; notes: string; inspector: string }
  | { type: 'RETURN_CREATE'; returnItem: ReturnItemInspection }
  | { type: 'TRANSFER_CREATE'; transfer: StockTransfer }
  | { type: 'TRANSFER_UPDATE_STATUS'; id: string; status: StockTransfer['status'] }
  | { type: 'MERCHANT_TEAM_ADD'; member: MerchantTeamMember }
  | { type: 'MERCHANT_TEAM_REMOVE'; id: string };

/* ------------------------------------------------------------------ */
/* Reducer helpers                                                     */
/* ------------------------------------------------------------------ */

const netForMerchant = (o: Order) => o.codAmount - o.shippingFee;

const adjustStock = (
  inventory: WarehouseItem[],
  merchantId: string,
  lines: { sku: string; qty: number }[],
  fn: (item: WarehouseItem, qty: number) => Partial<WarehouseItem>,
) =>
  inventory.map((item) => {
    if (item.merchantId !== merchantId) return item;
    const line = lines.find((l) => l.sku === item.sku);
    return line ? { ...item, ...fn(item, line.qty), updatedAt: today() } : item;
  });

const updateMerchant = (merchants: Merchant[], id: string, fn: (m: Merchant) => Partial<Merchant>) =>
  merchants.map((m) => (m.id === id ? { ...m, ...fn(m) } : m));

const ledger = (tx: Omit<FinanceTransaction, 'id' | 'transactionNumber' | 'date'>): FinanceTransaction => ({
  ...tx,
  id: uid('tx'),
  transactionNumber: serial('TX'),
  date: stamp(),
});

function transitionOrder(state: DataState, a: Extract<Action, { type: 'ORDER_TRANSITION' }>): DataState {
  const order = state.orders.find((o) => o.id === a.orderId);
  if (!order) return state;

  let { inventory, merchants, manifests, transactions } = state;
  const lines = order.items.map((i) => ({ sku: i.sku, qty: i.qty }));
  const patch: Partial<Order> = { status: a.to, updatedAt: new Date().toISOString() };
  let note = a.note ?? '';

  if (a.to === 'OUT_FOR_DELIVERY' && a.driverId) {
    const driver = state.drivers.find((d) => d.id === a.driverId);
    if (driver) {
      const open = manifests.find((m) => m.driverId === driver.id && m.status === 'DISPATCHED' && m.date === today());
      let manifestId: string;
      let manifestNumber: string;
      if (open) {
        manifestId = open.id;
        manifestNumber = open.manifestNumber;
        manifests = manifests.map((m) =>
          m.id === open.id && !m.orderIds.includes(order.id) ? { ...m, orderIds: [...m.orderIds, order.id] } : m,
        );
      } else {
        manifestId = uid('man');
        manifestNumber = serial('MNF');
        manifests = [{ id: manifestId, manifestNumber, driverId: driver.id, date: today(), orderIds: [order.id], status: 'DISPATCHED' }, ...manifests];
      }
      Object.assign(patch, { driverId: driver.id, driverName: driver.name, manifestId, deliveryAttempts: order.deliveryAttempts + 1 });
      note = note || `مُسند إلى ${driver.name} • كشف ${manifestNumber}`;
    }
  }

  if (a.to === 'DELIVERED') {
    inventory = adjustStock(inventory, order.merchantId, lines, (it, q) => ({ reservedQty: Math.max(0, it.reservedQty - q) }));
    merchants = updateMerchant(merchants, order.merchantId, (m) => ({ pendingBalance: m.pendingBalance + netForMerchant(order) }));
    transactions = [
      ledger({ type: 'COD_COLLECTION', merchantId: order.merchantId, amount: order.codAmount, description: `تحصيل الشحنة ${order.trackingNumber}` }),
      ...transactions,
    ];
    note = note || `تم تحصيل ${order.codAmount} ج.م من العميل`;
  }

  if ((a.to === 'RETURNED' || a.to === 'CANCELLED') && RESERVING_STATES.includes(order.status)) {
    inventory = adjustStock(inventory, order.merchantId, lines, (it, q) => ({
      reservedQty: Math.max(0, it.reservedQty - q),
      availableQty: it.availableQty + q,
    }));
    note = note || 'تم فك الحجز وإعادة الكميات للرصيد المتاح';
  }

  const event = { status: a.to, title: STATUS_META[a.to].label, note: note || 'تحديث الحالة', timestamp: stamp(), actor: a.actor };

  const auditEntry: AuditLog = {
    id: uid('aud'),
    actionType: 'ORDER_STATUS_CHANGE',
    actorName: a.actor,
    actorRole: 'مسؤول تشغيل',
    resourceType: 'شحنة',
    resourceId: order.orderNumber,
    details: `تحديث حالة الشحنة إلى (${STATUS_META[a.to].label}): ${note || 'لا توجد ملاحظات إضافية'}`,
    severity: a.to === 'DELIVERED' ? 'INFO' : a.to === 'RETURNED' || a.to === 'CANCELLED' ? 'WARNING' : 'INFO',
    timestamp: stamp(),
  };

  return {
    ...state,
    inventory,
    merchants,
    manifests,
    transactions,
    orders: state.orders.map((o) => (o.id === order.id ? { ...o, ...patch, timeline: [...o.timeline, event] } : o)),
    auditLogs: [auditEntry, ...state.auditLogs],
  };
}

function reducer(state: DataState, action: Action): DataState {
  switch (action.type) {
    case 'ORDER_CREATE': {
      const { order } = action;
      const lines = order.items.map((i) => ({ sku: i.sku, qty: i.qty }));
      const audit: AuditLog = {
        id: uid('aud'),
        actionType: 'ORDER_CREATE',
        actorName: order.merchantName,
        actorRole: 'بوابة التاجر',
        resourceType: 'طلب شحن',
        resourceId: order.orderNumber,
        details: `إنشاء طلب شحن جديد وحجز ${order.items.reduce((s, i) => s + i.qty, 0)} قطعة بنجاح`,
        severity: 'INFO',
        timestamp: stamp(),
      };
      return {
        ...state,
        orders: [order, ...state.orders],
        auditLogs: [audit, ...state.auditLogs],
        inventory: adjustStock(state.inventory, order.merchantId, lines, (it, q) => ({
          availableQty: it.availableQty - q,
          reservedQty: it.reservedQty + q,
        })),
      };
    }

    case 'ORDER_TRANSITION':
      return transitionOrder(state, action);

    case 'INBOUND_CREATE':
      return { ...state, inbounds: [action.inbound, ...state.inbounds] };

    case 'INBOUND_SET_STATUS':
      return { ...state, inbounds: state.inbounds.map((i) => (i.id === action.id ? { ...i, status: action.status } : i)) };

    case 'INBOUND_CONFIRM': {
      const inbound = state.inbounds.find((i) => i.id === action.id);
      if (!inbound) return state;
      const byS = new Map(action.lines.map((l) => [l.sku, l]));
      return {
        ...state,
        inbounds: state.inbounds.map((i) =>
          i.id === inbound.id
            ? {
                ...i,
                status: 'CONFIRMED',
                confirmedAt: stamp(),
                items: i.items.map((it) => ({ ...it, receivedQty: byS.get(it.sku)?.receivedQty ?? 0, damagedQty: byS.get(it.sku)?.damagedQty ?? 0 })),
              }
            : i,
        ),
        inventory: state.inventory.map((it) => {
          const line = it.merchantId === inbound.merchantId ? byS.get(it.sku) : undefined;
          return line
            ? { ...it, availableQty: it.availableQty + line.receivedQty, damagedQty: it.damagedQty + line.damagedQty, updatedAt: today() }
            : it;
        }),
      };
    }

    case 'PAYOUT_REQUEST':
      return {
        ...state,
        payouts: [action.payout, ...state.payouts],
        merchants: updateMerchant(state.merchants, action.payout.merchantId, (m) => ({ availableBalance: m.availableBalance - action.payout.amount })),
      };

    case 'PAYOUT_APPROVE':
      return { ...state, payouts: state.payouts.map((p) => (p.id === action.id ? { ...p, status: 'APPROVED', processedAt: stamp() } : p)) };

    case 'PAYOUT_REJECT': {
      const payout = state.payouts.find((p) => p.id === action.id);
      if (!payout) return state;
      return {
        ...state,
        payouts: state.payouts.map((p) => (p.id === action.id ? { ...p, status: 'REJECTED', processedAt: stamp(), rejectReason: action.reason } : p)),
        merchants: updateMerchant(state.merchants, payout.merchantId, (m) => ({ availableBalance: m.availableBalance + payout.amount })),
      };
    }

    case 'PAYOUT_PAID': {
      const payout = state.payouts.find((p) => p.id === action.id);
      if (!payout) return state;
      return {
        ...state,
        payouts: state.payouts.map((p) => (p.id === action.id ? { ...p, status: 'PAID', processedAt: stamp() } : p)),
        transactions: [
          ledger({ type: 'PAYOUT', merchantId: payout.merchantId, amount: -payout.amount, description: `صرف ${payout.requestNumber} - ${payout.bankName}` }),
          ...state.transactions,
        ],
      };
    }

    case 'MANIFEST_RECONCILE': {
      const manifest = state.manifests.find((m) => m.id === action.id);
      if (!manifest) return state;
      const toSettle = state.orders.filter((o) => manifest.orderIds.includes(o.id) && o.status === 'DELIVERED' && !o.settled);
      let merchants = state.merchants;
      for (const o of toSettle) {
        const net = netForMerchant(o);
        merchants = updateMerchant(merchants, o.merchantId, (m) => ({
          pendingBalance: m.pendingBalance - net,
          availableBalance: m.availableBalance + net,
        }));
      }
      const settledIds = new Set(toSettle.map((o) => o.id));
      return {
        ...state,
        merchants,
        manifests: state.manifests.map((m) => (m.id === manifest.id ? { ...m, status: 'RECONCILED' } : m)),
        orders: state.orders.map((o) => (settledIds.has(o.id) ? { ...o, settled: true } : o)),
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'MANIFEST_RECONCILE',
            actorName: 'مدير العمليات',
            actorRole: 'إدارة العمليات والأسطول',
            resourceType: 'كشف توزيع',
            resourceId: manifest.manifestNumber,
            details: `إغلاق ومطابقة الكشف اليومي ${manifest.manifestNumber} وتسوية مستحقات ${toSettle.length} شحنة مسلمة`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'AUDIT_LOG_ADD':
      return { ...state, auditLogs: [action.log, ...state.auditLogs] };

    case 'EXPENSE_ADD':
      return {
        ...state,
        expenses: [action.expense, ...state.expenses],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'EXPENSE_RECORD',
            actorName: action.expense.recordedBy,
            actorRole: 'مسؤول العمليات والمالية',
            resourceType: 'مصروف تشغيلي',
            resourceId: action.expense.expenseNumber,
            details: `تسجيل مصروف ${action.expense.categoryLabel} بمبلغ ${action.expense.amount} ج.م لـ ${action.expense.paidTo}`,
            severity: 'WARNING',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };

    case 'EXPENSE_APPROVE': {
      const exp = state.expenses.find((e) => e.id === action.id);
      if (!exp) return state;
      const account = state.treasuryAccounts.find((a) => a.id === exp.treasuryAccountId);
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.id ? { ...e, status: 'PAID' } : e)),
        treasuryAccounts: state.treasuryAccounts.map((a) =>
          a.id === exp.treasuryAccountId ? { ...a, balance: a.balance - exp.amount, lastUpdated: stamp() } : a,
        ),
        transactions: [
          ledger({ type: 'EXPENSE', amount: -exp.amount, description: `صرف مصروف ${exp.categoryLabel} - ${exp.paidTo}` }),
          ...state.transactions,
        ],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'EXPENSE_RECORD',
            actorName: action.actor,
            actorRole: 'رئيس المالية',
            resourceType: 'حساب الخزينة',
            resourceId: exp.expenseNumber,
            details: `اعتماد وصرف المصروف ${exp.expenseNumber} وخصم ${exp.amount} ج.م من ${account?.name || 'الخزينة'}`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'DELIVERY_ATTEMPT_RECORD': {
      const order = state.orders.find((o) => o.id === action.attempt.orderId);
      if (!order) return state;
      const timelineEvent = {
        status: order.status,
        title: `محاولة تسليم #${action.attempt.attemptNumber} لم تكتمل`,
        note: `${action.attempt.reasonText} • مندوب: ${action.attempt.driverName}`,
        timestamp: stamp(),
        actor: action.attempt.driverName,
      };
      return {
        ...state,
        deliveryAttempts: [action.attempt, ...state.deliveryAttempts],
        orders: state.orders.map((o) =>
          o.id === action.attempt.orderId
            ? { ...o, deliveryAttempts: o.deliveryAttempts + 1, timeline: [...o.timeline, timelineEvent] }
            : o,
        ),
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'ORDER_STATUS_CHANGE',
            actorName: action.attempt.driverName,
            actorRole: 'سائق توزيع',
            resourceType: 'شحنة',
            resourceId: order.orderNumber,
            details: `تسجيل محاولة تسليم غير ناجحة: ${action.attempt.reasonText}`,
            severity: 'WARNING',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'STOCK_ADJUST': {
      const item = state.inventory.find((i) => i.id === action.itemId);
      if (!item) return state;
      const newAvail = Math.max(0, item.availableQty + action.deltaAvailable);
      return {
        ...state,
        inventory: state.inventory.map((i) => (i.id === action.itemId ? { ...i, availableQty: newAvail, updatedAt: today() } : i)),
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'STOCK_ADJUSTMENT',
            actorName: action.actor,
            actorRole: 'مسؤول المستودع WMS',
            resourceType: 'صنف مخزني',
            resourceId: item.sku,
            details: `تعديل جرد يدوي للصنف ${item.name} بمقدار (${action.deltaAvailable > 0 ? '+' : ''}${action.deltaAvailable}) قطعة. السبب: ${action.reason}`,
            severity: action.deltaAvailable < 0 ? 'WARNING' : 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'MERCHANT_ADD':
      return {
        ...state,
        merchants: [action.merchant, ...state.merchants],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'ROLE_PERMISSION_UPDATE',
            actorName: 'إدارة النظام',
            actorRole: 'نظام الامتثال',
            resourceType: 'طلب تاجر',
            resourceId: action.merchant.companyName,
            details: `تسجيل تاجر جديد (${action.merchant.companyName}) بحالة [${action.merchant.status === 'PENDING_APPROVAL' ? 'قيد المراجعة والموافقة' : 'نشط'}]`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };

    case 'MERCHANT_APPROVE': {
      const merchant = state.merchants.find((m) => m.id === action.id);
      if (!merchant) return state;
      return {
        ...state,
        merchants: state.merchants.map((m) =>
          m.id === action.id
            ? {
                ...m,
                status: 'ACTIVE',
                shippingDiscountPercent: action.discountPercent,
                approvedAt: stamp(),
              }
            : m,
        ),
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'ROLE_PERMISSION_UPDATE',
            actorName: 'مدير العمليات والامتثال',
            actorRole: 'إدارة النظام',
            resourceType: 'اعتماد تاجر',
            resourceId: merchant.companyName,
            details: `الموافقة الرسمية على انضمام متجر (${merchant.companyName}) واعتماده كتاجر نشط مع خصم شحن ${action.discountPercent}%`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'MERCHANT_REJECT': {
      const merchant = state.merchants.find((m) => m.id === action.id);
      if (!merchant) return state;
      return {
        ...state,
        merchants: state.merchants.map((m) =>
          m.id === action.id
            ? {
                ...m,
                status: 'REJECTED',
                rejectionReason: action.reason,
              }
            : m,
        ),
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'ROLE_PERMISSION_UPDATE',
            actorName: 'مدير العمليات والامتثال',
            actorRole: 'إدارة النظام',
            resourceType: 'رفض طلب تاجر',
            resourceId: merchant.companyName,
            details: `رفض طلب انضمام متجر (${merchant.companyName}). السبب: ${action.reason}`,
            severity: 'WARNING',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'MERCHANT_ADJUST_BALANCE': {
      const merchant = state.merchants.find((m) => m.id === action.id);
      if (!merchant) return state;
      return {
        ...state,
        merchants: state.merchants.map((m) =>
          m.id === action.id ? { ...m, availableBalance: m.availableBalance + action.amount } : m,
        ),
        transactions: [
          ledger({
            type: action.amount > 0 ? 'COD_COLLECTION' : 'EXPENSE',
            merchantId: merchant.id,
            amount: action.amount,
            description: `تسوية رصيد يدوية: ${action.note}`,
          }),
          ...state.transactions,
        ],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'PAYOUT_APPROVE',
            actorName: 'المدير المالي',
            actorRole: 'الرقابة المالية',
            resourceType: 'محفظة التاجر',
            resourceId: merchant.companyName,
            details: `تعديل رصيد محفظة التاجر ${merchant.companyName} بمقدار (${action.amount > 0 ? '+' : ''}${action.amount} ج.م). البيان: ${action.note}`,
            severity: 'WARNING',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'DRIVER_ADD':
      return {
        ...state,
        drivers: [action.driver, ...state.drivers],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'MANIFEST_RECONCILE',
            actorName: 'مدير الحركة والأسطول',
            actorRole: 'إدارة الأسطول',
            resourceType: 'سائق',
            resourceId: action.driver.name,
            details: `تسجيل سائق أسطول جديد (${action.driver.name} • مركبة ${action.driver.vehicleType}) للمحافظات: ${action.driver.governorates.join('، ')}`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };

    case 'INVENTORY_ITEM_ADD':
      return {
        ...state,
        inventory: [action.item, ...state.inventory],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'STOCK_ADJUSTMENT',
            actorName: 'مسؤول المستودع WMS',
            actorRole: 'إدارة المخازن',
            resourceType: 'صنف مخزني جديد',
            resourceId: action.item.sku,
            details: `إضافة صنف جديد (${action.item.name} • ${action.item.sku}) في ${action.item.warehouseName} برصيد أولي ${action.item.availableQty} قطعة`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };

    case 'ORDERS_BULK_ASSIGN': {
      const driver = state.drivers.find((d) => d.id === action.driverId);
      if (!driver) return state;
      const manifestId = uid('man');
      const manifestNumber = serial('MNF');
      const newManifest: DriverManifest = {
        id: manifestId,
        manifestNumber,
        driverId: driver.id,
        date: today(),
        orderIds: action.orderIds,
        status: 'DISPATCHED',
      };
      const orderIdSet = new Set(action.orderIds);
      const updatedOrders = state.orders.map((o) => {
        if (!orderIdSet.has(o.id)) return o;
        const timelineEvent = {
          status: 'OUT_FOR_DELIVERY' as OrderStatus,
          title: 'خرج للتسليم مع السائق',
          note: `إسناد مجمع للسائق ${driver.name} • كشف ${manifestNumber}`,
          timestamp: stamp(),
          actor: 'مدير العمليات',
        };
        return {
          ...o,
          status: 'OUT_FOR_DELIVERY' as OrderStatus,
          driverId: driver.id,
          driverName: driver.name,
          manifestId,
          deliveryAttempts: o.deliveryAttempts + 1,
          updatedAt: new Date().toISOString(),
          timeline: [...o.timeline, timelineEvent],
        };
      });
      return {
        ...state,
        orders: updatedOrders,
        manifests: [newManifest, ...state.manifests],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'ORDER_STATUS_CHANGE',
            actorName: 'مدير العمليات',
            actorRole: 'العمليات والتوزيع',
            resourceType: 'كشف توزيع مجمع',
            resourceId: manifestNumber,
            details: `توليد كشف توزيع مجمع ${manifestNumber} وإسناد ${action.orderIds.length} شحنة للسائق ${driver.name}`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'INVOICE_CREATE':
      return {
        ...state,
        invoices: [action.invoice, ...state.invoices],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'INVOICE_GENERATE',
            actorName: 'المدير المالي',
            actorRole: 'الرقابة المالية',
            resourceType: 'فاتورة تاجر',
            resourceId: action.invoice.invoiceNumber,
            details: `إصدار فاتورة دورية ${action.invoice.invoiceNumber} للتاجر ${action.invoice.merchantName} بإجمالي صافي مستحق ${action.invoice.netPayoutAmount} ج.م`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };

    case 'INVOICE_MARK_PAID':
      return {
        ...state,
        invoices: state.invoices.map((inv) => (inv.id === action.id ? { ...inv, status: 'PAID' } : inv)),
      };

    case 'RETURN_INSPECT': {
      const ret = state.returns.find((r) => r.id === action.id);
      if (!ret) return state;
      const updatedReturns = state.returns.map((r) =>
        r.id === action.id
          ? {
              ...r,
              inspectionStatus: action.outcome,
              inspectedBy: action.inspector,
              inspectionDate: stamp(),
              notes: action.notes || r.notes,
            }
          : r,
      );
      const updatedInventory = state.inventory.map((item) => {
        if (item.merchantId === ret.merchantId && item.sku.toLowerCase() === ret.sku.toLowerCase()) {
          if (action.outcome === 'RESTOCKED') {
            return { ...item, availableQty: item.availableQty + ret.quantity, updatedAt: today() };
          } else {
            return { ...item, damagedQty: item.damagedQty + ret.quantity, updatedAt: today() };
          }
        }
        return item;
      });
      return {
        ...state,
        returns: updatedReturns,
        inventory: updatedInventory,
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'RETURN_INSPECT',
            actorName: action.inspector,
            actorRole: 'مسؤول فحص الجودة QC',
            resourceType: 'مرتجع شحنة',
            resourceId: ret.returnNumber,
            details: `فحص مرتجع ${ret.returnNumber} للصنف ${ret.itemName} بالنتيجة (${action.outcome === 'RESTOCKED' ? 'سليم وإعادة إدراج بالرف' : 'تالف مستبعد'}). البيان: ${action.notes}`,
            severity: action.outcome === 'DAMAGED_SCRAPPED' ? 'WARNING' : 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };
    }

    case 'RETURN_CREATE':
      return {
        ...state,
        returns: [action.returnItem, ...state.returns],
      };

    case 'TRANSFER_CREATE':
      return {
        ...state,
        transfers: [action.transfer, ...state.transfers],
        auditLogs: [
          {
            id: uid('aud'),
            actionType: 'STOCK_TRANSFER',
            actorName: 'مسؤول المستودع WMS',
            actorRole: 'إدارة المخازن',
            resourceType: 'إذن تحويل بضاعة',
            resourceId: action.transfer.transferNumber,
            details: `إنشاء إذن تحويل ${action.transfer.quantity} قطعة من ${action.transfer.fromWarehouse} إلى ${action.transfer.toWarehouse}`,
            severity: 'INFO',
            timestamp: stamp(),
          },
          ...state.auditLogs,
        ],
      };

    case 'TRANSFER_UPDATE_STATUS':
      return {
        ...state,
        transfers: state.transfers.map((t) => (t.id === action.id ? { ...t, status: action.status } : t)),
      };

    case 'MERCHANT_TEAM_ADD':
      return {
        ...state,
        merchantTeam: [action.member, ...state.merchantTeam],
      };

    case 'MERCHANT_TEAM_REMOVE':
      return {
        ...state,
        merchantTeam: state.merchantTeam.filter((m) => m.id !== action.id),
      };
  }
}

/* ------------------------------------------------------------------ */
/* Public API (validation lives here, mutations in the reducer)        */
/* ------------------------------------------------------------------ */

interface DataApi {
  state: DataState;
  createOrder: (input: NewOrderInput) => Result;
  transitionOrder: (orderId: string, to: OrderStatus, opts: { actor: string; driverId?: string; note?: string }) => Result;
  createInbound: (input: NewInboundInput) => Result;
  setInboundStatus: (id: string, status: 'APPROVED' | 'REJECTED') => Result;
  confirmReceipt: (id: string, lines: ReceiptLine[]) => Result;
  requestPayout: (merchantId: string, amount: number) => Result;
  approvePayout: (id: string) => Result;
  rejectPayout: (id: string, reason: string) => Result;
  markPayoutPaid: (id: string) => Result;
  reconcileManifest: (id: string) => Result;
  addExpense: (input: { category: OperatingExpense['category']; categoryLabel: string; amount: number; paidTo: string; treasuryAccountId: string; recordedBy: string; notes?: string }) => Result;
  approveExpense: (id: string, actor: string) => Result;
  recordDeliveryAttempt: (input: { orderId: string; reason: DeliveryAttempt['reason']; reasonText: string; driverName: string; notes?: string }) => Result;
  adjustStockQuantity: (itemId: string, deltaAvailable: number, reason: string, actor: string) => Result;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  addMerchant: (input: Omit<Merchant, 'id' | 'createdAt' | 'availableBalance' | 'pendingBalance'>) => Result;
  approveMerchant: (id: string, discountPercent: number, warehouseId?: string) => Result;
  rejectMerchant: (id: string, reason: string) => Result;
  registerMerchant: (input: {
    companyName: string;
    name: string;
    phone: string;
    email: string;
    category?: string;
    storeUrl?: string;
    commercialReg?: string;
    governorate?: string;
    city?: string;
    pickupAddress?: string;
    expectedDailyOrders?: string;
    bankName?: string;
    accountHolder?: string;
    iban?: string;
  }) => { ok: boolean; error?: string; merchant?: Merchant };
  adjustMerchantBalance: (id: string, amount: number, note: string) => Result;
  addDriver: (input: Omit<Driver, 'id' | 'totalDelivered'>) => Result;
  addInventoryItem: (input: Omit<WarehouseItem, 'id' | 'updatedAt' | 'reservedQty' | 'damagedQty'>) => Result;
  bulkAssignOrdersToDriver: (orderIds: string[], driverId: string) => Result;
  createInvoice: (input: Omit<MerchantInvoice, 'id' | 'invoiceNumber' | 'status' | 'issuedAt'>) => Result;
  markInvoicePaid: (id: string) => Result;
  inspectReturnItem: (id: string, outcome: 'RESTOCKED' | 'DAMAGED_SCRAPPED', notes: string, inspector: string) => Result;
  createReturn: (input: Omit<ReturnItemInspection, 'id' | 'returnNumber' | 'inspectionStatus'>) => Result;
  createStockTransfer: (input: Omit<StockTransfer, 'id' | 'transferNumber' | 'status' | 'createdDate'>) => Result;
  updateStockTransferStatus: (id: string, status: StockTransfer['status']) => Result;
  addMerchantTeamMember: (input: Omit<MerchantTeamMember, 'id' | 'createdAt'>) => Result;
  removeMerchantTeamMember: (id: string) => Result;
}

const DataContext = createContext<DataApi | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const api = useMemo<DataApi>(() => {
    const findOrder = (id: string) => state.orders.find((o) => o.id === id);

    return {
      state,

      createOrder(input) {
        const merchant = state.merchants.find((m) => m.id === input.merchantId);
        if (!merchant) return fail('التاجر غير موجود');
        if (input.customerName.trim().length < 3) return fail('اسم العميل قصير جداً');
        if (!isValidEgyptianPhone(input.customerPhone)) return fail('رقم الهاتف غير صحيح (مثال: 01012345678)');
        if (!input.city.trim() || input.address.trim().length < 5) return fail('يرجى إدخال المنطقة والعنوان التفصيلي');
        if (input.lines.length === 0) return fail('أضف صنفاً واحداً على الأقل');

        const items = [];
        for (const line of input.lines) {
          const stock = state.inventory.find((i) => i.merchantId === merchant.id && i.sku === line.sku);
          if (!stock) return fail(`الصنف ${line.sku} غير موجود في المستودع`);
          if (line.qty < 1 || line.qty > stock.availableQty) return fail(`الكمية المتاحة من ${stock.name} هي ${stock.availableQty} فقط`);
          items.push({ id: uid('item'), sku: stock.sku, name: stock.name, qty: line.qty, price: stock.sellingPrice, total: stock.sellingPrice * line.qty });
        }

        const totalAmount = items.reduce((s, i) => s + i.total, 0);
        const shippingFee = calcShippingFee(input.governorate, merchant.shippingDiscountPercent);
        const now = new Date().toISOString();
        const pieces = items.reduce((s, i) => s + i.qty, 0);

        dispatch({
          type: 'ORDER_CREATE',
          order: {
            id: uid('ord'),
            orderNumber: serial('ORD'),
            trackingNumber: `LTX${Date.now().toString().slice(-7)}EGY`,
            merchantId: merchant.id,
            merchantName: merchant.companyName,
            customerName: input.customerName.trim(),
            customerPhone: input.customerPhone.trim(),
            governorate: input.governorate,
            city: input.city.trim(),
            address: input.address.trim(),
            items,
            totalAmount,
            shippingFee,
            codAmount: input.paymentType === 'COD' ? totalAmount + shippingFee : 0,
            paymentType: input.paymentType,
            fulfillmentType: 'WAREHOUSE_FULFILLMENT',
            status: 'CONFIRMED',
            deliveryAttempts: 0,
            createdAt: now,
            updatedAt: now,
            timeline: [
              { status: 'PENDING', title: 'تم إنشاء الطلب', note: `احتساب شحن ${shippingFee} ج.م إلى ${input.governorate}`, timestamp: stamp(), actor: 'بوابة النظام' },
              { status: 'CONFIRMED', title: 'تأكيد وحجز المخزون', note: `حجز ${pieces} قطعة تلقائياً`, timestamp: stamp(), actor: 'محرك WMS' },
            ],
          },
        });
        return ok;
      },

      transitionOrder(orderId, to, opts) {
        const order = findOrder(orderId);
        if (!order) return fail('الطلب غير موجود');
        if (!ORDER_FLOW[order.status].includes(to)) return fail('انتقال غير مسموح في دورة حياة الطلب');
        if (to === 'OUT_FOR_DELIVERY' && !opts.driverId) return fail('اختر السائق أولاً');
        dispatch({ type: 'ORDER_TRANSITION', orderId, to, ...opts });
        return ok;
      },

      createInbound(input) {
        const lines = input.lines.filter((l) => l.qty > 0);
        if (lines.length === 0) return fail('حدد كمية لصنف واحد على الأقل');
        if (!input.expectedArrivalDate) return fail('حدد تاريخ الوصول المتوقع');
        const first = state.inventory.find((i) => i.merchantId === input.merchantId && i.sku === lines[0].sku);
        if (!first) return fail('صنف غير معروف');
        dispatch({
          type: 'INBOUND_CREATE',
          inbound: {
            id: uid('inb'),
            requestNumber: serial('INB'),
            merchantId: input.merchantId,
            warehouseId: first.warehouseId,
            warehouseName: first.warehouseName,
            expectedArrivalDate: input.expectedArrivalDate,
            status: 'PENDING_APPROVAL',
            notes: input.notes?.trim() || undefined,
            createdAt: today(),
            items: lines.map((l) => {
              const item = state.inventory.find((i) => i.merchantId === input.merchantId && i.sku === l.sku);
              return { sku: l.sku, name: item?.name ?? l.sku, requestedQty: l.qty, receivedQty: 0, damagedQty: 0 };
            }),
          },
        });
        return ok;
      },

      setInboundStatus(id, status) {
        const inbound = state.inbounds.find((i) => i.id === id);
        if (!inbound || inbound.status !== 'PENDING_APPROVAL') return fail('لا يمكن تعديل حالة هذا الطلب');
        dispatch({ type: 'INBOUND_SET_STATUS', id, status });
        return ok;
      },

      confirmReceipt(id, lines) {
        const inbound = state.inbounds.find((i) => i.id === id);
        if (!inbound || inbound.status !== 'APPROVED') return fail('يجب اعتماد طلب التوريد قبل الاستلام');
        if (lines.some((l) => l.receivedQty < 0 || l.damagedQty < 0)) return fail('الكميات لا يمكن أن تكون سالبة');
        if (lines.every((l) => l.receivedQty === 0)) return fail('لم يتم استلام أي كمية سليمة');
        dispatch({ type: 'INBOUND_CONFIRM', id, lines });
        return ok;
      },

      requestPayout(merchantId, amount) {
        const merchant = state.merchants.find((m) => m.id === merchantId);
        if (!merchant) return fail('التاجر غير موجود');
        if (!Number.isFinite(amount) || amount < 500) return fail('الحد الأدنى للسحب 500 ج.م');
        if (amount > merchant.availableBalance) return fail('المبلغ يتجاوز الرصيد المتاح');
        dispatch({
          type: 'PAYOUT_REQUEST',
          payout: {
            id: uid('pay'),
            requestNumber: serial('PAY'),
            merchantId,
            amount,
            bankName: merchant.bankName,
            accountHolder: merchant.accountHolder,
            iban: merchant.iban,
            status: 'PENDING',
            requestedAt: stamp(),
          },
        });
        return ok;
      },

      approvePayout(id) {
        if (state.payouts.find((p) => p.id === id)?.status !== 'PENDING') return fail('الطلب ليس قيد المراجعة');
        dispatch({ type: 'PAYOUT_APPROVE', id });
        return ok;
      },

      rejectPayout(id, reason) {
        const status = state.payouts.find((p) => p.id === id)?.status;
        if (status !== 'PENDING' && status !== 'APPROVED') return fail('لا يمكن رفض هذا الطلب');
        if (reason.trim().length < 5) return fail('اكتب سبباً واضحاً للرفض');
        dispatch({ type: 'PAYOUT_REJECT', id, reason: reason.trim() });
        return ok;
      },

      markPayoutPaid(id) {
        if (state.payouts.find((p) => p.id === id)?.status !== 'APPROVED') return fail('يجب اعتماد الطلب قبل الصرف');
        dispatch({ type: 'PAYOUT_PAID', id });
        return ok;
      },

      reconcileManifest(id) {
        const manifest = state.manifests.find((m) => m.id === id);
        if (!manifest || manifest.status !== 'DISPATCHED') return fail('الكشف مغلق بالفعل');
        const open = manifest.orderIds.map(findOrder).filter((o) => o?.status === 'OUT_FOR_DELIVERY');
        if (open.length > 0) return fail(`يوجد ${open.length} شحنة لم يُسجل نتيجتها بعد`);
        dispatch({ type: 'MANIFEST_RECONCILE', id });
        return ok;
      },

      addExpense(input) {
        if (!Number.isFinite(input.amount) || input.amount <= 0) return fail('أدخل قيمة صحيحة للمصروف');
        if (!input.paidTo.trim()) return fail('حدد الجهة المستلمة');
        const acc = state.treasuryAccounts.find((a) => a.id === input.treasuryAccountId);
        if (!acc) return fail('اختر حساب الخزينة أو البنك');
        dispatch({
          type: 'EXPENSE_ADD',
          expense: {
            id: uid('exp'),
            expenseNumber: serial('EXP'),
            category: input.category,
            categoryLabel: input.categoryLabel,
            amount: input.amount,
            paidTo: input.paidTo.trim(),
            treasuryAccountId: acc.id,
            treasuryAccountName: acc.name,
            recordedBy: input.recordedBy,
            status: 'PENDING',
            date: today(),
            notes: input.notes?.trim() || undefined,
          },
        });
        return ok;
      },

      approveExpense(id, actor) {
        const exp = state.expenses.find((e) => e.id === id);
        if (!exp || exp.status !== 'PENDING') return fail('المصروف ليس قيد الانتظار');
        const acc = state.treasuryAccounts.find((a) => a.id === exp.treasuryAccountId);
        if (acc && acc.balance < exp.amount) return fail(`رصيد ${acc.name} غير كافٍ لتغطية المصروف`);
        dispatch({ type: 'EXPENSE_APPROVE', id, actor });
        return ok;
      },

      recordDeliveryAttempt(input) {
        const order = findOrder(input.orderId);
        if (!order) return fail('الطلب غير موجود');
        dispatch({
          type: 'DELIVERY_ATTEMPT_RECORD',
          attempt: {
            id: uid('att'),
            orderId: input.orderId,
            attemptNumber: order.deliveryAttempts + 1,
            driverName: input.driverName,
            reason: input.reason,
            reasonText: input.reasonText,
            notes: input.notes,
            timestamp: stamp(),
          },
        });
        return ok;
      },

      adjustStockQuantity(itemId, deltaAvailable, reason, actor) {
        const item = state.inventory.find((i) => i.id === itemId);
        if (!item) return fail('الصنف غير موجود بالمستودع');
        if (!reason.trim()) return fail('يرجى ذكر سبب تعديل الجرد للرقابة');
        dispatch({ type: 'STOCK_ADJUST', itemId, deltaAvailable, reason: reason.trim(), actor });
        return ok;
      },

      addAuditLog(log) {
        dispatch({
          type: 'AUDIT_LOG_ADD',
          log: {
            ...log,
            id: uid('aud'),
            timestamp: stamp(),
          },
        });
      },

      addMerchant(input) {
        if (!input.companyName.trim()) return fail('اسم الشركة أو المتجر مطلوب');
        if (!input.name.trim()) return fail('اسم الشخص المسؤول مطلوب');
        if (!isValidEgyptianPhone(input.phone)) return fail('رقم هاتف غير صحيح (010xxxxxxx)');
        dispatch({
          type: 'MERCHANT_ADD',
          merchant: {
            ...input,
            id: uid('m'),
            createdAt: today(),
            availableBalance: 0,
            pendingBalance: 0,
          },
        });
        return ok;
      },

      approveMerchant(id, discountPercent) {
        const m = state.merchants.find((item) => item.id === id);
        if (!m) return fail('التاجر غير موجود');
        dispatch({ type: 'MERCHANT_APPROVE', id, discountPercent });
        return ok;
      },

      rejectMerchant(id, reason) {
        const m = state.merchants.find((item) => item.id === id);
        if (!m) return fail('التاجر غير موجود');
        if (!reason.trim()) return fail('يرجى ذكر سبب الرفض لتوضيحه للتاجر');
        dispatch({ type: 'MERCHANT_REJECT', id, reason: reason.trim() });
        return ok;
      },

      registerMerchant(input) {
        if (!input.companyName.trim()) return { ok: false, error: 'اسم المتجر أو العلامة التجارية مطلوب' };
        if (!input.name.trim()) return { ok: false, error: 'اسم الشخص المسؤول مطلوب' };
        if (!isValidEgyptianPhone(input.phone)) return { ok: false, error: 'رقم الهاتف غير صحيح (مثال: 01012345678)' };
        if (!input.email.trim() || !input.email.includes('@')) return { ok: false, error: 'البريد الإلكتروني غير صالح' };

        const newMerchant: Merchant = {
          id: uid('m'),
          name: input.name.trim(),
          companyName: input.companyName.trim(),
          phone: input.phone.trim(),
          email: input.email.trim(),
          status: 'PENDING_APPROVAL',
          availableBalance: 0,
          pendingBalance: 0,
          shippingDiscountPercent: 0,
          bankName: input.bankName || 'البنك الأهلي المصري',
          accountHolder: input.accountHolder || input.name,
          iban: input.iban || 'EG0000000000000000000000000',
          createdAt: today(),
          commercialReg: input.commercialReg || 'تحت التدقيق',
          storeUrl: input.storeUrl,
          category: input.category || 'عام',
          governorate: input.governorate || 'القاهرة',
          city: input.city || 'الرئيسي',
          pickupAddress: input.pickupAddress || '',
          expectedDailyOrders: input.expectedDailyOrders || '20 - 50 شحنة/يوم',
          appliedAt: stamp(),
        };

        dispatch({ type: 'MERCHANT_ADD', merchant: newMerchant });
        return { ok: true, merchant: newMerchant };
      },

      adjustMerchantBalance(id, amount, note) {
        if (!Number.isFinite(amount) || amount === 0) return fail('حدد قيمة صحيحة للتسوية');
        if (!note.trim()) return fail('اكتب سبباً واضحاً للتسوية المحاسبية');
        dispatch({ type: 'MERCHANT_ADJUST_BALANCE', id, amount, note: note.trim() });
        return ok;
      },

      addDriver(input) {
        if (!input.name.trim()) return fail('اسم السائق مطلوب');
        if (!isValidEgyptianPhone(input.phone)) return fail('رقم هاتف غير صحيح');
        if (!input.plateNumber.trim()) return fail('رقم اللوحة المعدنية مطلوب');
        dispatch({
          type: 'DRIVER_ADD',
          driver: {
            ...input,
            id: uid('d'),
            totalDelivered: 0,
          },
        });
        return ok;
      },

      addInventoryItem(input) {
        if (!input.sku.trim()) return fail('رمز SKU مطلوب');
        if (!input.name.trim()) return fail('اسم الصنف مطلوب');
        const exists = state.inventory.some((i) => i.merchantId === input.merchantId && i.sku.toLowerCase() === input.sku.toLowerCase());
        if (exists) return fail('هذا الـ SKU مسجل مسبقاً لنفس التاجر');
        dispatch({
          type: 'INVENTORY_ITEM_ADD',
          item: {
            ...input,
            id: uid('item'),
            reservedQty: 0,
            damagedQty: 0,
            updatedAt: today(),
          },
        });
        return ok;
      },

      bulkAssignOrdersToDriver(orderIds, driverId) {
        if (orderIds.length === 0) return fail('حدد شحنة واحدة على الأقل للإسناد');
        const driver = state.drivers.find((d) => d.id === driverId);
        if (!driver) return fail('اختر السائق أولاً');
        dispatch({ type: 'ORDERS_BULK_ASSIGN', orderIds, driverId });
        return ok;
      },

      createInvoice(input) {
        if (!input.merchantId) return fail('حدد التاجر لإصدار الفاتورة');
        const merchant = state.merchants.find((m) => m.id === input.merchantId);
        dispatch({
          type: 'INVOICE_CREATE',
          invoice: {
            ...input,
            id: uid('inv'),
            invoiceNumber: serial('INV'),
            merchantName: merchant?.companyName || input.merchantName,
            status: 'ISSUED',
            issuedAt: stamp(),
          },
        });
        return ok;
      },

      markInvoicePaid(id) {
        dispatch({ type: 'INVOICE_MARK_PAID', id });
        return ok;
      },

      inspectReturnItem(id, outcome, notes, inspector) {
        const ret = state.returns.find((r) => r.id === id);
        if (!ret) return fail('طلب المرتجع غير موجود');
        dispatch({ type: 'RETURN_INSPECT', id, outcome, notes, inspector });
        return ok;
      },

      createReturn(input) {
        if (!input.orderNumber.trim()) return fail('رقم الشحنة مطلوب');
        dispatch({
          type: 'RETURN_CREATE',
          returnItem: {
            ...input,
            id: uid('ret'),
            returnNumber: serial('RET'),
            inspectionStatus: 'PENDING_INSPECTION',
          },
        });
        return ok;
      },

      createStockTransfer(input) {
        if (input.quantity <= 0) return fail('حدد كمية صالحة للتحويل');
        if (input.fromWarehouse === input.toWarehouse) return fail('لا يمكن التحويل لنفس المستودع');
        dispatch({
          type: 'TRANSFER_CREATE',
          transfer: {
            ...input,
            id: uid('trf'),
            transferNumber: serial('TRF'),
            status: 'DISPATCHED',
            createdDate: today(),
          },
        });
        return ok;
      },

      updateStockTransferStatus(id, status) {
        dispatch({ type: 'TRANSFER_UPDATE_STATUS', id, status });
        return ok;
      },

      addMerchantTeamMember(input) {
        if (!input.name.trim()) return fail('اسم العضو مطلوب');
        if (!input.email.trim()) return fail('البريد الإلكتروني مطلوب');
        dispatch({
          type: 'MERCHANT_TEAM_ADD',
          member: {
            ...input,
            id: uid('mtm'),
            createdAt: today(),
          },
        });
        return ok;
      },

      removeMerchantTeamMember(id) {
        dispatch({ type: 'MERCHANT_TEAM_REMOVE', id });
        return ok;
      },
    };
  }, [state]);

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

/** Live stock total for an inventory line. */
export const totalQty = (i: WarehouseItem) => i.availableQty + i.reservedQty + i.damagedQty;

import type { OrderStatus } from '../types';

export type Tone = 'slate' | 'amber' | 'blue' | 'violet' | 'indigo' | 'cyan' | 'orange' | 'emerald' | 'red';

export const STATUS_META: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'بانتظار التأكيد', tone: 'amber' },
  CONFIRMED: { label: 'مؤكد ومحجوز', tone: 'blue' },
  PICKING: { label: 'جاري السحب', tone: 'violet' },
  PACKING: { label: 'جاري التغليف', tone: 'indigo' },
  READY_FOR_DISPATCH: { label: 'جاهز للتوزيع', tone: 'cyan' },
  OUT_FOR_DELIVERY: { label: 'خرج للتسليم', tone: 'orange' },
  DELIVERED: { label: 'تم التسليم', tone: 'emerald' },
  FAILED: { label: 'فشل التسليم', tone: 'red' },
  RETURNED: { label: 'مرتجع', tone: 'slate' },
  CANCELLED: { label: 'ملغي', tone: 'slate' },
};

/** Allowed next states — the single source of truth for the order lifecycle. */
export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PICKING', 'CANCELLED'],
  PICKING: ['PACKING'],
  PACKING: ['READY_FOR_DISPATCH'],
  READY_FOR_DISPATCH: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  FAILED: ['OUT_FOR_DELIVERY', 'RETURNED'],
  DELIVERED: [],
  RETURNED: [],
  CANCELLED: [],
};

export const TRANSITION_LABEL: Record<OrderStatus, string> = {
  PENDING: 'إعادة للانتظار',
  CONFIRMED: 'تأكيد وحجز المخزون',
  PICKING: 'بدء السحب من الرفوف',
  PACKING: 'تأكيد السحب وبدء التغليف',
  READY_FOR_DISPATCH: 'إتمام التغليف - جاهز للتوزيع',
  OUT_FOR_DELIVERY: 'إسناد لسائق وخروج للتسليم',
  DELIVERED: 'تسجيل التسليم وتحصيل COD',
  FAILED: 'تسجيل محاولة فاشلة',
  RETURNED: 'إغلاق كمرتجع وإعادة للمخزون',
  CANCELLED: 'إلغاء الطلب',
};

export const TRANSITION_PERMISSION: Record<OrderStatus, string> = {
  PENDING: 'orders.edit',
  CONFIRMED: 'orders.confirm',
  PICKING: 'warehouse.picking.manage',
  PACKING: 'warehouse.packing.manage',
  READY_FOR_DISPATCH: 'warehouse.packing.manage',
  OUT_FOR_DELIVERY: 'shipments.assign_driver',
  DELIVERED: 'shipments.confirm_delivery',
  FAILED: 'shipments.update_status',
  RETURNED: 'shipments.process_return',
  CANCELLED: 'orders.delete',
};

/** States in which order lines are holding reserved stock. */
export const RESERVING_STATES: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PICKING', 'PACKING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'FAILED',
];

export const TRACKING_STEPS: { label: string; reachedBy: OrderStatus[] }[] = [
  { label: 'استلام الطلب', reachedBy: ['PENDING', 'CONFIRMED', 'PICKING', 'PACKING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'FAILED', 'DELIVERED'] },
  { label: 'تجهيز الطرد', reachedBy: ['PACKING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'FAILED', 'DELIVERED'] },
  { label: 'خرج للتسليم', reachedBy: ['OUT_FOR_DELIVERY', 'FAILED', 'DELIVERED'] },
  { label: 'تم التسليم', reachedBy: ['DELIVERED'] },
];

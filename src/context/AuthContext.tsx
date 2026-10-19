import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AdminRole, MerchantRole, PortalType, UserSession } from '../types';
import { SYSTEM_PERMISSIONS } from '../data/permissionsList';
import { SEED_MERCHANTS } from '../data/mockData';

const ALL_ADMIN = SYSTEM_PERMISSIONS.map((p) => p.key);
const byModules = (...modules: string[]) =>
  SYSTEM_PERMISSIONS.filter((p) => modules.includes(p.module)).map((p) => p.key);

export const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: ALL_ADMIN,
  OPERATIONS: byModules('orders', 'shipments', 'drivers'),
  WAREHOUSE_MGR: [...byModules('warehouse'), 'orders.view', 'orders.print_waybill', 'warehouse.picking.manage'],
  FINANCE_HEAD: [...byModules('finance', 'merchants'), 'orders.view', 'drivers.view', 'drivers.cash_close'],
};

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: 'مدير عام',
  OPERATIONS: 'مدير تشغيل',
  WAREHOUSE_MGR: 'مشرف مستودعات',
  FINANCE_HEAD: 'رئيس الحسابات',
};

/** Merchant portal capabilities (scoped to the merchant's own tenant data). */
export const MERCHANT_ROLE_PERMISSIONS: Record<MerchantRole, string[]> = {
  OWNER: ['m.orders', 'm.orders.create', 'm.inventory', 'm.inbound', 'm.wallet', 'm.api'],
  ADMIN: ['m.orders', 'm.orders.create', 'm.inventory', 'm.inbound', 'm.wallet'],
  STAFF: ['m.orders', 'm.orders.create', 'm.inventory'],
  ACCOUNTANT: ['m.orders', 'm.wallet'],
  WAREHOUSE_VIEWER: ['m.inventory', 'm.inbound'],
};

export const MERCHANT_ROLE_LABEL: Record<MerchantRole, string> = {
  OWNER: 'مالك المتجر',
  ADMIN: 'مدير المتجر',
  STAFF: 'موظف طلبات',
  ACCOUNTANT: 'محاسب',
  WAREHOUSE_VIEWER: 'مشاهد مخزون',
};

interface AuthContextValue {
  portal: PortalType;
  setPortal: (portal: PortalType) => void;
  user: UserSession;
  activeMerchantId: string;
  setActiveMerchantId: (id: string) => void;
  setAdminRole: (role: AdminRole) => void;
  setMerchantRole: (role: MerchantRole) => void;
  can: (permission: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [portal, setPortal] = useState<PortalType>('ADMIN');
  const [adminRole, setAdminRole] = useState<AdminRole>('SUPER_ADMIN');
  const [merchantRole, setMerchantRole] = useState<MerchantRole>('OWNER');
  const [activeMerchantId, setActiveMerchantId] = useState(SEED_MERCHANTS[0].id);

  const user = useMemo<UserSession>(() => {
    if (portal === 'AUTH') {
      return {
        id: 'usr-guest',
        name: 'زائر النظام',
        email: 'guest@logisttex.com',
        portal,
        permissions: [],
      };
    }
    if (portal === 'MERCHANT') {
      const merchant = SEED_MERCHANTS.find((m) => m.id === activeMerchantId) ?? SEED_MERCHANTS[0];
      return {
        id: `usr-${merchant.id}`,
        name: merchant.name,
        email: merchant.email,
        portal,
        merchantRole,
        permissions: MERCHANT_ROLE_PERMISSIONS[merchantRole],
      };
    }
    return {
      id: 'usr-admin-1',
      name: 'م. كريم الرداد',
      email: 'admin@logisttex.com',
      portal,
      adminRole,
      permissions: ADMIN_ROLE_PERMISSIONS[adminRole],
    };
  }, [portal, adminRole, merchantRole, activeMerchantId]);

  const can = useCallback((permission: string) => user.permissions.includes(permission), [user]);

  const logout = useCallback(() => {
    setPortal('AUTH');
  }, []);

  const value = useMemo(
    () => ({ portal, setPortal, user, activeMerchantId, setActiveMerchantId, setAdminRole, setMerchantRole, can, logout }),
    [portal, user, activeMerchantId, can, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

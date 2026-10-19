import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, type NavId } from './components/layout/Sidebar';
import { GlobalSearch } from './components/layout/GlobalSearch';
import { OrderDetailsModal } from './components/orders/OrderDetailsModal';
import { WaybillPrintModal } from './components/orders/WaybillPrintModal';
import { NewOrderModal } from './components/orders/NewOrderModal';
import { WarehouseReceiptModal } from './components/warehouse/WarehouseReceiptModal';
import { PayoutActionModal } from './components/finance/PayoutActionModal';
import { PublicTrackingView } from './components/tracking/PublicTrackingView';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { OrdersPage } from './pages/admin/OrdersPage';
import { WarehousesPage } from './pages/admin/WarehousesPage';
import { DriversPage } from './pages/admin/DriversPage';
import { FinancePage } from './pages/admin/FinancePage';
import { PricingPage } from './pages/admin/PricingPage';
import { MerchantsPage } from './pages/admin/MerchantsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { RolesSettingsPage } from './pages/admin/RolesSettingsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

import { MerchantDashboard } from './pages/merchant/MerchantDashboard';
import { MerchantOrdersPage } from './pages/merchant/MerchantOrdersPage';
import { MerchantInventoryPage } from './pages/merchant/MerchantInventoryPage';
import { MerchantInboundPage } from './pages/merchant/MerchantInboundPage';
import { MerchantReturnsPage } from './pages/merchant/MerchantReturnsPage';
import { MerchantWalletPage } from './pages/merchant/MerchantWalletPage';
import { MerchantInvoicesPage } from './pages/merchant/MerchantInvoicesPage';
import { MerchantTeamPage } from './pages/merchant/MerchantTeamPage';
import { MerchantApiTokensPage } from './pages/merchant/MerchantApiTokensPage';
import { MerchantReportsPage } from './pages/merchant/MerchantReportsPage';
import { MerchantSettingsPage } from './pages/merchant/MerchantSettingsPage';

import { MerchantAuthModal } from './components/merchant/MerchantAuthModal';
import { MerchantPendingScreen } from './components/merchant/MerchantPendingScreen';
import { MerchantRejectedScreen } from './components/merchant/MerchantRejectedScreen';
import { AuthPage } from './pages/auth/AuthPage';
import { useData } from './context/DataContext';

import type { InboundRequest, Order, PayoutRequest } from './types';

function MainLayout() {
  const { portal, activeMerchantId } = useAuth();
  const { state: dataState } = useData();
  const activeMerchant = dataState.merchants.find((m) => m.id === activeMerchantId);
  const [isMerchantAuthOpen, setIsMerchantAuthOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<NavId>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [printOrders, setPrintOrders] = useState<Order[]>([]);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedInbound, setSelectedInbound] = useState<InboundRequest | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync activeTab when switching portal
  useEffect(() => {
    if (portal === 'ADMIN') {
      setActiveTab('dashboard');
    } else if (portal === 'MERCHANT') {
      setActiveTab('m-dashboard');
    }
  }, [portal]);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Unified Auth & Onboarding Gateway
  if (portal === 'AUTH') {
    return <AuthPage />;
  }

  // Public Tracking Portal View
  if (portal === 'TRACKING') {
    return (
      <div className="min-h-screen app-container text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenMerchantAuth={() => setIsMerchantAuthOpen(true)}
        />
        <PublicTrackingView />
        <GlobalSearch
          open={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectOrder={(id) => setSelectedOrderId(id)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-container text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenMerchantAuth={() => setIsMerchantAuthOpen(true)}
      />

      <div className="flex-1 flex w-full">
        <Sidebar
          active={activeTab}
          onNavigate={(id) => setActiveTab(id)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden animate-page">
          {/* Admin Views */}
          {portal === 'ADMIN' && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard
                  onOpenNewOrder={() => setIsNewOrderOpen(true)}
                  onSelectOrder={(id) => setSelectedOrderId(id)}
                  onNavigateTab={(t) => setActiveTab(t)}
                />
              )}
              {activeTab === 'orders' && (
                <OrdersPage
                  onOpenNewOrder={() => setIsNewOrderOpen(true)}
                  onSelectOrder={(id) => setSelectedOrderId(id)}
                  onPrintWaybills={(orders) => setPrintOrders(orders)}
                />
              )}
              {activeTab === 'warehouse' && (
                <WarehousesPage onOpenReceiptModal={(inb) => setSelectedInbound(inb)} />
              )}
              {activeTab === 'drivers' && <DriversPage />}
              {activeTab === 'finance' && (
                <FinancePage onOpenPayoutModal={(p) => setSelectedPayout(p)} />
              )}
              {activeTab === 'pricing' && <PricingPage />}
              {activeTab === 'merchants' && <MerchantsPage />}
              {activeTab === 'reports' && <AdminReportsPage />}
              {activeTab === 'audit' && <AuditLogsPage />}
              {activeTab === 'roles' && <RolesSettingsPage />}
              {activeTab === 'settings' && <AdminSettingsPage />}
            </>
          )}

          {/* Merchant Views */}
          {portal === 'MERCHANT' && (
            activeMerchant?.status === 'PENDING_APPROVAL' ? (
              <MerchantPendingScreen merchant={activeMerchant} />
            ) : activeMerchant?.status === 'REJECTED' ? (
              <MerchantRejectedScreen
                merchant={activeMerchant}
                onReapply={() => setIsMerchantAuthOpen(true)}
              />
            ) : (
              <>
                {activeTab === 'm-dashboard' && (
                  <MerchantDashboard
                    onOpenNewOrder={() => setIsNewOrderOpen(true)}
                    onSelectOrder={(id) => setSelectedOrderId(id)}
                    onNavigateTab={(t) => setActiveTab(t)}
                  />
                )}
                {activeTab === 'm-orders' && (
                  <MerchantOrdersPage
                    onOpenNewOrder={() => setIsNewOrderOpen(true)}
                    onSelectOrder={(id) => setSelectedOrderId(id)}
                    onPrintWaybills={(orders) => setPrintOrders(orders)}
                  />
                )}
                {activeTab === 'm-inventory' && <MerchantInventoryPage />}
                {activeTab === 'm-inbound' && <MerchantInboundPage />}
                {activeTab === 'm-returns' && <MerchantReturnsPage />}
                {activeTab === 'm-wallet' && <MerchantWalletPage />}
                {activeTab === 'm-invoices' && <MerchantInvoicesPage />}
                {activeTab === 'm-reports' && <MerchantReportsPage />}
                {activeTab === 'm-team' && <MerchantTeamPage />}
                {activeTab === 'm-api' && <MerchantApiTokensPage />}
                {activeTab === 'm-settings' && <MerchantSettingsPage />}
              </>
            )
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <OrderDetailsModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        onPrint={(orders) => setPrintOrders(orders)}
      />

      <WaybillPrintModal
        orders={printOrders}
        onClose={() => setPrintOrders([])}
      />

      {isNewOrderOpen && (
        <NewOrderModal onClose={() => setIsNewOrderOpen(false)} />
      )}

      <WarehouseReceiptModal
        inbound={selectedInbound}
        onClose={() => setSelectedInbound(null)}
      />

      <PayoutActionModal
        payout={selectedPayout}
        onClose={() => setSelectedPayout(null)}
      />

      <GlobalSearch
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectOrder={(id) => setSelectedOrderId(id)}
      />

      <MerchantAuthModal
        isOpen={isMerchantAuthOpen}
        onClose={() => setIsMerchantAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <MainLayout />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider, AuthProvider, useAuth } from './context/DataContext';

// Core CMMS Layout & Components
import SidebarLayout from './components/SidebarLayout';
import ToastContainer from './components/ToastContainer';
import CreateWorkOrderModal from './components/CreateWorkOrderModal';
import QrScannerModal from './components/QrScannerModal';

// CMMS Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AssetsPage from './pages/AssetsPage';
import LocationsPage from './pages/LocationsPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import InventoryPage from './pages/InventoryPage';
import IoTSimulatorPage from './pages/IoTSimulatorPage';
import SchedulesPage from './pages/SchedulesPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';

// UI Branch Layouts & Pages
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';
import CreateUser from './pages/tempt';

// URL path to CMMS Tab mapping
const pathToTab = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/equipment': 'assets',
  '/assets': 'assets',
  '/locations': 'locations',
  '/work-orders': 'work-orders',
  '/maintenance': 'schedules',
  '/schedules': 'schedules',
  '/inventory': 'inventory',
  '/lot-monitoring': 'iot',
  '/iot': 'iot',
  '/personnel': 'users',
  '/users': 'users',
  '/reports': 'reports',
  '/audit-logs': 'audit',
  '/audit': 'audit',
};

// CMMS Tab to URL path mapping
const tabToPath = {
  dashboard: '/',
  assets: '/equipment',
  locations: '/locations',
  'work-orders': '/work-orders',
  schedules: '/maintenance',
  inventory: '/inventory',
  iot: '/lot-monitoring',
  users: '/personnel',
  reports: '/reports',
  audit: '/audit-logs',
};

function MainApp() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = pathToTab[location.pathname] || 'dashboard';
  const [activeTab, setActiveTabState] = useState(currentTab);

  // Sync activeTab whenever URL route changes
  useEffect(() => {
    if (pathToTab[location.pathname]) {
      setActiveTabState(pathToTab[location.pathname]);
    }
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTabState(tabId);
    const targetPath = tabToPath[tabId] || '/';
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  // Global modals and cross-navigation
  const [isCreateWoOpen, setIsCreateWoOpen] = useState(false);
  const [createWoInitialData, setCreateWoInitialData] = useState(null);
  const [selectedWoForDetail, setSelectedWoForDetail] = useState(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState(null);

  // If not authenticated, show interactive Figma login screen
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Cross-page navigation helpers
  const handleOpenCreateWo = (initialData = null) => {
    setCreateWoInitialData(initialData);
    setIsCreateWoOpen(true);
  };

  const handleSelectWoFromDashboard = (wo) => {
    setSelectedWoForDetail(wo);
    handleTabChange('work-orders');
  };

  const handleSelectAssetForWo = (asset) => {
    handleOpenCreateWo({
      asset_id: asset.id,
      title: `Bảo trì kỹ thuật cho ${asset.name}`,
      priority: asset.priority,
      description: `Kiểm tra định kỳ và đánh giá hiệu năng cho thiết bị ${asset.asset_code}`
    });
  };

  const handleViewAssetFromQr = (asset) => {
    setSelectedAssetForDetail(asset);
    handleTabChange('assets');
  };

  const handleCreateWoFromQr = (asset) => {
    handleSelectAssetForWo(asset);
  };

  const handleGenerateWoFromSchedule = (schedule) => {
    handleOpenCreateWo({
      asset_id: schedule.asset_id,
      schedule_id: schedule.id,
      title: schedule.title,
      wo_type: 'PREVENTIVE',
      priority: schedule.badge_color === 'danger' ? 'CRITICAL' : 'HIGH',
      description: `Lệnh việc tự động sinh từ kế hoạch bảo trì định kỳ: ${schedule.title} (${schedule.schedule_type})`
    });
  };

  return (
    <SidebarLayout
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      onOpenCreateWo={() => handleOpenCreateWo(null)}
      onOpenQrScanner={() => setIsQrScannerOpen(true)}
    >
      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Global Create Work Order Modal */}
      <CreateWorkOrderModal
        isOpen={isCreateWoOpen}
        onClose={() => {
          setIsCreateWoOpen(false);
          setCreateWoInitialData(null);
        }}
        initialData={createWoInitialData}
      />

      {/* Global QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onViewAsset={handleViewAssetFromQr}
        onCreateWoForAsset={handleCreateWoFromQr}
      />

      {/* Active Tab View */}
      {activeTab === 'dashboard' && (
        <Dashboard
          onNavigate={(tab) => handleTabChange(tab)}
          onOpenCreateWo={() => handleOpenCreateWo(null)}
          onSelectWo={handleSelectWoFromDashboard}
        />
      )}

      {activeTab === 'assets' && (
        <AssetsPage
          onSelectAssetForWo={handleSelectAssetForWo}
          onOpenQrScanner={() => setIsQrScannerOpen(true)}
          selectedAssetFromExternal={selectedAssetForDetail}
          onClearSelectedAsset={() => setSelectedAssetForDetail(null)}
        />
      )}

      {activeTab === 'locations' && (
        <LocationsPage />
      )}

      {activeTab === 'work-orders' && (
        <WorkOrdersPage
          onOpenCreateWo={() => handleOpenCreateWo(null)}
          selectedWoFromExternal={selectedWoForDetail}
          onClearSelectedWo={() => setSelectedWoForDetail(null)}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryPage />
      )}

      {activeTab === 'iot' && (
        <IoTSimulatorPage
          onTriggerEmergencyWo={(emergencyData) => handleOpenCreateWo(emergencyData)}
        />
      )}

      {activeTab === 'schedules' && (
        <SchedulesPage
          onGenerateWoFromSchedule={handleGenerateWoFromSchedule}
        />
      )}

      {activeTab === 'users' && (
        <UsersPage />
      )}

      {activeTab === 'reports' && (
        <ReportsPage />
      )}

      {activeTab === 'audit' && (
        <AuditLogsPage />
      )}
    </SidebarLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes from UI branch */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-otp" element={<VerifyOTP />} />
        <Route path="reset-password" element={<ResetPassword />} />
      </Route>

      {/* Auth direct shortcuts */}
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
      <Route path="/verify-otp" element={<AuthLayout><VerifyOTP /></AuthLayout>} />
      <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />

      {/* Standalone UI pages */}
      <Route path="/tempt" element={<CreateUser />} />
      <Route path="/v2/*" element={<MainLayout />} />

      {/* Main CMMS application & all feature routes */}
      <Route path="*" element={<MainApp />} />
    </Routes>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </DataProvider>
  );
}

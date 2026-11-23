import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { DataProvider, AuthProvider, useAuth } from './context/DataContext';
import { canAccessPage, canCreateOnPage } from './constants/permissions';

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
import ProfilePage from './pages/ProfilePage';

// UI Branch Layouts & Pages
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';

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
  '/profile': 'profile',
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
  profile: '/profile',
};

function MainApp() {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = pathToTab[location.pathname] || 'dashboard';
  const role = currentUser?.role;
  const hasAccess = canAccessPage(role, activeTab);

  const handleTabChange = (tabId) => {
    if (!canAccessPage(role, tabId)) return;
    const targetPath = tabToPath[tabId] || '/';
    if (location.pathname !== targetPath || location.search) {
      navigate(targetPath);
    }
  };

  // Global modals and cross-navigation
  const [isCreateWoOpen, setIsCreateWoOpen] = useState(false);
  const [createWoInitialData, setCreateWoInitialData] = useState(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // If not authenticated, show interactive Figma login screen
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Cross-page navigation helpers
  const handleOpenCreateWo = (initialData = null) => {
    if (!canCreateOnPage(role, 'work-orders')) return;
    setCreateWoInitialData(initialData);
    setIsCreateWoOpen(true);
  };

  const handleSelectWoFromDashboard = (wo) => {
    if (wo) navigate('/work-orders?order=' + wo.id);
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
    if (asset) navigate('/equipment?asset=' + asset.id);
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
      description: `Lệnh việc tự động sinh từ kế hoạch bảo trì định kỳ: ${schedule.title} (${schedule.schedule_type})`,
      parts: schedule.parts || []
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
      {!hasAccess ? (
        <div className="risova-page flex items-center justify-center py-20">
          <div className="bg-white border border-[#DBE2EF] rounded-xl p-8 max-w-md w-full text-center space-y-4">
            <div className="mx-auto size-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <h1 className="text-xl font-bold text-[#112D4E]">Không có quyền truy cập</h1>
            <p className="text-sm text-[#64748B]">
              Vai trò hiện tại của bạn không được cấp quyền truy cập vào trang này.
            </p>
            <button
              type="button"
              onClick={() => handleTabChange('dashboard')}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#3F72AF] hover:bg-[#325d91] text-white rounded-lg text-sm font-semibold"
            >
              Về Bảng điều khiển
            </button>
          </div>
        </div>
      ) : (
        <>
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
              onSelectWorkOrder={handleSelectWoFromDashboard}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
            />
          )}

          {activeTab === 'locations' && (
            <LocationsPage onSelectAsset={handleViewAssetFromQr} />
          )}

          {activeTab === 'work-orders' && (
            <WorkOrdersPage
              onOpenCreateWo={() => handleOpenCreateWo(null)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage />
          )}

          {activeTab === 'iot' && (
            <IoTSimulatorPage
              onTriggerEmergencyWo={(emergencyData) => handleOpenCreateWo(emergencyData)}
              onSelectWorkOrder={handleSelectWoFromDashboard}
            />
          )}

          {activeTab === 'schedules' && (
            <SchedulesPage
              onGenerateWoFromSchedule={handleGenerateWoFromSchedule}
              onSelectAsset={handleViewAssetFromQr}
              onSelectWorkOrder={handleSelectWoFromDashboard}
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
          {activeTab === 'profile' && <ProfilePage />}
        </>
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

import React, { useState } from 'react';
import { DataProvider, AuthProvider, useAuth } from './context/DataContext';
import SidebarLayout from './components/SidebarLayout';
import ToastContainer from './components/ToastContainer';
import CreateWorkOrderModal from './components/CreateWorkOrderModal';
import QrScannerModal from './components/QrScannerModal';

// Pages
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

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Global modals and cross-navigation
  const [isCreateWoOpen, setIsCreateWoOpen] = useState(false);
  const [createWoInitialData, setCreateWoInitialData] = useState(null);
  const [selectedWoForDetail, setSelectedWoForDetail] = useState(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState(null);

  // If not authenticated, show Figma-accurate login screen
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
    setActiveTab('work-orders');
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
    setActiveTab('assets');
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
      setActiveTab={setActiveTab}
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
          onNavigate={(tab) => setActiveTab(tab)}
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

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </DataProvider>
  );
}

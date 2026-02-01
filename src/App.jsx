import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from './hooks/useStore';
import { VoiceProvider } from './contexts/VoiceContext';
import { ModeProvider } from './contexts/ModeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout components
import Sidebar from './components/layout/Sidebar';
import NavBar from './components/layout/NavBar';
import Notification from './components/layout/Notification';
import VoiceButton from './components/voice/VoiceButton';
import VoiceDisplay from './components/voice/VoiceDisplay';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrdersPage from './pages/OrdersPage';
import CreatePurchasePage from './pages/CreatePurchasePage';
import PurchasesPage from './pages/PurchasesPage';
import DebtPage from './pages/DebtPage';
import CustomersPage from './pages/CustomersPage';
import ProductsPage from './pages/ProductsPage';
import BackupPage from './pages/BackupPage';
import InventoryReportPage from './pages/InventoryReportPage';

// Loading Screen
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
      <p className="text-sm text-gray-400 mt-1">Phương Lê Store</p>
    </div>
  </div>
);

// Error Screen
const ErrorScreen = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4">
    <div className="text-center">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl">⚠️</span>
      </div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h1>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-violet-500 text-white rounded-xl font-semibold hover:bg-violet-600 transition-colors"
      >
        Tải lại trang
      </button>
    </div>
  </div>
);

// Dev Mode Warning Banner
const DevModeBanner = () => {
  const { isDevMode } = useAuth();

  if (!isDevMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-900 px-4 py-2 text-center text-sm font-medium shadow-md">
      <span className="mr-2">⚠️</span>
      DEV MODE - Authentication bypassed. Dữ liệu có thể không được lưu vào Supabase.
      <span className="ml-2">⚠️</span>
    </div>
  );
};

// Protected Layout Component
const ProtectedLayout = ({ children }) => {
  const { isLoading, error, initialize } = useStore();
  const { isDevMode } = useAuth();

  // Initialize data on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen
  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <ModeProvider>
      <VoiceProvider>
        <div className={`min-h-screen bg-gray-50 ${isDevMode ? 'pt-10' : ''}`}>
          {/* Dev Mode Warning */}
          <DevModeBanner />

          {/* Notification */}
          <Notification />

          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Mobile Bottom Nav */}
          <NavBar />

          {/* Voice Components */}
          <VoiceButton />
          <VoiceDisplay />

          {/* Main Content - with padding for sidebar */}
          <main className="lg:ml-64 min-h-screen pb-20 lg:pb-6">
            {children}
          </main>
        </div>
      </VoiceProvider>
    </ModeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/create-order" element={<CreateOrderPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/create-purchase" element={<CreatePurchasePage />} />
                  <Route path="/purchases" element={<PurchasesPage />} />
                  <Route path="/inventory-report" element={<InventoryReportPage />} />
                  <Route path="/debt" element={<DebtPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/backup" element={<BackupPage />} />
                </Routes>
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;

// Main App component
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, useRoleGuard } from './hooks';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import QuotationBuilder from './pages/QuotationBuilder';
import QuotationReview from './pages/QuotationReview';
import POImport from './pages/POImport';
import CoilScan from './pages/CoilScan';
import UsageEntry from './pages/UsageEntry';
import StockBalance from './pages/StockBalance';
import WarrantyLookup from './pages/WarrantyLookup';
import DPRReport from './pages/DPRReport';
import LoadingSpinner from './components/LoadingSpinner';

// Role-based route guard
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { hasAccess, loading } = useRoleGuard(allowedRoles);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Auth guard
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        
        {/* Superadmin only routes */}
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/products" element={
          <ProtectedRoute allowedRoles={['superadmin', 'sales']}>
            <ProductsPage />
          </ProtectedRoute>
        } />
        
        {/* Sales routes */}
        <Route path="/clients" element={
          <ProtectedRoute allowedRoles={['superadmin', 'sales']}>
            <ClientsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/quotations/new" element={
          <ProtectedRoute allowedRoles={['superadmin', 'sales']}>
            <QuotationBuilder />
          </ProtectedRoute>
        } />
        
        <Route path="/quotations/:id/review" element={
          <ProtectedRoute allowedRoles={['superadmin', 'sales']}>
            <QuotationReview />
          </ProtectedRoute>
        } />
        
        {/* Warehouse routes */}
        <Route path="/po-import" element={
          <ProtectedRoute allowedRoles={['superadmin', 'warehouse']}>
            <POImport />
          </ProtectedRoute>
        } />
        
        <Route path="/coil-scan" element={
          <ProtectedRoute allowedRoles={['superadmin', 'warehouse']}>
            <CoilScan />
          </ProtectedRoute>
        } />
        
        <Route path="/usage" element={
          <ProtectedRoute allowedRoles={['superadmin', 'warehouse']}>
            <UsageEntry />
          </ProtectedRoute>
        } />
        
        <Route path="/stock" element={
          <ProtectedRoute allowedRoles={['superadmin', 'warehouse']}>
            <StockBalance />
          </ProtectedRoute>
        } />
        
        {/* All authenticated users */}
        <Route path="/warranty" element={
          <AuthGuard>
            <WarrantyLookup />
          </AuthGuard>
        } />
        
        <Route path="/dpr" element={
          <ProtectedRoute allowedRoles={['superadmin', 'warehouse']}>
            <DPRReport />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

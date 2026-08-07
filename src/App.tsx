import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { PublicResultsPage } from './pages/PublicResultsPage';
import { VerifyQRPage } from './pages/VerifyQRPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { AboutPage } from './pages/AboutPage';
import { HostEventPage } from './pages/HostEventPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';
import { NewsPage } from './pages/NewsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ParticipantDashboardPage } from './pages/ParticipantDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminCheckInPage } from './pages/AdminCheckInPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

import { RpcLayout } from './components/layout/RpcLayout';
import { RpcDashboardPage } from './pages/rpc/RpcDashboardPage';

const AppRoutes: React.FC = () => {
  const { settings } = useSettings();
  const isRpcDomain = window.location.hostname.includes('rpc.');

  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  // If we are on the RPC domain, ONLY serve the RPC app
  if (isRpcDomain) {
    return (
      <Routes>
        <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZER']}>
              <RpcLayout>
                <RpcDashboardPage />
              </RpcLayout>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Public Pages with Navbar + Footer */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/events" element={<PublicLayout><EventsPage /></PublicLayout>} />
      <Route path="/events/:slug" element={<PublicLayout><EventDetailPage /></PublicLayout>} />
      <Route path="/results" element={<PublicLayout><PublicResultsPage /></PublicLayout>} />
      <Route path="/verify/:token" element={<PublicLayout><VerifyQRPage /></PublicLayout>} />
      <Route path="/payment/success" element={<PublicLayout><PaymentSuccessPage /></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/host-event" element={<PublicLayout><HostEventPage /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
      <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />

      {/* ===== AUTH PAGES — Minimal, centered ===== */}
      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
      <Route path="/reset-password" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />

      {/* ===== PARTICIPANT DASHBOARD — Sidebar layout ===== */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ParticipantDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      {/* ===== ADMIN PAGES — Admin sidebar layout ===== */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZER']}>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback RPC Route (if not using subdomain) */}
      <Route 
        path="/rpc" 
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZER']}>
            <RpcLayout>
              <RpcDashboardPage />
            </RpcLayout>
          </ProtectedRoute>
        } 
      />

      {/* Fallback old check-in path -> redirects to RPC or Admin Dashboard */}
      <Route 
        path="/admin/check-in" 
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'ORGANIZER']}>
            <AdminLayout>
              <AdminCheckInPage />
            </AdminLayout>
          </ProtectedRoute>
        } 
      />

      {/* ===== STANDALONE PAGES — No layout wrapper ===== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

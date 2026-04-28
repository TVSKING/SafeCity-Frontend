import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DeviceProvider } from './context/DeviceContext';
import { PerformanceProvider } from './context/PerformanceContext';
import Navbar from './components/Navbar';
import BroadcastNotification from './components/BroadcastNotification';
import CommunityAlertToast from './components/CommunityAlertToast';
import OperationNotification from './components/OperationNotification';
import DemoDisclaimer from './components/DemoDisclaimer';

// ⚡ LAZY LOADING FOR PERFORMANCE
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Activate = lazy(() => import('./pages/Activate'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DepartmentDashboard = lazy(() => import('./pages/DepartmentDashboard'));
const ManageAccounts = lazy(() => import('./pages/ManageAccounts'));
const BentoDashboard = lazy(() => import('./pages/BentoDashboard'));
const CollaborationHub = lazy(() => import('./pages/CollaborationHub'));
const LiveDispatchMap = lazy(() => import('./pages/LiveDispatchMap'));
const ManageInventory = lazy(() => import('./pages/ManageInventory'));
const Profile = lazy(() => import('./pages/Profile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const IncidentHistory = lazy(() => import('./pages/IncidentHistory'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optimizing Resource Load...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return children;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <PerformanceProvider>
        <DeviceProvider>
          <div className="min-h-screen bg-gray-50">
            <DemoDisclaimer />
            <Navbar />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/activate" element={<Activate />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/accounts" element={<ProtectedRoute role="admin"><ManageAccounts /></ProtectedRoute>} />
                <Route path="/admin/history" element={<ProtectedRoute role="admin"><IncidentHistory /></ProtectedRoute>} />
                <Route path="/bento" element={<ProtectedRoute role="admin"><BentoDashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute role="department"><DepartmentDashboard /></ProtectedRoute>} />
                <Route path="/manage-inventory" element={<ProtectedRoute role="department"><ManageInventory /></ProtectedRoute>} />
                <Route path="/dispatch" element={<ProtectedRoute><LiveDispatchMap /></ProtectedRoute>} />
                <Route path="/collaboration" element={<CollaborationHub />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              </Routes>
            </Suspense>
            <BroadcastNotification />
            <CommunityAlertToast />
            <OperationNotification />
          </div>
        </DeviceProvider>
      </PerformanceProvider>
    </AuthProvider>
  );
}

export default App;

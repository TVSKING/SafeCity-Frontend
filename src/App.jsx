import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Activate from './pages/Activate';
import AdminDashboard from './pages/AdminDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import ManageAccounts from './pages/ManageAccounts';
import BentoDashboard from './pages/BentoDashboard';
import CollaborationHub from './pages/CollaborationHub';
import LiveDispatchMap from './pages/LiveDispatchMap';
import ManageInventory from './pages/ManageInventory';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import IncidentHistory from './pages/IncidentHistory';
import MyReports from './pages/MyReports';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Navbar from './components/Navbar';
import BroadcastNotification from './components/BroadcastNotification';
import DemoDisclaimer from './components/DemoDisclaimer';
import { DeviceProvider } from './context/DeviceContext';



const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  // Admins can access everything
  if (user.role === 'admin') return children;
  
  // Otherwise, check for specific role requirement
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <div className="min-h-screen bg-gray-50">
          <DemoDisclaimer />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activate" element={<Activate />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/admin" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/accounts" element={
              <ProtectedRoute role="admin">
                <ManageAccounts />
              </ProtectedRoute>
            } />
            <Route path="/admin/history" element={
              <ProtectedRoute role="admin">
                <IncidentHistory />
              </ProtectedRoute>
            } />

            <Route path="/bento" element={
              <ProtectedRoute role="admin">
                <BentoDashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute role="department">
                <DepartmentDashboard />
              </ProtectedRoute>
            } />

            <Route path="/manage-inventory" element={
              <ProtectedRoute role="department">
                <ManageInventory />
              </ProtectedRoute>
            } />

            <Route path="/dispatch" element={
              <ProtectedRoute>
                <LiveDispatchMap />
              </ProtectedRoute>
            } />

            <Route path="/collaboration" element={<CollaborationHub />} />
            <Route path="/my-reports" element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
          </Routes>
          <BroadcastNotification />
        </div>
      </DeviceProvider>
    </AuthProvider>
  );
}

export default App;

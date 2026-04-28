import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDevice } from '../context/DeviceContext';
import { ShieldAlert, LogOut, User as UserIcon, LayoutDashboard, Users, Zap, Menu, X, Clock } from 'lucide-react';


const Navbar = () => {
  const { user, logout } = useAuth();
  const { isMobile, deviceType } = useDevice();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-black tracking-tight text-gray-900">SafeCity</span>
          </Link>

          {/* Desktop/Tablet Menu */}
          {!isMobile && (
            <div className="flex items-center gap-6">
              <Link to="/collaboration" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-all flex items-center gap-1">
                <Users className="w-4 h-4" /> Hub
              </Link>

              {user && (
                <div className="flex items-center gap-4">
                  {user.role === 'admin' ? (
                    <>
                      <Link to="/admin" className="text-sm font-bold text-gray-500 hover:text-red-600 flex items-center gap-1">
                        <LayoutDashboard className="w-4 h-4" /> Operations
                      </Link>
                      <Link to="/bento" className="text-sm font-bold text-gray-500 hover:text-red-600 flex items-center gap-1">
                        <Zap className="w-4 h-4 text-orange-500" /> Bento
                      </Link>
                      <Link to="/admin/accounts" className="text-sm font-bold text-gray-500 hover:text-red-600 flex items-center gap-1">
                        <Users className="w-4 h-4" /> Staff
                      </Link>
                    </>
                  ) : (
                    <Link to="/dashboard" className="text-sm font-bold text-gray-500 hover:text-red-600 flex items-center gap-1">
                      <LayoutDashboard className="w-4 h-4" /> Dept Console
                    </Link>
                  )}
                  
                  <Link to="/profile" className="text-sm font-bold text-gray-500 hover:text-red-600 flex items-center gap-1">
                    <UserIcon className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/my-reports" className="text-sm font-bold text-gray-500 hover:text-red-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> My Reports
                  </Link>
                </div>
              )}

              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      <UserIcon className="w-4 h-4 text-red-600" />
                      <span className="font-semibold">{user.name}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-sm transition-all active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-black text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isMobile && mobileMenuOpen && (
        <div className="bg-white border-t border-gray-100 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
           <div className="flex flex-col gap-2">
              <Link onClick={() => setMobileMenuOpen(false)} to="/collaboration" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 flex items-center gap-3">
                 <Users className="text-blue-600" /> Collaboration Hub
              </Link>
              
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <>
                      <Link onClick={() => setMobileMenuOpen(false)} to="/admin" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="text-red-600" /> Operations Center
                      </Link>
                      <Link onClick={() => setMobileMenuOpen(false)} to="/bento" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Zap className="text-orange-500" /> Bento Analytics
                      </Link>
                      <Link onClick={() => setMobileMenuOpen(false)} to="/admin/accounts" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="text-indigo-600" /> Manage Staff
                      </Link>
                    </>
                  ) : (
                    <Link onClick={() => setMobileMenuOpen(false)} to="/dashboard" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 flex items-center gap-3">
                      <LayoutDashboard className="text-red-600" /> Dept Console
                    </Link>
                  )}
                  <Link onClick={() => setMobileMenuOpen(false)} to="/profile" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 flex items-center gap-3">
                    <UserIcon className="text-gray-600" /> My Profile
                  </Link>
                  <Link onClick={() => setMobileMenuOpen(false)} to="/my-reports" className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Clock className="text-red-600" /> My Reports
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full p-4 bg-red-600 text-white rounded-2xl font-black flex items-center gap-3"
                  >
                    <LogOut /> Logout Account
                  </button>
                </>
              ) : (
                <Link onClick={() => setMobileMenuOpen(false)} to="/login" className="p-4 bg-red-600 text-white rounded-2xl font-black text-center">
                  Official Login
                </Link>
              )}
           </div>
           
           <div className="flex justify-center pt-4 border-t border-gray-50">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                Device: {deviceType.toUpperCase()} MODE
              </span>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

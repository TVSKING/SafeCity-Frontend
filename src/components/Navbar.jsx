import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, User as UserIcon, LayoutDashboard, Users, Zap } from 'lucide-react';


const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold tracking-tight text-gray-900">SafeCity</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/collaboration" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-all flex items-center gap-1">
               <Users className="w-4 h-4" /> Hub
            </Link>

            {user && (
              <div className="hidden md:flex items-center gap-4">
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
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
                >
                  Admin / Dept Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

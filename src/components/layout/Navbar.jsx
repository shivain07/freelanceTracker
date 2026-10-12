import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import api from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import API_ROUTES from "../../api/apiRoutes";

const UserAvatar = ({ avatarUrl, alt, imageClassName, fallbackClassName }) => {
  const [failedUrl, setFailedUrl] = useState(null);

  return avatarUrl && failedUrl !== avatarUrl ? (
    <img
      src={avatarUrl}
      alt={alt}
      className={imageClassName}
      onError={() => setFailedUrl(avatarUrl)}
    />
  ) : (
    <div className={fallbackClassName}>
      <UserIcon className="w-4 h-4" />
    </div>
  );
};

const Navbar = () => {
  const { user, verifyUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Tell backend to clear the HttpOnly cookie
      await api.post(API_ROUTES.auth.logout, {}, { withCredentials: true });

      // 2. Clear user state from React context / local storage
      verifyUser(null);

      // 3. Redirect to login page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">
                  FreeLance<span className="text-indigo-400">Tracker</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  Workspace
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "bg-slate-800 text-indigo-400 font-semibold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Right Side: User Profile & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
                <UserAvatar
                  avatarUrl={user.avatar_url}
                  alt={user.display_name || user.name || "User"}
                  imageClassName="w-8 h-8 rounded-full object-cover border border-slate-600"
                  fallbackClassName="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center"
                />
                <div className="text-left pr-2">
                  <div className="text-xs font-semibold text-white max-w-[140px] truncate">
                    {user.display_name || user.name || "Freelancer"}
                  </div>
                  {user.email && (
                    <div className="text-[11px] text-slate-400 max-w-[140px] truncate">
                      {user.email}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-600/90 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-4 space-y-3">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive("/dashboard")
                ? "bg-slate-800 text-indigo-400 font-semibold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          {user && (
            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <UserAvatar
                avatarUrl={user.avatar_url}
                alt={user.display_name || user.name || "User"}
                imageClassName="w-9 h-9 rounded-full object-cover border border-slate-600"
                fallbackClassName="w-9 h-9 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user.display_name || user.name || "Freelancer"}
                </div>
                {user.email && (
                  <div className="text-xs text-slate-400 truncate">
                    {user.email}
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

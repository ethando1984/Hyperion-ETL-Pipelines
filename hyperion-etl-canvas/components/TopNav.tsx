import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './common/Icon';

interface TopNavProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

const TopNav: React.FC<TopNavProps> = ({ title, breadcrumbs, actions }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.profile) return 'U';
    const email = user.profile.email || user.profile.sub || '';
    const name = user.profile.name || email;

    if (name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    if (!user?.profile) return 'User';
    return user.profile.name || user.profile.email || user.profile.sub || 'User';
  };

  // Get email
  const getUserEmail = () => {
    if (!user?.profile) return '';
    return user.profile.email || user.profile.sub || '';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
  };

  return (
    <nav className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-20">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center text-white shadow-sm group-hover:bg-primary-700 transition-colors">
            <span className="material-symbols-outlined transform -rotate-90 text-[20px]">rounded_corner</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Hyperion</span>
        </Link>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

        {breadcrumbs ? (
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center space-x-2">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="material-symbols-outlined text-gray-400 text-sm pt-0.5">chevron_right</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-primary-600 font-bold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        ) : (
          <div className="hidden md:flex space-x-6">
            <Link to="/dashboard" className={`text-sm font-medium border-b-2 px-1 pt-1 ${isActive('/dashboard') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Dashboard
            </Link>
            <Link to="/builder" className={`text-sm font-medium border-b-2 px-1 pt-1 ${isActive('/builder') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Builder
            </Link>
            <Link to="/filters" className={`text-sm font-medium border-b-2 px-1 pt-1 ${isActive('/filters') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Filters
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block"></div>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center text-white font-semibold text-sm transition-all hover:scale-105"
            aria-label="User menu"
          >
            {getUserInitials()}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {getUserEmail()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add profile navigation here if needed
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Icon name="person" className="text-lg" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Add settings navigation here if needed
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Icon name="settings" className="text-lg" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <Icon name="logout" className="text-lg" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
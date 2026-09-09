import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES_EMPLOYEE'] },
    { name: 'Leads', path: '/leads', icon: Users, roles: ['ADMIN', 'SALES_EMPLOYEE'] },
    { name: 'Properties', path: '/properties', icon: Building2, roles: ['ADMIN'] },
    { name: 'Bookings', path: '/bookings', icon: CalendarCheck, roles: ['ADMIN', 'SALES_EMPLOYEE'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLinks = () => (
    <>
      {navItems.filter(item => !item.roles || item.roles.includes(user?.role)).map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.path);
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 mb-2 overflow-hidden ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-dark-surface/80 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            {isActive && (
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-400 to-primary-600 rounded-r-md animate-fade-in"></span>
            )}
            <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'} ${isSidebarCollapsed ? 'mx-auto' : ''}`} />
            {!isSidebarCollapsed && <span className="z-10 relative whitespace-nowrap">{item.name}</span>}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex transition-colors duration-300 selection:bg-primary-200 selection:text-primary-900">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col glass border-r border-gray-200/50 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none z-20 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="h-20 flex items-center px-4 border-b border-gray-100 dark:border-gray-800 relative justify-center">
          <div className="p-2 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/50 dark:to-indigo-900/50 rounded-xl shadow-sm border border-white/50 dark:border-gray-700/50 flex-shrink-0">
            <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          {!isSidebarCollapsed && (
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight ml-3 whitespace-nowrap">RealEstate <span className="text-gradient">Pro</span></span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors z-30"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
          </button>
        </div>

        <div className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-5'} py-8 overflow-y-auto custom-scrollbar transition-all duration-300`}>
          <nav className="space-y-1">
            <NavLinks />
          </nav>
        </div>

        <div className={`p-4 m-2 bg-white/40 dark:bg-dark-surface/40 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm transition-all duration-300 flex flex-col items-center ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center mb-4' : 'mb-5 w-full'}`}>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white dark:border-gray-800 flex-shrink-0 ${!isSidebarCollapsed ? 'mr-3' : ''}`}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-medium capitalize truncate">{user?.role?.replace('_', ' ').toLowerCase()}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center space-x-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 dark:hover:bg-red-600 rounded-xl transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10 p-0' : 'w-full px-4 py-2.5'}`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 transition-colors duration-300">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">CRM</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-gray-800 bg-opacity-75">
            <div className="fixed inset-y-0 left-0 w-64 bg-white flex flex-col">
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 px-4 py-6 overflow-y-auto">
                <nav>
                  <NavLinks />
                </nav>
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-50 z-0 pointer-events-none"></div>
          
          {/* Top Right Floating Theme Toggle */}
          <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-110 transition-all duration-300"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative z-10 animate-fade-in max-w-7xl mx-auto h-full pt-16 md:pt-14">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

import React,{ useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.webp';
import {
  HiHome,
  HiUsers,
  HiUserGroup,
  HiBuildingOffice2,
  HiHeart,
  HiChartBar,
  HiCog6Tooth,
  HiXMark,
  HiDocumentText,
  HiClipboardDocumentList,
  HiCurrencyDollar,
  HiCube,
  HiBars3,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HiHome,
      current: isActiveRoute('/dashboard'),
      color: 'text-blue-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'group-hover:text-blue-600',
      hoverBgColor: 'group-hover:bg-gray-50'
    },
    {
      name: 'Leads',
      href: '/leads',
      icon: HiUsers,
      current: isActiveRoute('/leads'),
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'group-hover:text-gray-600',
      hoverBgColor: 'group-hover:bg-gray-50'
    },
    {
      name: 'Production',
      href: '/production',
      icon: HiDocumentText,
      current: isActiveRoute('/production'),
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'group-hover:text-gray-600',
      hoverBgColor: 'group-hover:bg-gray-50'
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: HiCube,
      current: isActiveRoute('/inventory'),
      color: 'text-orange-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'group-hover:text-orange-600',
      hoverBgColor: 'group-hover:bg-gray-50'
    },
    {
      name: 'Branches',
      href: '/branches',
      icon: HiBuildingOffice2,
      current: isActiveRoute('/branches'),
      color: 'text-indigo-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'group-hover:text-indigo-600',
      hoverBgColor: 'group-hover:bg-gray-50'
    },
    {
      name: 'Health Issues',
      href: '/health-issues',
      icon: HiHeart,
      current: isActiveRoute('/health-issues'),
      color: 'text-red-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'group-hover:text-red-600',
      hoverBgColor: 'group-hover:bg-gray-50'
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: HiClipboardDocumentList,
      current: isActiveRoute('/orders'),
      color: 'text-teal-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'group-hover:text-teal-600',
      hoverBgColor: 'group-hover:bg-gray-50'
    },
    {
      name: 'Accounts',
      href: '/accounts',
      icon: HiCurrencyDollar,
      current: isActiveRoute('/accounts'),
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      hoverColor: 'group-hover:text-gray-600',
      hoverBgColor: 'group-hover:bg-gray-50'
    }
  ];

  // Add admin-only navigation items
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    navigation.push(
      {
        name: 'User Management',
        href: '/user-management',
        icon: HiUserGroup,
        current: isActiveRoute('/user-management'),
        color: 'text-cyan-600',
        bgColor: 'bg-gray-100',
        hoverColor: 'group-hover:text-cyan-600',
        hoverBgColor: 'group-hover:bg-gray-50'
      },
      {
        name: 'Payroll',
        href: '/payroll',
        icon: HiChartBar,
        current: isActiveRoute('/payroll'),
        color: 'text-pink-600',
        bgColor: 'bg-gray-100',
        hoverColor: 'group-hover:text-pink-600',
        hoverBgColor: 'group-hover:bg-gray-50'
      }
    );
  }

  navigation.push({
    name: 'Settings',
    href: '/settings',
    icon: HiCog6Tooth,
    current: isActiveRoute('/settings'),
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    hoverColor: 'group-hover:text-gray-600',
    hoverBgColor: 'group-hover:bg-gray-50'
  });

  const NavigationItem = ({ item }) => {
    const isActive = item.current;

    const getItemStyle = () => {
      // Only apply gradient styles if the item has gradient property and is active
      if (item.gradient && isActive) {
        return {
          background: 'linear-gradient(90deg, rgb(139, 195, 74), rgb(85, 139, 47))',
          color: 'white',
          borderRightColor: 'rgb(85, 139, 47)'
        };
      }
      if (item.gradient && !isActive) {
        return {
          color: 'rgb(139, 195, 74)'
        };
      }
      return {};
    };

    return (
      <Link
        to={item.href}
        className={`group flex items-center text-sm font-medium rounded-lg transition-all duration-300 ease-in-out ${
          isCollapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5'
        } ${
          isActive
            ? `bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 border-r-4 border-[#558b2f] shadow-sm hover:shadow-md`
            : `text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm`
        }`}
        style={getItemStyle()}
        onClick={() => setSidebarOpen(false)}
        title={isCollapsed ? item.name : undefined}
      >
        <item.icon
          className={`h-4 w-4 flex-shrink-0 transition-all duration-300 ${
            isActive ? (item.gradient ? 'text-white' : item.color) : item.color
          } ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
          aria-hidden="true"
        />
        {!isCollapsed && (
          <span className="truncate font-medium text-sm">{item.name}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300" />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-r from-white via-gray-50/30 to-gray-100/50 backdrop-blur-xl shadow-2xl transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex flex-col h-screen">
          {/* Logo and toggle buttons */}
          <div className={`flex items-center justify-between h-16 pt-6 ${isCollapsed ? 'px-3' : 'px-6'} py-4`}>
            <div className="flex items-center w-full">
              <div className="w-full flex items-center justify-center">
                {isCollapsed ? (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(90deg, rgb(139, 195, 74), rgb(85, 139, 47))'}}>
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <img 
                      src={logo} 
                      alt="Herb Nas Logo" 
                      className="h-12 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Desktop toggle button */}
              <button
                type="button"
                className="hidden md:inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-lg transition-all duration-200"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <span className="sr-only">{isCollapsed ? "Expand sidebar" : "Collapse sidebar"}</span>
                {isCollapsed ? (
                  <HiChevronRight className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <HiChevronLeft className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              {/* Mobile close button */}
            <button
              type="button"
              className="md:hidden -mr-2 h-10 w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-[#558b2f] focus:ring-offset-2 transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <HiXMark className="h-5 w-5" aria-hidden="true" />
            </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-4 space-y-1 ${isCollapsed ? 'px-3' : 'px-5'}`}>
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavigationItem key={item.name} item={item} />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className={`py-4 ${isCollapsed ? 'px-3' : 'px-6'}`}>
            {isCollapsed ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{background: 'linear-gradient(90deg, rgb(139, 195, 74), rgb(85, 139, 47))'}}>
                  <span className="text-white font-bold text-sm">H</span>
                </div>
              </div>
            ) : (
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500 font-medium">
                © 2025 Herbnas
              </p>
              <p className="text-xs text-gray-400">
                All rights reserved
              </p>
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
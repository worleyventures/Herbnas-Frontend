import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { getProfile } from '../../redux/actions/authActions';
import {
  HiBars3,
  HiBell,
  HiUserCircle,
  HiChevronDown,
  HiChevronRight,
  HiHome,
  HiCog6Tooth,
  HiUser,
  HiArrowRightOnRectangle
} from 'react-icons/hi2';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const leads = useSelector((state) => state.leads?.leads || []);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  // Debug user data and refresh if needed
  React.useEffect(() => {
    console.log('🔍 Header - User data:', user);
    console.log('🔍 Header - User keys:', user ? Object.keys(user) : 'No user');
    console.log('🔍 Header - firstName:', user?.firstName);
    console.log('🔍 Header - lastName:', user?.lastName);
    console.log('🔍 Header - fullName:', user?.fullName);
    console.log('🔍 Header - role:', user?.role);
    
    // Check localStorage for user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔍 Header - Stored user data:', parsedUser);
        console.log('🔍 Header - Stored user firstName:', parsedUser?.firstName);
        console.log('🔍 Header - Stored user lastName:', parsedUser?.lastName);
      } catch (error) {
        console.error('❌ Error parsing stored user data:', error);
      }
    }
    
    // If user exists but firstName/lastName are missing, try to refresh profile
    if (user && (!user.firstName || !user.lastName)) {
      console.log('🔄 Refreshing user profile due to missing name data');
      dispatch(getProfile());
    }
  }, [user, dispatch]);

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    const breadcrumbNameMap = {
      dashboard: 'Dashboard',
      leads: 'Leads',
      products: 'Products',
      branches: 'Branches',
      'health-issues': 'Health Issues',
      users: 'Users',
      settings: 'Settings',
      profile: 'Profile',
      create: 'Create',
      edit: 'Edit',
      view: 'View',
      stats: 'Statistics',
      reports: 'Reports'
    };

    // Function to check if a string is a MongoDB ObjectId
    const isObjectId = (str) => {
      return /^[0-9a-fA-F]{24}$/.test(str);
    };

    // Get lead name if we're on a lead details page
    const getLeadName = (leadId) => {
      if (!leadId || !isObjectId(leadId)) return 'Lead Details';
      
      const lead = leads.find(l => l._id === leadId);
      return lead ? lead.customerName || 'Lead Details' : 'Lead Details';
    };

    // Get appropriate name for ObjectId based on context
    const getObjectIdName = (objectId, pathnames, index) => {
      // Check if we're in a leads context
      if (pathnames.includes('leads')) {
        return getLeadName(objectId);
      }
      
      // For other contexts, return generic names based on the previous path
      const previousPath = pathnames[index - 1];
      switch (previousPath) {
        case 'products':
          return 'Product Details';
        case 'branches':
          return 'Branch Details';
        case 'health-issues':
          return 'Health Issue Details';
        case 'users':
          return 'User Details';
        case 'inventory':
          return 'Inventory Details';
        case 'production':
          return 'Production Details';
        default:
          return 'Details';
      }
    };

    const breadcrumbs = [
      { name: 'Home', href: '/dashboard', icon: HiHome, current: false }
    ];

    pathnames.forEach((pathname, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      
      let displayName;
      if (isObjectId(pathname)) {
        // If it's a MongoDB ObjectId, get appropriate name based on context
        displayName = getObjectIdName(pathname, pathnames, index);
      } else {
        displayName = breadcrumbNameMap[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
      }
      
      breadcrumbs.push({
        name: displayName,
        href,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Get leads from Redux state for reminders (already declared above)
  
  // Generate notifications from leads data
  const generateNotifications = () => {
    const notifications = [];
    const now = new Date();
    
    leads.forEach(lead => {
      // Check for follow-up reminders
      if (lead.nextFollowUp) {
        const followUpDate = new Date(lead.nextFollowUp);
        const timeDiff = followUpDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        // Show reminder if follow-up is due within 24 hours
        if (hoursDiff <= 24 && hoursDiff >= -24) {
          const isOverdue = hoursDiff < 0;
          notifications.push({
            id: `followup-${lead._id || lead.id}`,
            title: isOverdue ? 'Overdue Follow-up' : 'Follow-up Reminder',
            message: `${lead.customerName} - ${lead.customerMobile}`,
            time: isOverdue ? `${Math.abs(Math.round(hoursDiff))} hours overdue` : `Due in ${Math.round(hoursDiff)} hours`,
            unread: true,
            type: 'followup',
            leadId: lead._id || lead.id
          });
        }
      }
      
      // Check for new leads (created within last hour)
      if (lead.createdAt) {
        const createdDate = new Date(lead.createdAt);
        const timeDiff = now.getTime() - createdDate.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff <= 1) {
          notifications.push({
            id: `new-${lead._id || lead.id}`,
            title: 'New Lead Assigned',
            message: `${lead.customerName} - ${lead.branch || 'No Branch'}`,
            time: `${Math.round(hoursDiff * 60)} min ago`,
            unread: true,
            type: 'new_lead',
            leadId: lead._id || lead.id
          });
        }
      }
    });
    
    return notifications.sort((a, b) => {
      // Sort by unread first, then by time
      if (a.unread !== b.unread) return b.unread - a.unread;
      return new Date(b.time) - new Date(a.time);
    });
  };

  const notifications = generateNotifications();
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-gradient-to-r from-white via-gray-50/30 to-gray-100/50 backdrop-blur-xl shadow-lg sticky top-0 z-30 h-16">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8 h-full">
        {/* Left side - Menu button and Breadcrumbs */}
        <div className="flex items-center flex-1">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden -ml-1 -mt-1 h-12 w-12 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-[#558b2f] focus:ring-offset-2 transition-all duration-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">Open sidebar</span>
            <HiBars3 className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex ml-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-3">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.name} className="flex items-center">
                  {index > 0 && (
                    <HiChevronRight
                      className="flex-shrink-0 h-4 w-4 text-gray-400 mr-3"
                      aria-hidden="true"
                    />
                  )}
                  <Link
                    to={breadcrumb.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      breadcrumb.current
                        ? 'text-gray-900 cursor-default font-semibold'
                        : 'text-gray-600'
                    }`}
                    aria-current={breadcrumb.current ? 'page' : undefined}
                  >
                    {breadcrumb.icon && index === 0 && (
                      <breadcrumb.icon className="flex-shrink-0 h-4 w-4 mr-2 text-[#558b2f]" />
                    )}
                    {breadcrumb.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="relative p-2.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 rounded-lg transition-all duration-200"
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            >
              <span className="sr-only">View notifications</span>
              <HiBell className="h-6 w-6" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {notificationDropdownOpen && (
              <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
                <div className="py-2">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'No new notifications'}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white text-sm font-medium rounded-full">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HiBell className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">No notifications yet</p>
                        <p className="text-gray-400 text-xs mt-1">You'll see lead reminders and updates here</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            // Navigate to leads page when notification is clicked
                            navigate('/leads');
                            setNotificationDropdownOpen(false);
                          }}
                          className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-l-4 ${
                            notification.unread 
                              ? 'bg-blue-50 border-blue-400 hover:bg-blue-100' 
                              : 'border-transparent hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                              notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${
                                  notification.unread ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                </p>
                                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                                  {notification.time}
                                </span>
                              </div>
                              <p className={`text-sm mt-1 ${
                                notification.unread ? 'text-blue-700' : 'text-gray-600'
                              }`}>
                                {notification.message}
                              </p>
                              {notification.type && (
                                <div className="mt-2">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    notification.type === 'followup' 
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {notification.type === 'followup' ? 'Follow-up' : 'New Lead'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                      <button 
                        onClick={() => {
                          navigate('/leads');
                          setNotificationDropdownOpen(false);
                        }}
                        className="w-full text-center text-sm text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors duration-200 py-2 hover:bg-yellow-50 rounded-lg"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center max-w-xs bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 hover:bg-gray-50 transition-all duration-200 p-2"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="flex items-center space-x-3">
                {user?.avatar?.url ? (
                  <img
                    className="h-9 w-9 rounded-full ring-2 ring-gray-200"
                    src={user.avatar.url}
                    alt={user.fullName || user.firstName}
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-100 border-2 border-gray-300">
                    <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || 
                     (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : null) ||
                     user?.firstName ||
                     user?.email ||
                     'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role || 'super_admin'}
                  </p>
                </div>
                <HiChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Profile dropdown menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <HiUser className="h-4 w-4 mr-3 text-gray-400" />
                    Your Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <HiCog6Tooth className="h-4 w-4 mr-3 text-gray-400" />
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <HiArrowRightOnRectangle className="h-4 w-4 mr-3 text-red-400" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(profileDropdownOpen || notificationDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setProfileDropdownOpen(false);
            setNotificationDropdownOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
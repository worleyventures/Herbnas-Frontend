// src/components/layout/Layout.jsx

import React, { useState, useEffect, useRef } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AttendanceModal from "../common/AttendanceModal";
import NotificationToast from "../common/NotificationToast";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  // Close sidebar on route change (mobile) - but only when changing main sections
  useEffect(() => {
    const mainSections = ['/dashboard', '/leads', '/production', '/inventory', '/branches', '/health-issues', '/orders', '/accounts', '/user-management', '/payroll', '/settings'];
    
    const getMainSection = (pathname) => {
      return mainSections.find(section => pathname.startsWith(section));
    };
    
    const currentMainSection = getMainSection(location.pathname);
    const previousMainSection = getMainSection(previousPathRef.current);
    
    // Only close sidebar if we're actually changing main sections
    if (currentMainSection && previousMainSection && currentMainSection !== previousMainSection) {
      setSidebarOpen(false);
    }
    
    // Update the previous path reference
    previousPathRef.current = location.pathname;
  }, [location]);

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          showAttendanceModal={showAttendanceModal}
          setShowAttendanceModal={setShowAttendanceModal}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Attendance Modal - Rendered at top level for proper positioning */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />

      {/* Notification Toast - Rendered at top level for proper positioning */}
      <NotificationToast />
    </div>
  );
};

export default Layout;
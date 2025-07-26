import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsers from '../components/admin/AdminUsers';
import AdminResourceRequests from '../components/admin/AdminResourceRequests';
import AdminVendorOffers from '../components/admin/AdminVendorOffers';
import AdminExecutionPhases from '../components/admin/AdminExecutionPhases';
import AdminSettings from '../components/admin/AdminSettings';
import AdminFeedback from '../components/admin/AdminFeedback';
import NotificationsPage from '../components/NotificationsPage';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';

// Sidebar toggle button with notched arrow style - نفس الكود المستخدم في باقي الداشبوردات
function SidebarToggle({ isOpen, toggleSidebar }) {
  return (
    <button
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      className={`
        fixed z-50
        ${isOpen ? 'left-64' : 'left-0'}
        top-1/2 -translate-y-1/2
        transition-all
        shadow
        ${isOpen ? 'rounded-r-lg' : 'rounded-r-lg'}
        w-6 h-12 flex items-center justify-center
        outline-none
      `}
      style={{
        background: isOpen ? '#457B9D' : '#457B9D',
        transition: 'background 0.2s',
        transform: isOpen
          ? 'translateY(-50%)'
          : 'translate(-80%, -50%)',
      }}
      onMouseOver={e => e.currentTarget.style.background = '#27406b'}
      onMouseOut={e => e.currentTarget.style.background = '#457B9D'}
    >
      <span
        className={`
          block w-4 h-8
          ${isOpen ? '' : 'rotate-180'}
          relative
        `}
        style={{
          clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
          background: 'white',
        }}
      ></span>
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
}

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <DashboardHeader
        userEmail="admin@elevante.com"
        userRole="admin"
        searchPlaceholder="Search admin panel..."
        onSettingsClick={() => {}}
      />
      <Sidebar 
        userRole="admin" 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <SidebarToggle isOpen={!sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`} style={{ backgroundColor: '#EEF8F7' }}>
        <div className="pt-6 px-4 sm:px-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </>
  );
} 

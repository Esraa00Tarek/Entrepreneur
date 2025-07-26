import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AIChat from '../components/AIChat';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import DashboardHeader from '../components/DashboardHeader';
import { User, Settings, LogOut } from 'lucide-react';
import Support from './Support';
import FeedbackAndReviews from './FeedbackAndReviews';
import TermsOfUse from '../components/TermsofUse';
import PrivacyPolicy from '../components/Privacy Policy';
import SettingsPage from '../components/SettingsPage';
import NotificationsPage from '../components/NotificationsPage';
import { Link } from 'react-router-dom';

// Sidebar toggle button with notched arrow style
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

const SupplierDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <DashboardHeader
        userEmail="supplier@demo.com"
        userRole="supplier"
        onProfileMenu={() => setShowProfileMenu(!showProfileMenu)}
        showProfileMenu={showProfileMenu}
      >
        <Link to="/dashboard/supplier/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <User className="w-4 h-4 mr-2" />
          Profile
        </Link>
        <Link to="/dashboard/supplier/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Link>
        <hr className="my-1" />
        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </a>
      </DashboardHeader>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole="supplier"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <SidebarToggle isOpen={!sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-0 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`} style={{ backgroundColor: '#EEF8F7' }}>
        {activeTab === 'notifications' ? (
          <NotificationsPage userRole="supplier" />
        ) : activeTab === 'feedback' ? (
          <FeedbackAndReviews />
        ) : activeTab === 'support' ? (
          <Support userRole="supplier" setActiveTab={setActiveTab} />
        ) : activeTab === 'terms' ? (
          <TermsOfUse onBack={() => setActiveTab('support')} />
        ) : activeTab === 'privacy' ? (
          <PrivacyPolicy onBack={() => setActiveTab('support')} />
        ) : activeTab === 'settings' ? (
          <div className="w-full py-8 px-2 sm:px-4">
            <SettingsPage user={{
              fullName: 'Supplier Name',
              email: 'supplier@demo.com',
              bio: 'Supplier bio',
              location: 'Cairo',
              phone: '',
              company: 'Supply Co.',
              website: ''
            }} role="supplier" />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'overview' ? (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back, Supplier!</h1>
                <p className="text-gray-600 mb-8">Here's your supplier overview</p>
                {/* Add supplier overview content here */}
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
};

export default SupplierDashboard; 
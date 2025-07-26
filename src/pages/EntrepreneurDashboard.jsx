import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target,
  Settings,
  User,
  LogOut,
  Eye,
  Heart,
  Share2,
  ArrowUpRight,
  Building,
  MapPin,
  Plus
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AIChat from '../components/AIChat';
import DashboardHeader from '../components/DashboardHeader';
import SettingsPage from '../components/SettingsPage';
import Marketplace from '../components/Marketplace';
import MilestonesSection from '../components/MilestonesSection';
import MyBusiness from '../components/MyBusiness';
import MyDeals from '../components/MyDeals';
import Messages from '../components/Messages';
import OverviewPage from '../components/OverviewPage';
import NotificationsPage from '../components/NotificationsPage';
import Support from './Support';
import FeedbackAndReviews from './FeedbackAndReviews';
import TermsOfUse from '../components/TermsofUse';
import PrivacyPolicy from '../components/Privacy Policy';
import MyRequests from './entrepreneur/MyRequests';
import RequestList from './entrepreneur/RequestList';
import RequestForm from './entrepreneur/RequestForm';
import OffersPage from './entrepreneur/OffersPage';

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

const EntrepreneurDashboard = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync activeTab with ?tab=... in URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && [
      'overview', 'my-business', 'milestones', 'marketplace', 'my-deals', 'messages', 'notifications', 'support', 'feedback', 'terms', 'privacy', 'settings', 'my-requests', 'offers'
    ].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const recentActivities = [
    {
      id: 1,
      type: 'profile',
      title: 'Profile Created',
      description: 'Your entrepreneur profile has been successfully created',
      time: 'Just now',
      icon: User,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'welcome',
      title: 'Welcome to Elevante',
      description: 'Start exploring opportunities and connect with investors',
      time: '1 minute ago',
      icon: Target,
      color: 'text-blue-600'
    }
  ];

  const opportunities = [
    {
      id: 1,
      title: 'Tech Startup Accelerator Program',
      company: 'Innovation Hub',
      location: 'San Francisco, CA',
      funding: '$50K - $100K',
      stage: 'Early Stage',
      deadline: '15 days left',
      tags: ['Technology', 'SaaS', 'B2B'],
      logo: '🚀'
    },
    {
      id: 2,
      title: 'Green Energy Investment Round',
      company: 'EcoVentures',
      location: 'Austin, TX',
      funding: '$100K - $500K',
      stage: 'Series A',
      deadline: '22 days left',
      tags: ['Clean Energy', 'Sustainability'],
      logo: '🌱'
    },
    {
      id: 3,
      title: 'Healthcare Innovation Grant',
      company: 'MedTech Partners',
      location: 'Boston, MA',
      funding: '$25K - $75K',
      stage: 'MVP',
      deadline: '8 days left',
      tags: ['Healthcare', 'AI', 'Medical'],
      logo: '🏥'
    }
  ];

  return (
    <>
      <DashboardHeader
        userEmail="entrepreneur@demo.com"
        userRole="entrepreneur"
        onProfileMenu={() => setShowProfileMenu(!showProfileMenu)}
        showProfileMenu={showProfileMenu}
        onSettingsClick={() => setActiveTab('settings')}
      >
        <Link to="/dashboard/entrepreneur/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <User className="w-4 h-4 mr-2" />
          Profile
        </Link>
        <Link to="/dashboard/entrepreneur/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
        userRole="entrepreneur"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <SidebarToggle isOpen={!sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`pt-0 min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`} style={{ backgroundColor: '#EEF8F7' }}>
        {activeTab === 'marketplace' ? (
          <div className="w-full py-8 px-6 sm:px-8 lg:px-12">
            <Marketplace />
          </div>
        ) : activeTab === 'my-business' ? (
          <MyBusiness />
        ) : activeTab === 'my-requests' ? (
          <MyRequests />
        ) : activeTab === 'offers' ? (
          <OffersPage />
        ) : activeTab === 'my-deals' ? (
          <MyDeals />
        ) : activeTab === 'messages' ? (
          <Messages />
        ) : activeTab === 'notifications' ? (
          <NotificationsPage />
        ) : activeTab === 'support' ? (
          <Support userRole="entrepreneur" setActiveTab={setActiveTab} />
        ) : activeTab === 'feedback' ? (
          <FeedbackAndReviews />
        ) : activeTab === 'terms' ? (
          <TermsOfUse onBack={() => setActiveTab('support')} />
        ) : activeTab === 'privacy' ? (
          <PrivacyPolicy onBack={() => setActiveTab('support')} />
        ) : activeTab === 'settings' ? (
          <div className="w-full py-8 px-2 sm:px-4">
            <SettingsPage user={{
              fullName: 'Entrepreneur Name',
              email: 'entrepreneur@demo.com',
              bio: 'Entrepreneur bio',
              location: 'Cairo',
              phone: '',
              company: 'Startup Inc.',
              website: ''
            }} role="entrepreneur" />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'overview' ? (
              <OverviewPage />
            ) : activeTab === 'milestones' ? (
              <MilestonesSection />
            ) : null}
          </div>
        )}
      </main>
    </>
  );
};

export default EntrepreneurDashboard; 
import React from 'react';
import { 
  BarChart3, 
  Users, 
  Target, 
  Briefcase, 
  MessageSquare,
  Settings,
  User,
  LogOut,
  Home,
  TrendingUp,
  Package,
  Lightbulb,
  Bell,
  Store,
  UserCheck,
  HelpCircle,
  TableProperties,
  FileText,
  ShoppingBag,
  Star
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, userRole, collapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const getMenuItems = () => {
    const commonItems = [
      { id: 'overview', label: 'Overview', icon: Home }
    ];

    const roleSpecificItems = {
      entrepreneur: [
        { id: 'my-business', label: 'My Business', icon: Briefcase },
        { id: 'milestones', label: 'Milestones', icon: BarChart3 },
        { id: 'marketplace', label: 'Marketplace', icon: Store },
        { id: 'my-requests', label: 'My Requests', icon: ShoppingBag },
        { id: 'offers', label: 'Offers', icon: FileText },
        { id: 'my-deals', label: 'My Deals', icon: UserCheck },
        { id: 'notifications', label: 'Notifications', icon: Bell, to: '/notifications' },
        { id: 'feedback', label: 'Feedback', icon: Star, to: '/feedback' },
        { id: 'support', label: 'Support', icon: HelpCircle }
      ],
      investor: [
        { id: 'exploreProjects', label: 'Explore Projects', icon: TrendingUp },
        { id: 'portfolio', label: 'My Deals', icon: Briefcase },
        { id: 'milestones', label: 'Milestones', icon: BarChart3 },
        { id: 'requests', label: 'Requests', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell, to: '/notifications' },
        { id: 'feedback', label: 'Feedback', icon: Star, to: '/feedback' },
        { id: 'support', label: 'Support', icon: HelpCircle }
      ],
      supplier: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'my-products', label: 'My Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell, to: '/notifications' },
        { id: 'feedback', label: 'Feedback', icon: Star, to: '/feedback' },
        { id: 'support', label: 'Support', icon: HelpCircle }
      ],
      admin: [
        { id: 'overview', label: 'Overview', icon: Home, to: '/admin' },
        { id: 'users', label: 'Users', icon: Users, to: '/admin/users' },
        { id: 'resource-requests', label: 'Resource Requests', icon: FileText, to: '/admin/requests' },
        { id: 'vendor-requests', label: 'Vendor Requests', icon: ShoppingBag, to: '/admin/vendor-offers' },
        { id: 'phases', label: 'Execution Phases', icon: Target, to: '/admin/phases' },
        { id: 'notifications', label: 'Notifications', icon: Bell, to: '/admin/notifications' },
        { id: 'admin-chat', label: 'Support Chat', icon: MessageSquare, to: '/admin/chat' },
        { id: 'feedback', label: 'Feedback & Reviews', icon: Star, to: '/admin/feedback' },
        { id: 'settings', label: 'Settings', icon: Settings, to: '/admin/settings' },
      ]
    };

    const settingsItem = { id: 'settings', label: 'Settings', icon: Settings };

    if (userRole === 'admin') {
      return [
        { id: 'overview', label: 'Overview', icon: Home, to: '/admin' },
        { id: 'users', label: 'Users', icon: Users, to: '/admin/users' },
        { id: 'resource-requests', label: 'Resource Requests', icon: FileText, to: '/admin/requests' },
        { id: 'vendor-requests', label: 'Vendor Requests', icon: ShoppingBag, to: '/admin/vendor-offers' },
        { id: 'phases', label: 'Execution Phases', icon: Target, to: '/admin/phases' },
        { id: 'notifications', label: 'Notifications', icon: Bell, to: '/admin/notifications' },
        { id: 'admin-chat', label: 'Support Chat', icon: MessageSquare, to: '/admin/chat' },
        { id: 'feedback', label: 'Feedback & Reviews', icon: Star, to: '/admin/feedback' },
        { id: 'settings', label: 'Settings', icon: Settings, to: '/admin/settings' },
      ];
    }

    return [
      ...commonItems,
      ...(Array.isArray(roleSpecificItems[userRole]) ? roleSpecificItems[userRole] : []),
      settingsItem
    ];
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'entrepreneur': return 'text-teal-600';
      case 'investor': return 'text-blue-600';
      case 'supplier': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleBg = () => {
    switch (userRole) {
      case 'entrepreneur': return 'bg-teal-500';
      case 'investor': return 'bg-blue-500';
      case 'supplier': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'entrepreneur': return Lightbulb;
      case 'investor': return TrendingUp;
      case 'supplier': return Package;
      default: return User;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-white shadow-lg border-r border-gray-200 z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <nav className="p-2" style={{ height: 'calc(100vh - 64px - 70px)' }}>
        <ul className="space-y-1 h-full overflow-y-auto pr-1">
          <li className="mt-2"></li> {/* مسافة صغيرة قبل أول تاب */}
          {getMenuItems().map((item) => (
            <li key={item.id}>
              {userRole === 'admin' && item.to ? (
                <Link
                  to={item.to}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    location.pathname === item.to
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={location.pathname === item.to ? { backgroundColor: '#457B9D' } : {}}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              ) : (
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  style={activeTab === item.id ? { backgroundColor: '#457B9D' } : {}}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className={`p-2 border-t border-gray-100 ${collapsed ? 'flex justify-center' : ''}`} style={{ minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <button
          className={`flex items-center ${collapsed ? 'justify-center' : ''} w-full px-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors`}
          style={{ width: '100%', minHeight: 48, justifyContent: collapsed ? 'center' : 'flex-start' }}
          onClick={() => { window.location.href = '/'; }}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium ml-3">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, Loader2, X, MessageCircle, AlertTriangle, Shield, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Helper for time ago
function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

// Get notification type icon and styling
function getNotificationStyle(title) {
  // رسائل من المستخدمين
  if (title.includes('message') || title.includes('Message')) {
    return { 
      icon: MessageCircle, 
      bgColor: 'bg-blue-50', 
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200' 
    };
  }
  // رسائل من الإدارة (Welcome, password, admin notifications)
  if (title.includes('Welcome') || title.includes('password') || title.includes('admin')) {
    return { 
      icon: Shield, 
      bgColor: 'bg-emerald-50', 
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200' 
    };
  }
  // باقي التحذيرات والإشعارات (deals, proposals, etc.)
  return { 
    icon: AlertTriangle, 
    bgColor: 'bg-amber-50', 
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200' 
  };
}

export default function NotificationDropdown({ userId: propUserId, userRole: propUserRole }) {
  // جلب userId و userRole من localStorage إذا لم يتم تمريرهم
  const [userId, setUserId] = useState(propUserId);
  const [userRole, setUserRole] = useState(propUserRole || 'entrepreneur');

  useEffect(() => {
    if (!propUserId) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          setUserId(userObj._id || userObj.id);
          setUserRole(userObj.role || 'entrepreneur');
        }
      } catch {}
    }
  }, [propUserId, propUserRole]);

  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();
  const BASE_URL = 'https://backendelevante-production.up.railway.app';

  // جلب الإشعارات من الباك
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Accept both array and object response
      if (Array.isArray(res.data)) setNotifications(res.data);
      else if (Array.isArray(res.data.notifications)) setNotifications(res.data.notifications);
      else setNotifications([]);
    } catch (err) {
      setError("Failed to load notifications.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // تعليم إشعار كمقروء
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {}
  };

  // تعليم الكل كمقروء
  const markAllAsRead = async () => {
    setMarkAllLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/notifications/markAllRead`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
    setMarkAllLoading(false);
  };

  // Unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle show all notifications
  const handleShowAllNotifications = () => {
    setOpen(false);
    navigate(`/notifications`);
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setOpen(false);
    // منطق التوجيه حسب نوع الإشعار
    const type = (notification.type || '').toLowerCase();
    if (type === 'deal') {
      navigate('/deals');
    } else if (type === 'offer' || type === 'newoffer' || type === 'newoffers') {
      navigate('/offers');
    } else if (type === 'dispute') {
      navigate('/disputes');
    } else if (type === 'milestone') {
      navigate('/milestones');
    } else if (notification.redirectUrl) {
      navigate(notification.redirectUrl);
    } else if (notification.link) {
      navigate(notification.link);
    } else {
      navigate('/notifications');
    }
  };

  // Enhanced animations
  const dropdownAnim = `
    transition-all duration-300 ease-out transform origin-top-right
    ${open 
      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
    }
  `;

  // Determine which notifications to show
  let displayNotifications = notifications;
  if (notifications.length === 0) {
    displayNotifications = [{
      _id: 'welcome',
      title: 'Welcome to Elevante!',
      isRead: false,
      createdAt: new Date(),
      entityName: "We're glad to have you here. You'll receive notifications about your projects and deals soon."
    }];
  }
  const displayedNotifications = showAll ? displayNotifications : displayNotifications.slice(0, 6);

  // Delete notification (admin only)
  const deleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/notifications/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      {/* Enhanced Bell Button */}
      <button
        className={`
          relative p-3 rounded-2xl transition-all duration-300 ease-out
          hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50
          hover:shadow-lg hover:shadow-blue-100/50
          active:scale-95 group
          ${open ? 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-100/50' : ''}
        `}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell className={`
          w-6 h-6 transition-all duration-300
          ${open ? 'text-blue-600 scale-110' : 'text-slate-600 group-hover:text-blue-600'}
        `} />
        {unreadCount > 0 && (
          <span className="
            absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500
            text-white text-xs font-bold rounded-full px-2 py-1
            min-w-[22px] h-[22px] flex items-center justify-center
            shadow-lg shadow-red-200/50 border-2 border-white
            transition-all duration-300
          ">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Enhanced Dropdown */}
      <div className={`
        absolute right-0 mt-3 w-96 bg-white rounded-3xl
        shadow-2xl shadow-slate-200/60 border border-slate-200/60
        backdrop-blur-xl z-50 overflow-hidden
        ${dropdownAnim}
      `}>
        {/* Header with Mark All as Read */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-xl">Notifications</h3>
              <p className="text-sm text-slate-500 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up! 🎉'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 
                           bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200
                           hover:scale-105 active:scale-95 border border-blue-100
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllLoading}
                >
                  {markAllLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    'Mark all read'
                  )}
                </button>
              )}
              <button
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={`${showAll ? 'max-h-96' : 'max-h-80'} overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent`}>
          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="relative">
                <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                <div className="absolute inset-0 w-8 h-8 border-2 border-blue-200 rounded-full animate-ping"></div>
              </div>
              <p className="text-slate-500 text-sm mt-4 font-medium">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16">
              <div className="p-4 bg-red-50 rounded-2xl mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 text-center font-semibold text-lg">{error}</p>
              <button 
                onClick={fetchNotifications}
                className="mt-4 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <div className="p-6 bg-slate-50 rounded-2xl mb-6">
                <Bell className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold text-lg">No notifications yet</p>
              <p className="text-slate-400 text-sm mt-2">We'll notify you when something happens</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {displayedNotifications.map((n, index) => {
                const style = getNotificationStyle(n.title);
                const IconComponent = style.icon;
                return (
                  <div
                    key={n._id}
                    className={`
                      relative group cursor-pointer transition-all duration-300
                      hover:bg-gradient-to-r hover:from-slate-25 hover:to-blue-25
                      ${!n.isRead ? 'bg-gradient-to-r from-blue-25 to-indigo-25' : ''}
                      ${hoveredId === n._id ? 'transform scale-[1.01] shadow-lg' : ''}
                    `}
                    onMouseEnter={() => setHoveredId(n._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="flex items-start gap-4 p-6">
                      {/* Fixed Icon for each notification type */}
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center
                        ${style.bgColor} ${style.borderColor} border-2
                        transition-all duration-300 group-hover:scale-110
                      `}>
                        <IconComponent className={`w-5 h-5 ${style.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className={`
                            font-semibold text-base leading-6 line-clamp-2
                            ${n.isRead ? 'text-slate-700' : 'text-slate-900'}
                            transition-colors duration-200
                          `}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                          {n._id !== 'welcome' && (
                            <button
                              className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                              onClick={e => { e.stopPropagation(); deleteNotification(n._id); }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-slate-500 font-medium">
                            {timeAgo(n.createdAt)}
                          </span>
                          <div className={`
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            flex items-center gap-2
                          `}>
                            {n.isRead && (
                              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                                Read
                              </span>
                            )}
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtle hover overlay */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/20 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                    `}></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Show All Notifications Button */}
        {notifications.length > 0 && (
          <div className="p-5 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-100">
            <div className="space-y-3">
              {/* Toggle between showing 6 or all notifications in dropdown */}
              {notifications.length > 6 && (
                <button 
                  className="w-full py-3 text-sm font-medium text-slate-600 hover:text-blue-600 
                           bg-white hover:bg-blue-50 rounded-xl transition-all duration-200
                           hover:scale-[1.02] active:scale-95 border border-slate-200 hover:border-blue-200"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show less' : `Show all ${notifications.length} notifications`}
                </button>
              )}
              
              {/* Navigate to full notifications page */}
              <button 
                className="w-full py-4 text-sm font-semibold text-blue-600 hover:text-blue-700 
                         bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all duration-200
                         hover:shadow-lg hover:scale-[1.02] active:scale-95
                         border border-blue-200 hover:border-blue-300 flex items-center justify-center gap-2"
                onClick={handleShowAllNotifications}
              >
                <span>View all notifications</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
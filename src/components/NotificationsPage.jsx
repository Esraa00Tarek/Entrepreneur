import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, Loader2, X, MessageCircle, AlertTriangle, Shield, ExternalLink, Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

function getNotificationStyle(title = "") {
  if (title.includes('message') || title.includes('Message')) {
    return { icon: MessageCircle, bgColor: 'bg-blue-50', iconColor: 'text-blue-600', borderColor: 'border-blue-200', type: 'message' };
  }
  if (title.includes('Welcome') || title.includes('password') || title.includes('admin')) {
    return { icon: Shield, bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200', type: 'admin' };
  }
  return { icon: AlertTriangle, bgColor: 'bg-amber-50', iconColor: 'text-amber-600', borderColor: 'border-amber-200', type: 'alert' };
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = 'https://backendelevante-production.up.railway.app';

  useEffect(() => {
    setLoading(true);
    const fetchNotifications = async () => {
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
        setError('حدث خطأ أثناء جلب الإشعارات');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

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

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

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

  // استخدم displayNotifications بدلاً من notifications مباشرة
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
  const filteredNotifications = displayNotifications.filter(notification => {
    const matchesSearch = (notification.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.isRead) ||
                         (filter === 'read' && notification.isRead);
    return matchesSearch && matchesFilter;
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
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

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
  };

  const handleNotificationSelect = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen p-6 bg-[#EEF8F7]">
      <div className="max-w-6xl mx-auto">
        {/* زر تعليم الكل كمقروء */}
        {unreadCount > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={markAllAsRead}
              disabled={markAllLoading}
              className="px-5 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {markAllLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Mark all as read
            </button>
          </div>
        )}
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
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <div className="p-4 bg-slate-50 rounded-2xl mb-4">
              <Bell className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold text-lg">No notifications yet</p>
            <p className="text-slate-400 text-sm mt-2">We'll notify you when something happens</p>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {filteredNotifications.map((n) => (
              <div
                key={n._id}
                className={`bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 ${n.isRead ? 'border-gray-200' : 'border-blue-400'} cursor-pointer transition hover:bg-blue-50 hover:shadow-lg`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex-shrink-0">
                  <Bell className={`w-8 h-8 ${n.isRead ? 'text-gray-300' : 'text-blue-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold text-base ${n.isRead ? 'text-gray-700' : 'text-blue-900'}`}>{n.title}</h4>
                    <span className="text-xs text-gray-400 ml-2">{n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</span>
                  </div>
                  {n.entityName && <div className="text-xs text-gray-500 mt-1">{n.entityName}</div>}
                </div>
                {!n.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />}
                {n._id !== 'welcome' && (
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    onClick={e => { e.stopPropagation(); deleteNotification(n._id); }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

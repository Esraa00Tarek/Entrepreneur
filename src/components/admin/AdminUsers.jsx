import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, UserX, Users, UserCheck, UserMinus, AlertCircle, Ban, 
  CheckCircle, Clock, Eye, Download, Upload, Mail, Edit, MoreHorizontal,
  ArrowUp, ArrowDown, Calendar, Activity, Shield, TrendingUp, UserPlus,
  FileText, Settings, Bell, ChevronLeft, ChevronRight, X, Check, ChevronDown, Phone, MapPin
} from 'lucide-react';
import { MdGroup, MdCheckCircle, MdAccessTime, MdBlock, MdVerified } from 'react-icons/md';
import { Listbox } from '@headlessui/react';

// Enhanced mock data with more realistic fields
const mockUsers = [
  {
    id: '1',
    username: 'john_entrepreneur',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'entrepreneur',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-01-25',
    totalProjects: 5,
    profileComplete: true,
    avatar: null,
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    verified: true,
    subscription: 'premium',
    loginCount: 42,
    lastActivity: '2024-01-25T10:30:00Z'
  },
  {
    id: '2',
    username: 'sarah_vendor',
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'vendor',
    status: 'active',
    joinDate: '2024-01-10',
    lastLogin: '2024-01-24',
    totalProjects: 12,
    profileComplete: true,
    avatar: null,
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    verified: true,
    subscription: 'basic',
    loginCount: 87,
    lastActivity: '2024-01-24T15:45:00Z'
  },
  {
    id: '3',
    username: 'mike_entrepreneur',
    email: 'mike@example.com',
    firstName: 'Mike',
    lastName: 'Davis',
    role: 'entrepreneur',
    status: 'inactive',
    joinDate: '2024-01-20',
    lastLogin: '2024-01-22',
    totalProjects: 2,
    profileComplete: false,
    avatar: null,
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    verified: false,
    subscription: 'free',
    loginCount: 12,
    lastActivity: '2024-01-22T09:15:00Z'
  },
  {
    id: '4',
    username: 'lisa_vendor',
    email: 'lisa@example.com',
    firstName: 'Lisa',
    lastName: 'Wilson',
    role: 'vendor',
    status: 'active',
    joinDate: '2024-01-05',
    lastLogin: '2024-01-25',
    totalProjects: 8,
    profileComplete: true,
    avatar: null,
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    verified: true,
    subscription: 'premium',
    loginCount: 156,
    lastActivity: '2024-01-25T14:20:00Z'
  },
  {
    id: '5',
    username: 'david_entrepreneur',
    email: 'david@example.com',
    firstName: 'David',
    lastName: 'Brown',
    role: 'entrepreneur',
    status: 'pending',
    joinDate: '2024-01-23',
    totalProjects: 0,
    profileComplete: false,
    avatar: null,
    phone: '+1 (555) 567-8901',
    location: 'Denver, CO',
    verified: false,
    subscription: 'free',
    loginCount: 3,
    lastActivity: '2024-01-23T11:00:00Z'
  },
  {
    id: '6',
    username: 'banned_user',
    email: 'banned@example.com',
    firstName: 'Alex',
    lastName: 'Taylor',
    role: 'vendor',
    status: 'banned',
    joinDate: '2024-01-01',
    lastLogin: '2024-01-10',
    totalProjects: 3,
    profileComplete: true,
    avatar: null,
    phone: '+1 (555) 678-9012',
    location: 'Miami, FL',
    verified: true,
    subscription: 'basic',
    loginCount: 89,
    lastActivity: '2024-01-10T16:30:00Z'
  },
  {
    id: '7',
    username: 'emma_vendor',
    email: 'emma@example.com',
    firstName: 'Emma',
    lastName: 'Wilson',
    role: 'vendor',
    status: 'active',
    joinDate: '2023-12-15',
    lastLogin: '2024-01-25',
    totalProjects: 18,
    profileComplete: true,
    avatar: null,
    phone: '+1 (555) 789-0123',
    location: 'Chicago, IL',
    verified: true,
    subscription: 'premium',
    loginCount: 234,
    lastActivity: '2024-01-25T12:15:00Z'
  },
  {
    id: '8',
    username: 'robert_entrepreneur',
    email: 'robert@example.com',
    firstName: 'Robert',
    lastName: 'Garcia',
    role: 'entrepreneur',
    status: 'active',
    joinDate: '2024-01-12',
    lastLogin: '2024-01-24',
    totalProjects: 7,
    profileComplete: true,
    avatar: null,
    phone: '+1 (555) 890-1234',
    location: 'Los Angeles, CA',
    verified: true,
    subscription: 'basic',
    loginCount: 67,
    lastActivity: '2024-01-24T13:45:00Z'
  }
];

const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    primary: 'bg-blue-50 text-blue-900 border-blue-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'default', size = 'md', className = '', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';
  
  const variants = {
    default: 'bg-white text-[#1D3557] border border-[#A8DADC] hover:bg-[#F1FAEE] focus:ring-[#457B9D] shadow-sm',
    primary: 'bg-[#457B9D] text-white hover:bg-[#1D3557] focus:ring-[#457B9D] shadow-lg hover:shadow-xl',
    secondary: 'bg-[#F1FAEE] text-[#1D3557] hover:bg-[#A8DADC] focus:ring-[#457B9D]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-lg hover:shadow-xl',
    outline: 'border border-[#A8DADC] bg-white text-[#1D3557] hover:bg-[#F1FAEE] focus:ring-[#457B9D]',
    ghost: 'text-[#1D3557] hover:bg-[#F1FAEE] focus:ring-[#457B9D]'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-[#A8DADC] transition-all duration-200 ${hover ? 'hover:shadow-md hover:scale-105' : ''} ${className}`}>
      {children}
    </div>
  );
};

const StatsCard = ({ title, value, icon, iconBg, description }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl shadow-lg w-12 h-12 flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-[#457B9D] mb-1">{title}</p>
        <p className="text-3xl font-bold text-[#1D3557] mb-2">{value}</p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

const Dropdown = ({ trigger, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 ${className}`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
};

const Notification = ({ message, type = 'info', onClose }) => {
  const types = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${types[type]} flex items-center space-x-2 shadow-lg animate-slide-in`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [sortField, setSortField] = useState('joinDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  // Add state for modals
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUserId, setBanUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  // Add state for delete reason
  const [deleteReason, setDeleteReason] = useState('');
  // Add state for reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectUserId, setRejectUserId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  // 1. Add state for email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailUser, setEmailUser] = useState(null);
  const [projectsCount, setProjectsCount] = useState('-');
  const [loginCount, setLoginCount] = useState('-');
  const [detailsLoading, setDetailsLoading] = useState(false);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const fetchUsers = () => {
    const token = localStorage.getItem('token');
    axios.get('https://backendelevante-production.up.railway.app/api/users/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUsers(res.data))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter out deleted users
  const filteredUsers = users.filter(user => {
    if (user.isDeleted) return false;

    // Search by username, email, fullName, or phone
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    // Status filter (backend logic)
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'approved') {
        matchesStatus = user.status === 'approved' && !user.isBlocked;
      } else if (statusFilter === 'pending') {
        matchesStatus = user.status === 'pending';
      } else if (statusFilter === 'rejected') {
        matchesStatus = user.status === 'rejected';
      } else if (statusFilter === 'banned') {
        matchesStatus = user.isBlocked;
      }
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats based on backend logic
  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter(u => u.status === 'approved' && !u.isBlocked).length,
    pending: filteredUsers.filter(u => u.status === 'pending').length,
    banned: filteredUsers.filter(u => u.isBlocked).length,
    rejected: filteredUsers.filter(u => u.status === 'rejected').length
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Update handleStatusChange to handle approve/reject/ban/unban
  const handleStatusChange = async (userId, action) => {
    const token = localStorage.getItem('token');
    try {
      if (action === 'ban') {
        setBanUserId(userId);
        setShowBanModal(true);
        return;
      } else if (action === 'unban') {
        await axios.put(`https://backendelevante-production.up.railway.app/api/users/${userId}/unblock`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification('User unblocked', 'success');
      } else if (action === 'approve') {
        await axios.put(`https://backendelevante-production.up.railway.app/api/users/${userId}/status`, { action: 'approve' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showNotification('User approved', 'success');
      } else if (action === 'reject') {
        setRejectUserId(userId);
        setShowRejectModal(true);
        return;
      }
      fetchUsers();
    } catch (err) {
      showNotification('Failed to update user status', 'error');
          }
  };

  // Ban modal confirm
  const handleBanConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!banReason) return showNotification('Block reason is required', 'warning');
    try {
      await axios.put(`https://backendelevante-production.up.railway.app/api/users/${banUserId}/block`, { blockReason: banReason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('User blocked', 'success');
      setShowBanModal(false);
      setBanReason('');
      setBanUserId(null);
      fetchUsers();
    } catch (err) {
      showNotification('Failed to block user', 'error');
    }
  };

  // Delete modal confirm
  const handleDelete = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!deleteReason) return showNotification('Delete reason is required', 'warning');
    try {
      await axios.delete(`https://backendelevante-production.up.railway.app/api/users/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId: deleteUserId, reason: deleteReason }
      });
      showNotification('User deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeleteUserId(null);
      setDeleteReason('');
      fetchUsers();
    } catch (err) {
      showNotification('Failed to delete user', 'error');
    }
  };

  // Reject modal confirm
  const handleRejectConfirm = async () => {
    const token = localStorage.getItem('token');
    if (!rejectReason) return showNotification('Rejection reason is required', 'warning');
    try {
      await axios.put(`https://backendelevante-production.up.railway.app/api/users/${rejectUserId}/status`, { action: 'reject', rejectionReason: rejectReason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('User rejected', 'success');
      setShowRejectModal(false);
      setRejectUserId(null);
      setRejectReason('');
      fetchUsers();
    } catch (err) {
      showNotification('Failed to reject user', 'error');
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      showNotification('Please select users first', 'warning');
      return;
    }

    switch (action) {
      case 'activate':
        setUsers(users.map(user => 
          selectedUsers.includes(user._id || user.id) ? { ...user, status: 'active' } : user
        ));
        showNotification(`${selectedUsers.length} users activated`, 'success');
        break;
      case 'deactivate':
        setUsers(users.map(user => 
          selectedUsers.includes(user._id || user.id) ? { ...user, status: 'inactive' } : user
        ));
        showNotification(`${selectedUsers.length} users deactivated`, 'success');
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          setUsers(users.filter(user => !selectedUsers.includes(user._id || user.id)));
          showNotification(`${selectedUsers.length} users deleted`, 'success');
        }
        break;
    }
    setSelectedUsers([]);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // 2. Update handleSendEmail to open modal
  const handleSendEmail = (userId) => {
    const user = users.find(u => u._id === userId || u.id === userId);
    setEmailUser(user);
    setEmailSubject('');
    setEmailMessage('');
    setShowEmailModal(true);
  };

  // 3. Add handler for sending email (placeholder API)
  const handleSendEmailConfirm = async () => {
    if (!emailSubject || !emailMessage) {
      showNotification('Please enter subject and message', 'warning');
      return;
    }
    try {
      // Placeholder: replace with real API if available
      // await axios.post('/api/send-email', { to: emailUser.email, subject: emailSubject, message: emailMessage });
      setShowEmailModal(false);
      showNotification('Email sent successfully', 'success');
    } catch (err) {
      showNotification('Failed to send email', 'error');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user._id || user.id));
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Username', 'Email', 'Name', 'Role', 'Status', 'Join Date', 'Projects', 'Location'],
      ...filteredUsers.map(user => [
        user.username,
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.role,
        user.status,
        user.joinDate,
        user.totalProjects,
        user.location
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Users exported successfully', 'success');
  };

  // Update getStatusBadge to match backend
  const getStatusBadge = (user) => {
    if (user.isBlocked) {
      return <Badge variant="danger"><Ban className="w-3 h-3 mr-1" />Banned</Badge>;
    }
    if (user.status === 'approved') {
      return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    }
    if (user.status === 'pending') {
      return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
    if (user.status === 'rejected') {
      return <Badge variant="danger"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    return <Badge variant="default">Unknown</Badge>;
  };

  // Update getRoleBadge to match backend
  const getRoleBadge = (role) => {
    const roleConfig = {
      entrepreneur: { variant: 'primary', label: 'Entrepreneur' },
      supplier: { variant: 'info', label: 'Supplier' },
      investor: { variant: 'purple', label: 'Investor' }
    };
    const config = roleConfig[role] || { variant: 'default', label: role };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActivityStatus = (lastActivity) => {
    const now = new Date();
    const last = new Date(lastActivity);
    const diffHours = Math.floor((now - last) / (1000 * 60 * 60));
    
    if (diffHours < 1) return { label: 'Online', color: 'bg-green-400' };
    if (diffHours < 24) return { label: 'Today', color: 'bg-yellow-400' };
    if (diffHours < 168) return { label: 'This week', color: 'bg-blue-400' };
    return { label: 'Inactive', color: 'bg-gray-400' };
  };

  // Replace the status <select> with a Listbox
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'banned', label: 'Banned' },
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'supplier', label: 'Supplier' },
    { value: 'investor', label: 'Investor' },
  ];

  useEffect(() => {
    if (showUserDetails && selectedUser) {
      setDetailsLoading(true);
      setProjectsCount('-');
      setLoginCount('-');
      const token = localStorage.getItem('token');
      const userId = selectedUser._id || selectedUser.id;
      // Fetch projects count
      axios.get(`https://backendelevante-production.up.railway.app/api/businesses?owner=${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProjectsCount(Array.isArray(res.data) ? res.data.length : '-'))
        .catch(() => setProjectsCount('-'));
      // Fetch login count
      axios.get(`https://backendelevante-production.up.railway.app/api/activity-logs?userId=${userId}&actionType=login`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setLoginCount(Array.isArray(res.data) ? res.data.length : '-'))
        .catch(() => setLoginCount('-'));
      setDetailsLoading(false);
    }
  }, [showUserDetails, selectedUser]);

  return (
    <div className="min-h-screen bg-[#EEF8F7]">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 space-y-8 mt-2">
        {/* Search and Filters - moved to top */}
        <Card className="p-6 bg-[#F1FAEE] border-[#457B9D] mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center lg:gap-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#457B9D] pointer-events-none" />
              <input
                type="text"
                placeholder="Search by username, email, name, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full h-full border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none bg-white shadow-sm"
              />
        </div>
            {/* Filters */}
            <div className="flex flex-row gap-3 justify-end min-w-[320px]">
              <div className="w-56">
                <Listbox value={roleFilter} onChange={setRoleFilter}>
                  {({ open }) => (
                    <div className="relative w-full min-w-[180px]">
                      <Listbox.Button className="w-full min-w-[180px] text-left border border-[#A8DADC] rounded-lg px-3 py-3 h-full bg-white focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none flex items-center justify-between whitespace-nowrap truncate">
                        <span className="truncate">{roleOptions.find(opt => opt.value === roleFilter)?.label}</span>
                        <ChevronDown className="w-4 h-4 ml-2 text-[#457B9D]" />
                      </Listbox.Button>
                      {open && (
                        <Listbox.Options className="absolute z-10 mt-1 w-full min-w-[180px] bg-white border-r border-l border-b border-[#A8DADC] rounded-b-lg shadow-lg focus:outline-none">
                          {roleOptions.map(option => (
                            <Listbox.Option
                              key={option.value}
                              value={option.value}
                              className={({ active, selected }) =>
                                `cursor-pointer select-none px-4 py-2 text-[#1D3557] ${
                                  active ? 'bg-[#F1FAEE]' : ''
                                } ${selected ? 'font-bold' : ''}`
                              }
                            >
                              {option.label}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      )}
                    </div>
                  )}
                </Listbox>
              </div>
              <div className="w-56">
                <Listbox value={statusFilter} onChange={setStatusFilter}>
                  {({ open }) => (
                    <div className="relative w-full min-w-[180px]">
                      <Listbox.Button className="w-full min-w-[180px] text-left border border-[#A8DADC] rounded-lg px-3 py-3 h-full bg-white focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none flex items-center justify-between whitespace-nowrap truncate">
                        <span className="truncate">{statusOptions.find(opt => opt.value === statusFilter)?.label}</span>
                        <ChevronDown className="w-4 h-4 ml-2 text-[#457B9D]" />
                      </Listbox.Button>
                      {open && (
                        <Listbox.Options className="absolute z-10 mt-1 w-full min-w-[180px] bg-white border-r border-l border-b border-[#A8DADC] rounded-b-lg shadow-lg focus:outline-none">
                          {statusOptions.map(option => (
                            <Listbox.Option
                              key={option.value}
                              value={option.value}
                              className={({ active, selected }) =>
                                `cursor-pointer select-none px-4 py-2 text-[#1D3557] ${
                                  active ? 'bg-[#F1FAEE]' : ''
                                } ${selected ? 'font-bold' : ''}`
                              }
                            >
                              {option.label}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      )}
                    </div>
                  )}
                </Listbox>
              </div>
            </div>
          </div>
        </Card>
        {/* Stats Cards - now below search/filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.total}
            icon={<Users className="w-6 h-6" style={{ color: '#457B9D' }} />}
            iconBg="bg-[#E6F0FA]"
            description="All registered users"
          />
          <StatsCard
            title="Approved"
            value={stats.active}
            icon={<UserCheck className="w-6 h-6" style={{ color: '#22C55E' }} />}
            iconBg="bg-[#D1FADF]"
            description="Currently approved"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="w-6 h-6" style={{ color: '#F1C40F' }} />}
            iconBg="bg-[#FEF9C3]"
            description="Awaiting approval"
          />
          <StatsCard
            title="Banned"
            value={stats.banned}
            icon={<Ban className="w-6 h-6" style={{ color: '#EF4444' }} />}
            iconBg="bg-[#FEE2E2]"
            description="Restricted access"
          />
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="p-4 bg-[#F1FAEE] border-[#A8DADC]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1D3557]">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="success" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button size="sm" variant="warning" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-[#A8DADC]">
              <thead className="bg-[#457B9D]">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[#A8DADC] text-white focus:ring-[#F1FAEE]"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#1D3557] transition-colors"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>User</span>
                      {sortField === 'firstName' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#1D3557] transition-colors"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Role</span>
                      {sortField === 'role' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#1D3557] transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#1D3557] transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Join Date</span>
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#A8DADC]">
                {paginatedUsers.map((user, index) => {
                  const activityStatus = getActivityStatus(user.updatedAt || user.lastLogin);
                  return (
                    <tr key={user._id || user.id || index} className="hover:bg-[#F1FAEE] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id || user.id)}
                          onChange={() => handleSelectUser(user._id || user.id)}
                          className="rounded border-[#A8DADC] text-[#457B9D] focus:ring-[#457B9D]"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] flex items-center justify-center shadow-lg overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <span className="text-white font-medium text-sm">
                                  {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0,2) : ''}
                                </span>
                              )}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${activityStatus.color}`} title={activityStatus.label} />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-[#1D3557]">{user.fullName}</div>
                            <div className="text-xs text-[#457B9D]">@{user.username}</div>
                            <div className="text-xs text-[#457B9D]">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-[#1D3557]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-xs text-[#457B9D]">
                          {user.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days ago' : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${activityStatus.color}`} />
                          <span className="text-xs text-[#457B9D]">{activityStatus.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendEmail(user._id || user.id)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          
                          <Dropdown
                            trigger={
                              <Button size="sm" variant="ghost">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            }
                          >
                            <div className="py-1">
                              {user.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(user._id || user.id, 'approve')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-[#1D3557] hover:bg-[#F1FAEE]"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(user._id || user.id, 'reject')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              {(user.status === 'approved' && !user.isBlocked) && (
                                <>
                                <button
                                    onClick={() => handleStatusChange(user._id || user.id, 'ban')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Ban User
                                </button>
                                  <button
                                    onClick={() => handleDelete(user._id || user.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Delete User
                                  </button>
                                </>
                              )}
                              
                              {user.isBlocked && (
                                <button
                                  onClick={() => handleStatusChange(user._id || user.id, 'unban')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Unban User
                                </button>
                              )}
                              
                            </div>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {paginatedUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-[#457B9D]" />
              <h3 className="text-lg font-medium text-[#1D3557] mb-2">No users found</h3>
              <p className="text-[#457B9D]">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#1D3557]">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedUsers.length)} of {sortedUsers.length} users
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-[#A8DADC] rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? "primary" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-[#1D3557]">User Details</h3>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="text-[#457B9D] hover:text-[#1D3557] transition-colors p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  {/* User Header */}
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC] rounded-lg">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] flex items-center justify-center shadow-lg overflow-hidden">
                      {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} alt="avatar" className="h-20 w-20 object-cover rounded-full" />
                      ) : (
                        <span className="text-white font-medium text-xl">
                          {selectedUser.fullName ? selectedUser.fullName.charAt(0) : (selectedUser.username?.charAt(0) || '?')}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xl font-bold text-[#1D3557]">
                          {selectedUser.fullName || selectedUser.username}
                        </h4>
                      </div>
                      <p className="text-[#457B9D] font-medium">@{selectedUser.username}</p>
                      {/* Email removed from header, will show in contact info only */}
                    </div>
                  </div>
                  {/* User Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-[#F1FAEE] rounded-lg">
                      <div className="text-2xl font-bold text-[#457B9D]">{detailsLoading ? <span>...</span> : projectsCount}</div>
                      <div className="text-sm text-[#1D3557]">Projects</div>
                    </div>
                    <div className="text-center p-3 bg-[#F1FAEE] rounded-lg">
                      <div className="text-2xl font-bold text-[#457B9D]">{detailsLoading ? <span>...</span> : loginCount}</div>
                      <div className="text-sm text-[#1D3557]">Logins</div>
                    </div>
                    <div className="text-center p-3 bg-[#F1FAEE] rounded-lg">
                      <div className="text-2xl font-bold text-[#457B9D]">
                        {selectedUser.createdAt ? Math.floor((new Date() - new Date(selectedUser.createdAt)) / (1000 * 60 * 60 * 24)) : '-'}
                      </div>
                      <div className="text-sm text-[#1D3557]">Days Active</div>
                    </div>
                    <div className="text-center p-3 bg-[#F1FAEE] rounded-lg">
                      <div className="text-2xl font-bold text-[#457B9D]">
                        {getActivityStatus(selectedUser.updatedAt || selectedUser.lastLogin).label}
                      </div>
                      <div className="text-sm text-[#1D3557]">Status</div>
                    </div>
                  </div>
                  {/* User Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[#1D3557] mb-1">Contact Information</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm text-[#1D3557]">{selectedUser.email}</span>
                          </div>
                          {selectedUser.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-[#457B9D]" />
                              <span className="text-sm text-[#1D3557]">{selectedUser.phone}</span>
                            </div>
                          )}
                          {(selectedUser.country || selectedUser.city || selectedUser.state) && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-[#457B9D]" />
                              <span className="text-sm text-[#1D3557]">{[selectedUser.country, selectedUser.city, selectedUser.state].filter(Boolean).join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#1D3557] mb-1">Account Status</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-[#457B9D]">Role:</span>
                            {getRoleBadge(selectedUser.role)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-semibold text-[#457B9D]">Status:</span>
                            {getStatusBadge(selectedUser)}
                          </div>
                          {selectedUser.rejectionReason && (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-500">Reason: {selectedUser.rejectionReason}</span>
                            </div>
                          )}
                          {selectedUser.isBlocked && (
                            <div className="flex items-center space-x-2">
                              <Ban className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-500">Blocked: {selectedUser.blockReason || 'By admin'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Profile Completeness */}
                      <div>
                        <label className="block text-sm font-bold text-[#1D3557] mb-1">Profile Status</label>
                        <div className="flex items-center space-x-2">
                          {selectedUser.profileComplete ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-600">Complete</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-600">Incomplete</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-[#1D3557] mb-1">Activity Timeline</label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm font-semibold text-[#457B9D]">Joined:</span>
                            <span className="text-sm text-[#1D3557]">
                              {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm font-semibold text-[#457B9D]">Last Login:</span>
                            <span className="text-sm text-[#1D3557]">
                              {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase() : 'Never'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm font-semibold text-[#457B9D]">Last Activity:</span>
                            <span className="text-sm text-[#1D3557]">
                              {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Role-specific fields */}
                      {selectedUser.role === 'entrepreneur' && (
                        <div>
                          <label className="block text-sm font-bold text-[#1D3557] mb-1">Entrepreneur Info</label>
                          <div className="space-y-1 text-sm text-[#1D3557]">
                            {selectedUser.startupName && <div>Startup: {selectedUser.startupName}</div>}
                            {selectedUser.ideaDescription && <div>Idea: {selectedUser.ideaDescription}</div>}
                            {selectedUser.startupStage && <div>Stage: {selectedUser.startupStage}</div>}
                            {selectedUser.pitchLink && <div>Pitch Link: <a href={selectedUser.pitchLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View</a></div>}
                            {selectedUser.pitchPdf && <div>Pitch PDF: <a href={selectedUser.pitchPdf} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download</a></div>}
                          </div>
                        </div>
                      )}
                      {selectedUser.role === 'supplier' && (
                        <div>
                          <label className="block text-sm font-bold text-[#1D3557] mb-1">Supplier Info</label>
                          <div className="space-y-1 text-sm text-[#1D3557]">
                            {selectedUser.supplierType && <div>Type: {selectedUser.supplierType}</div>}
                            {selectedUser.serviceField && <div>Field: {selectedUser.serviceField}</div>}
                            {selectedUser.portfolioLink && <div>Portfolio: <a href={selectedUser.portfolioLink} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View</a></div>}
                            {selectedUser.companyProfile && <div>Company Profile: {selectedUser.companyProfile}</div>}
                          </div>
                        </div>
                      )}
                      {selectedUser.role === 'investor' && (
                        <div>
                          <label className="block text-sm font-bold text-[#1D3557] mb-1">Investor Info</label>
                          <div className="space-y-1 text-sm text-[#1D3557]">
                            {selectedUser.investmentRange && <div>Investment Range: {selectedUser.investmentRange.min} - {selectedUser.investmentRange.max}</div>}
                            {selectedUser.linkedIn && <div>LinkedIn: <a href={selectedUser.linkedIn} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Profile</a></div>}
                            {selectedUser.website && <div>Website: <a href={selectedUser.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Visit</a></div>}
                            {selectedUser.typeOfSupport && selectedUser.typeOfSupport.length > 0 && <div>Support: {selectedUser.typeOfSupport.join(', ')}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Extra fields for admin or debug */}
                  <div className="mt-4 text-xs text-gray-400">
                    <div>User ID: {selectedUser._id || selectedUser.id}</div>
                    {selectedUser.isDeleted && <div>Deleted: Yes</div>}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      {/* Add Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-[#1D3557] mb-4">Ban User</h3>
            <label className="block text-sm font-medium text-[#1D3557] mb-2">Block Reason <span className="text-red-500">*</span></label>
            <textarea
              className="w-full border border-[#A8DADC] rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for banning this user..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowBanModal(false); setBanReason(''); setBanUserId(null); }}>Cancel</Button>
              <Button variant="danger" onClick={handleBanConfirm}>Ban</Button>
            </div>
          </div>
        </div>
      )}
      {/* Add Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-[#1D3557] mb-4">Delete User</h3>
            <label className="block text-sm font-medium text-[#1D3557] mb-2">Delete Reason <span className="text-red-500">*</span></label>
            <textarea
              className="w-full border border-[#A8DADC] rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none"
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for deleting this user..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteUserId(null); setDeleteReason(''); }}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
            </div>
          </div>
        </div>
      )}
      {/* Add Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-[#1D3557] mb-4">Reject User</h3>
            <label className="block text-sm font-medium text-[#1D3557] mb-2">Rejection Reason <span className="text-red-500">*</span></label>
            <textarea
              className="w-full border border-[#A8DADC] rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for rejecting this user..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowRejectModal(false); setRejectUserId(null); setRejectReason(''); }}>Cancel</Button>
              <Button variant="danger" onClick={handleRejectConfirm}>Reject</Button>
            </div>
          </div>
        </div>
      )}
      {/* Add Email Modal */}
      {showEmailModal && emailUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold text-[#1D3557] mb-4">Send Email to {emailUser.email}</h3>
            <input
              className="w-full border border-[#A8DADC] rounded mb-2 p-2 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none"
              placeholder="Subject"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
            />
            <textarea
              className="w-full border border-[#A8DADC] rounded mb-4 p-2 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none"
              placeholder="Message"
              value={emailMessage}
              onChange={e => setEmailMessage(e.target.value)}
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSendEmailConfirm}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
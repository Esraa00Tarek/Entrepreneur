import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchFeedback,
  fetchReviews,
  updateReportStatus,
  deletePlatformReview,
  restorePlatformReview
} from '../../redux/slices/feedbackSlice';
import { 
  Star, 
  MessageCircle, 
  Filter, 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle, 
  Clock,
  X,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  Users,
  Calendar,
  MoreHorizontal,
  Reply,
  Archive,
  Flag
} from 'lucide-react';
import AnimatedMoneyBackground from '../animated-money-background';

const AdminFeedback = () => {
  const dispatch = useDispatch();
  const { feedback, reviews, loading, error } = useSelector(state => state.feedback);
  const [activeTab, setActiveTab] = useState('feedback');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    dispatch(fetchFeedback());
    dispatch(fetchReviews());
  }, [dispatch]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'ux': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'bug': return 'bg-red-50 text-red-700 border-red-200';
      case 'suggestion': return 'bg-green-50 text-green-700 border-green-200';
      case 'compliment': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'approved': return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'entrepreneur': return 'text-emerald-600 bg-emerald-50';
      case 'investor': return 'text-blue-600 bg-blue-50';
      case 'supplier': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return `${Math.floor(diffInHours / 168)}w ago`;
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesFilter && matchesStatus;
  });

  const filteredReviews = reviews.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = (action, item) => {
    setActionType(action);
    setSelectedItem(item);
    setShowModal(true);
    setReplyMessage('');
  };

  const executeAction = async () => {
    try {
      if (actionType === 'status' && selectedItem) {
        await dispatch(updateReportStatus({ id: selectedItem._id, status: selectedItem.nextStatus }));
        await dispatch(fetchFeedback());
      } else if (actionType === 'delete' && selectedItem) {
        await dispatch(deletePlatformReview(selectedItem._id));
        await dispatch(fetchReviews());
      } else if (actionType === 'restore' && selectedItem) {
        await dispatch(restorePlatformReview(selectedItem._id));
        await dispatch(fetchReviews());
      }
    setShowModal(false);
    setSelectedItem(null);
      setReplyMessage('');
    } catch (err) {
      alert('Action failed. Please try again.');
    }
  };

  const getStats = () => {
    const totalFeedback = feedback.length;
    const totalReviews = reviews.length;
    const pendingCount = feedback.filter(f => f.status === 'pending').length +
      reviews.filter(r => r.status === 'pending').length;
    const resolvedCount = feedback.filter(f => f.status === 'resolved').length +
      reviews.filter(r => r.status === 'approved').length;
    const highPriorityCount = feedback.filter(f => f.priority === 'high').length;
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return { totalFeedback, totalReviews, pendingCount, resolvedCount, highPriorityCount, avgRating };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen relative">
        <AnimatedMoneyBackground />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="text-center">
            <p className="text-[#1d3557] text-lg font-bold mb-2">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Reports</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalFeedback}</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Reviews</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalReviews}</p>
              <p className="text-xs text-slate-500 mt-1">Avg rating: {stats.avgRating.toFixed(1)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-slate-900">{stats.pendingCount}</p>
              <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Resolved</p>
              <p className="text-3xl font-bold text-slate-900">{stats.resolvedCount}</p>
              <p className="text-xs text-slate-500 mt-1">Completed</p>
            </div>
          </div>
        </div>

        {/* Tabs - Marketplace style */}
        <div className="mb-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1">
            <div className="flex">
              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex-1 px-2 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'feedback'
                    ? 'bg-[#457B9D] text-white shadow-sm'
                    : 'text-gray-700 bg-white hover:bg-[#F1FAEE]'
                }`}
              >
                <MessageCircle className="w-5 h-5 inline mr-2" />
                Reports
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-2 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'bg-[#457B9D] text-white shadow-sm'
                    : 'text-gray-700 bg-white hover:bg-[#F1FAEE]'
                }`}
              >
                <Star className="w-5 h-5 inline mr-2" />
                Reviews
              </button>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-slate-200 bg-white">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search feedback, reviews, or users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {activeTab === 'feedback' && (
                  <div className="relative">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="ux">UX Issue</option>
                      <option value="bug">Bug Report</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="compliment">Compliment</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      dispatch(fetchFeedback({ status: e.target.value === 'all' ? undefined : e.target.value }));
                    }}
                    className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-white">
            {activeTab === 'feedback' ? (
              filteredFeedback.length > 0 ? (
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow relative">
                    {/* Status badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: item.status === 'pending' ? '#F1FAEE' : item.status === 'reviewed' ? '#FFE066' : '#D4F5E9',
                        color: item.status === 'pending' ? '#457B9D' : item.status === 'reviewed' ? '#B68900' : '#219150',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      {item.status === 'pending' && <Clock className="w-4 h-4" style={{ color: '#457B9D' }} />}
                      {item.status === 'reviewed' && <CheckCircle className="w-4 h-4" style={{ color: '#B68900' }} />}
                      {item.status === 'resolved' && <CheckCircle className="w-4 h-4" style={{ color: '#219150' }} />}
                      <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(item.type)}`}>
                            {item.type.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.priority)}`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-slate-600 mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full ${getRoleColor(item.userRole)} flex items-center justify-center mr-2`}>
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-700">{item.userName}</p>
                              <p className="text-xs text-slate-500">{item.userRole}</p>
                            </div>
                          </div>
                          <span>•</span>
                          <span>{getTimeAgo(item.createdAt)}</span>
                          <span>•</span>
                          <span>{item.deviceType}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleAction('view', item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleAction('status', { ...item, nextStatus: item.status === 'pending' ? 'reviewed' : 'resolved' })}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="mb-2">
                    <MessageCircle className="w-16 h-16 mx-auto" style={{ color: '#1d3557' }} />
                  </div>
                  <h3 className="text-lg font-medium" style={{ color: '#1d3557' }}>No reports found</h3>
              </div>
              )
            ) : (
              filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow relative">
                    {/* Status badge for deleted reviews */}
                    {item.isDeleted && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: '#F1FAEE', color: '#B68900', border: '1px solid #e2e8f0' }}
                      >
                        <Clock className="w-4 h-4" style={{ color: '#B68900' }} />
                        <span>Deleted</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < item.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-slate-600 mb-4 line-clamp-3">{item.message}</p>
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full ${getRoleColor(item.userRole)} flex items-center justify-center mr-2`}>
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-700">{item.userName}</p>
                              <p className="text-xs text-slate-500">{item.userRole}</p>
                            </div>
                          </div>
                          <span>•</span>
                          <span>{getTimeAgo(item.createdAt)}</span>
                          <span>•</span>
                          <span>{item.helpful} helpful</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleAction('view', item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                          {item.isDeleted ? (
                        <button
                              onClick={() => handleAction('restore', item)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                          ) : (
                        <button
                              onClick={() => handleAction('delete', item)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                              <Trash2 className="w-4 h-4" />
                        </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="mb-2">
                    <Star className="w-16 h-16 mx-auto" style={{ color: '#1d3557' }} />
                  </div>
                  <h3 className="text-lg font-medium" style={{ color: '#1d3557' }}>No reviews yet</h3>
              </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {actionType === 'view' && 'View Details'}
                {actionType === 'status' && 'Update Report Status'}
                {actionType === 'delete' && 'Delete Review'}
                {actionType === 'restore' && 'Restore Review'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {selectedItem && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">{selectedItem.title}</h4>
                  <p className="text-slate-600 text-sm">
                    {selectedItem.description || selectedItem.message}
                  </p>
                </div>
                
                {actionType === 'reply' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your Reply
                    </label>
                    <textarea
                      rows={4}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your reply..."
                    />
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeAction}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {actionType === 'view' && 'Close'}
                    {actionType === 'status' && 'Update Status'}
                    {actionType === 'delete' && 'Delete'}
                    {actionType === 'restore' && 'Restore'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
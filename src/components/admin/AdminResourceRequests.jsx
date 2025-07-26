import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Edit, Eye, TrendingUp, Clock, CheckCircle, AlertCircle, FileText, Package, ArrowDown, RefreshCw } from 'lucide-react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'default', size = 'md', className = '', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500 shadow-sm',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500'
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
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, iconColor, iconBg, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl shadow-lg w-12 h-12 flex items-center justify-center ${iconBg}`}> 
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-700'}`}> 
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : trend < 0 ? <ArrowDown className="w-4 h-4" /> : null}
            <span className="text-sm font-medium">{trend > 0 ? '+' : trend < 0 ? '' : ''}{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-[#457B9D] mb-1">{title}</p>
        <p className="text-3xl font-bold text-[#1D3557] mb-2">{value}</p>
      </div>
    </div>
  );
};

export default function AdminResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/requests', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else if (Array.isArray(res.data.requests)) {
        setRequests(res.data.requests);
      } else {
        setRequests([]);
      }
    })
    .catch(err => {
      setRequests([]);
      console.error(err);
    });
  }, []);

  const filteredRequests = Array.isArray(requests) ? requests.filter(request => {
    const matchesSearch = (request.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.entrepreneurName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const handleStatusUpdate = async (requestId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/api/requests/${requestId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch requests after update
              const res = await axios.get('http://localhost:5000/api/requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to update request status', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="info">Open</Badge>;
      case 'under_review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'in_progress':
        return <Badge variant="purple">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'closed':
        return <Badge variant="danger">Closed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    return type === 'service' 
      ? <Badge variant="info" className="ml-2">
          <FileText className="w-3 h-3 mr-1" />
          Service
        </Badge>
      : <Badge variant="default" className="ml-2">
          <Package className="w-3 h-3 mr-1" />
          Supply
        </Badge>;
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger" className="ml-2">High</Badge>;
      case 'medium':
        return <Badge variant="warning" className="ml-2">Medium</Badge>;
      case 'low':
        return <Badge variant="default" className="ml-2">Low</Badge>;
      default:
        return null;
    }
  };

  const statusCounts = {
    all: requests.length,
    open: requests.filter(r => r.status === 'open').length,
    under_review: requests.filter(r => r.status === 'under_review').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-[#EEF8F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {/* If there is a main heading (h1, h2, etc.) at the top, remove or comment it out. */}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Open Requests" 
            value={statusCounts.open} 
            icon={AlertCircle} 
            iconColor="#457B9D"
            iconBg="bg-[#E6F0FA]"
            trend={12}
            trendValue="12%"
          />
          <StatCard 
            title="Under Review" 
            value={statusCounts.under_review} 
            icon={Clock} 
            iconColor="#F1C40F"
            iconBg="bg-[#FEF9C3]"
            trend={0}
            trendValue="0%"
          />
          <StatCard 
            title="In Progress" 
            value={statusCounts.in_progress} 
            icon={RefreshCw} 
            iconColor="#A259FF"
            iconBg="bg-[#F3E8FF]"
            trend={0}
            trendValue="0%"
          />
          <StatCard 
            title="Completed" 
            value={statusCounts.completed} 
            icon={CheckCircle} 
            iconColor="#22C55E"
            iconBg="bg-[#D1FADF]"
            trend={8}
            trendValue="8%"
          />
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 border-[#E6F0FA]">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by request title or entrepreneur name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-[#457B9D] outline-none transition-colors duration-200 bg-white shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-[#457B9D]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-[#A8DADC] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#457B9D] focus:border-[#457B9D] outline-none transition-colors duration-200 bg-white shadow-sm"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Requests Table */}
        <Card className="overflow-hidden border-[#E6F0FA]">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-[#A8DADC]">
              <thead className="bg-[#457B9D]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Entrepreneur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Request Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#A8DADC]">
                {filteredRequests.map((request, index) => (
                  <tr key={request.id} className="hover:bg-[#F1FAEE] transition-colors">
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] flex items-center justify-center shadow-lg">
                            <span className="text-white font-medium text-sm">
                              {request.entrepreneurName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-[#1D3557]">{request.entrepreneurName}</div>
                          <div className="text-xs text-[#457B9D]">ID: {request.entrepreneurId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[#1D3557]">{request.title}</div>
                        <div className="text-xs text-[#457B9D] line-clamp-2">{request.description}</div>
                        <div className="flex items-center">
                          {getTypeBadge(request.type)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="text-sm font-medium text-[#1D3557]">{request.budget || 'Not specified'}</div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {getPriorityBadge(request.priority)}
                    </td>
                    <td className="px-4 py-3 align-middle text-xs text-[#457B9D]">
                      {new Date(request.createdDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center space-x-2">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                          className="text-xs border border-[#A8DADC] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#457B9D] focus:border-[#457B9D] outline-none transition-colors duration-200"
                        >
                          <option value="open">Open</option>
                          <option value="under_review">Under Review</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="closed">Closed</option>
                        </select>
                        <Button size="sm" variant="ghost" className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#EEF8F7]">
                          <Eye className="w-6 h-6 text-[#457B9D]" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#A8DADC] mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-[#1D3557] mb-2">No requests found</h3>
              <p className="text-[#457B9D]">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

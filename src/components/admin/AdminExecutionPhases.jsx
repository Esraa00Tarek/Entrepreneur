import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, TrendingUp, AlertCircle, Users, Activity, Calendar, BarChart3 } from 'lucide-react';
import axios from 'axios';

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
    <div className={`bg-white rounded-xl shadow-lg border border-slate-200 ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    slate: 'text-slate-600 bg-slate-50'
  };

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200" hover>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-[#457B9D] mb-1">{title}</p>
        <p className="text-3xl font-bold text-[#1D3557] mb-2">{value}</p>
      </div>
    </Card>
  );
};

const ProgressBar = ({ progress, className = '' }) => {
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full bg-slate-200 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressColor(progress)}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default function AdminExecutionPhases() {
  const [phases, setPhases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('https://backendelevante-production.up.railway.app/api/execution-phases', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (Array.isArray(res.data)) {
          setPhases(res.data);
        } else if (Array.isArray(res.data.phases)) {
          setPhases(res.data.phases);
        } else {
          setPhases([]);
        }
      })
      .catch(err => {
        setPhases([]);
        console.error(err);
      });
  }, []);

  const filteredPhases = phases.filter(phase => {
    const matchesSearch = phase.business?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phase.createdBy?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phase.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || phase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planning':
        return <Badge variant="info">Planning</Badge>;
      case 'in_progress':
        return <Badge variant="purple">In Progress</Badge>;
      case 'review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'on_hold':
        return <Badge variant="danger">On Hold</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger" className="ml-2">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning" className="ml-2">Medium</Badge>;
      case 'low':
        return <Badge variant="default" className="ml-2">Low</Badge>;
      default:
        return null;
    }
  };

  const getConfirmationIcon = (confirmed) => {
    return confirmed 
      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
      : <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const statusCounts = {
    total: phases.length,
    in_progress: phases.filter(p => p.status === 'in_progress').length,
    completed: phases.filter(p => p.status === 'completed').length,
    review: phases.filter(p => p.status === 'review').length,
    on_hold: phases.filter(p => p.status === 'on_hold').length,
  };

  const averageProgress = Math.round(phases.reduce((acc, phase) => acc + phase.progress, 0) / phases.length);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      

        {/* Stats Grid */}
        <div className="w-full overflow-x-auto mb-8">
          <div className="flex gap-6 min-w-[900px]">
            <div className="flex-1 min-w-[220px]"><StatCard 
              title="Total Phases" 
              value={statusCounts.total} 
              icon={Users} 
              color="slate"
            /></div>
            <div className="flex-1 min-w-[220px]"><StatCard 
              title="In Progress" 
              value={statusCounts.in_progress} 
              icon={Activity} 
              color="purple"
            /></div>
            <div className="flex-1 min-w-[220px]"><StatCard 
              title="Under Review" 
              value={statusCounts.review} 
              icon={Clock} 
              color="amber"
            /></div>
            <div className="flex-1 min-w-[220px]"><StatCard 
              title="Completed" 
              value={statusCounts.completed} 
              icon={CheckCircle} 
              color="emerald"
            /></div>
            <div className="flex-1 min-w-[220px]"><StatCard 
              title="On Hold" 
              value={statusCounts.on_hold} 
              icon={AlertCircle} 
              color="red"
            /></div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by project, vendor, entrepreneur, or phase..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Phases Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#457B9D]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider align-middle">
                    Participants
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider align-middle">
                    Project Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider align-middle">
                    Status & Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider align-middle">
                    Confirmations
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider align-middle">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider align-middle">
                    Timeline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider align-middle">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredPhases.map((phase) => {
                  const daysRemaining = getDaysRemaining(phase.expectedEndDate);
                  const isOverdue = daysRemaining < 0;
                  const isUrgent = daysRemaining <= 3 && daysRemaining >= 0;

                  return (
                    <tr key={phase._id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-4 py-3 align-middle">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] flex items-center justify-center">
                                <span className="text-white font-medium text-xs">
                                  {phase.business?.name ? phase.business.name.charAt(0) : ''}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900">{phase.business?.name}</div>
                              <div className="text-xs text-slate-500">Business</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                                <span className="text-[#1D3557] font-medium text-xs">
                                  {phase.createdBy?.fullName ? phase.createdBy.fullName.split(' ').map(n => n[0]).join('') : ''}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-slate-900">{phase.createdBy?.fullName}</div>
                              <div className="text-xs text-slate-500">Created By</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900">{phase.title}</div>
                          <div className="text-sm text-slate-500">{phase.stageUpdate}</div>
                          <div className="text-sm font-medium text-slate-700">{phase.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="space-y-2">
                          {getStatusBadge(phase.status)}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="space-y-2">
                          {/* Confirmation info if available, else skip */}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="space-y-2">
                          <ProgressBar progress={phase.progress} />
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-600">{phase.progress}% complete</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center text-slate-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            Started: {phase.createdAt ? new Date(phase.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          </div>
                          {/* Add end date if available */}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-2"
                            onClick={() => alert(`Viewing detailed steps for: ${phase.title}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredPhases.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No execution phases found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, FileText, ShoppingBag, Settings, CheckCircle, TrendingUp, Activity, Clock, UserPlus, Package } from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';

const StatsCard = ({ title, value, icon, trend, description }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-[#457B9D] shadow-lg">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">{trend.value}</span>
          </div>
        )}
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

const ActivityItem = ({ type, title, subtitle, time, icon }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-[#F1FAEE] rounded-xl hover:bg-[#E6F0FA] transition-colors duration-200">
      <div className="p-2 bg-[#457B9D] rounded-full flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#1D3557]">{title}</p>
        <p className="text-xs text-[#457B9D]">{subtitle}</p>
      </div>
      <div className="flex items-center space-x-1 text-gray-500">
        <Clock className="w-3 h-3" />
        <span className="text-xs">{time}</span>
      </div>
    </div>
  );
};

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    entrepreneursCount: 0,
    vendorsCount: 0,
    openRequests: 0,
    underReviewRequests: 0,
    completedRequests: 0,
    activePhases: 0,
    totalOffers: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        // Get all users
        const usersRes = await axios.get('https://backendelevante-production.up.railway.app/api/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = usersRes.data;
        const entrepreneursCount = users.filter(u => u.role === 'entrepreneur').length;
        const vendorsCount = users.filter(u => u.role === 'supplier' || u.role === 'vendor').length;
        const pendingApprovals = users.filter(u => u.status === 'pending').length;

        // Get all requests
        const requestsRes = await axios.get('https://backendelevante-production.up.railway.app/api/requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const requests = requestsRes.data;
        const openRequests = requests.filter(r => r.status === 'open').length;
        const underReviewRequests = requests.filter(r => r.status === 'review').length;
        const completedRequests = requests.filter(r => r.status === 'completed').length;

        // Get all offers
        const offersRes = await axios.get('https://backendelevante-production.up.railway.app/api/supplier-offers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const totalOffers = offersRes.data.length;

        // Get active phases (example: count of businesses with active phase)
        const businessesRes = await axios.get('https://backendelevante-production.up.railway.app/api/businesses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const activePhases = businessesRes.data.filter(b => b.phase === 'active').length;

        setStats({
          totalUsers: users.length,
          entrepreneursCount,
          vendorsCount,
          openRequests,
          underReviewRequests,
          completedRequests,
          activePhases,
          totalOffers,
          pendingApprovals
        });

        // Fetch recent activity logs
        const activityRes = await axios.get('https://backendelevante-production.up.railway.app/api/activity-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(activityRes.data.slice(0, 5)); // Show latest 5 activities
      } catch (err) {
        // Handle error or show fallback
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  // Chart data with brand colors
  const userPieData = [
    { name: 'Entrepreneurs', value: stats.entrepreneursCount, color: '#1D3557' },
    { name: 'Vendors', value: stats.vendorsCount, color: '#457B9D' },
  ];

  const requestBarData = [
    { name: 'Open', value: stats.openRequests, color: '#F1C40F' },
    { name: 'Review', value: stats.underReviewRequests, color: '#457B9D' },
    { name: 'Completed', value: stats.completedRequests, color: '#27ae60' },
  ];

  // Additional stats for better overview
  const additionalStats = [
    { name: 'Active Phases', value: stats.activePhases, color: '#A8DADC' },
    { name: 'Success Rate', value: '94%', color: '#27ae60' },
  ];

  return (
    <div className="min-h-screen bg-[#EEF8F7] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1D3557] mb-2">Welcome back! Here's what's happening with your platform.</h1>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="w-6 h-6 text-white" />}
            trend={{ value: "+12%", isPositive: true }}
            description="Active platform users"
          />
          <StatsCard
            title="Open Requests"
            value={stats.openRequests}
            icon={<FileText className="w-6 h-6 text-white" />}
            trend={{ value: "+5%", isPositive: true }}
            description="Awaiting vendor response"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            trend={{ value: "2 new", isPositive: true }}
            description="Require admin review"
          />
          <StatsCard
            title="Total Offers"
            value={stats.totalOffers}
            icon={<ShoppingBag className="w-6 h-6 text-white" />}
            trend={{ value: "+18%", isPositive: true }}
            description="Active vendor offers"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Distribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1D3557]">User Distribution</h3>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-[#457B9D]" />
                <span className="text-sm text-[#457B9D]">Live Data</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {userPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Request Status Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1D3557]">Request Status</h3>
              <div className="text-sm text-[#457B9D]">
                Total: {stats.openRequests + stats.underReviewRequests + stats.completedRequests}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={requestBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: '#457B9D' }} />
                <YAxis tick={{ fill: '#457B9D' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#F1FAEE',
                    border: '1px solid #E6F0FA',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {requestBarData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#457B9D]">Active Phases</p>
                <p className="text-2xl font-bold text-[#1D3557]">{stats.activePhases}</p>
              </div>
              <div className="w-12 h-12 bg-[#457B9D] rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#457B9D]">Success Rate</p>
                <p className="text-2xl font-bold text-[#1D3557]">94%</p>
              </div>
              <div className="w-12 h-12 bg-[#457B9D] rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#457B9D]">Avg. Response Time</p>
                <p className="text-2xl font-bold text-[#1D3557]">2.4h</p>
              </div>
              <div className="w-12 h-12 bg-[#457B9D] rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-8">
          <h3 className="text-xl font-bold text-[#1D3557] mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <ActivityItem
                  key={activity.id || idx}
                  type={activity.type}
                  title={activity.title || activity.action || 'Activity'}
                  subtitle={activity.description || activity.details || ''}
                  time={activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''}
                  icon={<Activity className="w-4 h-4 text-white" />}
                />
              ))
            ) : (
              <p className="text-[#457B9D]">No recent activity found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
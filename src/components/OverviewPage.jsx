import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DollarSign, Users, CheckCircle, Award, UserCheck, TrendingUp, Activity } from 'lucide-react';
import * as jwt_decode from "jwt-decode";
import { AlertTriangle, Star } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const interFont = { family: 'Inter, sans-serif', weight: '600' };

export default function OverviewPage() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('all');
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [offers, setOffers] = useState([]);
  const [threads, setThreads] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [directRequests, setDirectRequests] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      try {
        const [bizRes, reqRes, ordRes, withRes, dealRes] = await Promise.all([
          axios.get('/api/businesses/my', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/requests/my', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/orders/entrepreneur', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/withdrawals/my', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/deals/my', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setBusinesses(bizRes.data.data || []);
        setRequests(reqRes.data.data || []);
        setOrders(ordRes.data || ordRes.data.data || []);
        setWithdrawals(withRes.data.data || []);
        setDeals(dealRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMilestones = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMilestones([]);
        return;
      }
      if (selectedBusinessId === 'all') {
        // Fetch milestones for all businesses
        if (!businesses.length) {
          setMilestones([]);
          return;
        }
        try {
          const allMilestones = await Promise.all(
            businesses.map(biz =>
              axios.get(`/api/milestones/business/${biz._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              }).then(res => res.data.data || []).catch(() => [])
            )
          );
          setMilestones(allMilestones.flat());
        } catch {
          setMilestones([]);
        }
      } else {
        // Fetch milestones for selected business
        try {
          const res = await axios.get(`/api/milestones/business/${selectedBusinessId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMilestones(res.data.data || []);
        } catch {
          setMilestones([]);
        }
      }
    };
    fetchMilestones();
  }, [selectedBusinessId, businesses]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios.get('/api/offers/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOffers(res.data.data || []))
      .catch(() => setOffers([]));

    axios.get('/api/messages/threads', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setThreads(res.data.data?.threads || []))
      .catch(() => setThreads([]));

    axios.get('/api/disputes/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDisputes(res.data.data || []))
      .catch(() => setDisputes([]));

    axios.get('/api/direct-requests/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDirectRequests(res.data.data || []))
      .catch(() => setDirectRequests([]));

    let userId = null;
    try {
      const decoded = jwt_decode.default(token);
      userId = decoded._id || decoded.id || decoded.userId;
    } catch {}
    if (userId) {
      axios.get(`/api/reviews/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setReviews(res.data.data || []))
        .catch(() => setReviews([]));
    }
  }, []);

  // Filter data by selected business
  const filteredRequests = useMemo(() => selectedBusinessId === 'all' ? requests : requests.filter(r => r.business === selectedBusinessId), [requests, selectedBusinessId]);
  const filteredOrders = useMemo(() => selectedBusinessId === 'all' ? orders : orders.filter(o => o.relatedBusiness === selectedBusinessId || o.relatedBusiness?._id === selectedBusinessId), [orders, selectedBusinessId]);
  const filteredDeals = useMemo(() => selectedBusinessId === 'all' ? deals : deals.filter(d => d.relatedBusiness === selectedBusinessId || d.relatedBusiness?._id === selectedBusinessId), [deals, selectedBusinessId]);
  const filteredWithdrawals = useMemo(() => selectedBusinessId === 'all' ? withdrawals : withdrawals.filter(w => w.business === selectedBusinessId), [withdrawals, selectedBusinessId]);

  // Stats
  const stats = useMemo(() => ({
    dealsClosed: filteredDeals.length,
    milestones: milestones.length,
    suppliers: new Set(filteredDeals.flatMap(d => d.participants?.filter(p => p.user?.role === 'supplier').map(p => p.user?._id))).size,
    investors: new Set(filteredDeals.flatMap(d => d.participants?.filter(p => p.user?.role === 'investor').map(p => p.user?._id))).size,
  }), [filteredDeals, milestones]);

  // Bar chart: Revenue vs Expenses (mocked for now, can be replaced with real data if available)
  const barData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenue',
        data: filteredDeals.map(d => d.amount || 0).slice(0, 7),
        backgroundColor: '#168AAD',
        borderRadius: 8,
        barThickness: 24,
      },
      {
        label: 'Expenses',
        data: filteredOrders.map(o => o.totalAmount || o.amount || 0).slice(0, 7),
        backgroundColor: '#2A9D8F',
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  }), [filteredDeals, filteredOrders]);

  // Doughnut charts: Deal status distribution
  const dealStatusCounts = useMemo(() => {
    const statuses = ['confirmed', 'pending', 'rejected'];
    const countByStatus = (arr) => statuses.map(s => arr.filter(d => (d.status || '').toLowerCase() === s).length);
    return {
      supplier: countByStatus(filteredDeals.filter(d => d.participants?.some(p => p.user?.role === 'supplier'))),
      investor: countByStatus(filteredDeals.filter(d => d.participants?.some(p => p.user?.role === 'investor'))),
    };
  }, [filteredDeals]);

  const supplierDealData = useMemo(() => ({
    labels: ['Confirmed', 'Pending', 'Rejected'],
    datasets: [
      {
        data: dealStatusCounts.supplier,
        backgroundColor: ['#168AAD', '#F4A261', '#E63946'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }), [dealStatusCounts]);

  const investorDealData = useMemo(() => ({
    labels: ['Confirmed', 'Pending', 'Rejected'],
    datasets: [
      {
        data: dealStatusCounts.investor,
        backgroundColor: ['#168AAD', '#F4A261', '#E63946'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  }), [dealStatusCounts]);

  // Recent activity (combine requests, orders, deals, withdrawals)
  const activities = useMemo(() => {
    const arr = [
      ...filteredRequests.map(r => ({ id: r._id, type: 'request', message: `Request: ${r.title}`, createdAt: r.createdAt })),
      ...filteredOrders.map(o => ({ id: o._id, type: 'order', message: `Order: ${o.orderNumber || o._id}`, createdAt: o.createdAt })),
      ...filteredDeals.map(d => ({ id: d._id, type: 'deal', message: `Deal: ${d.title || d._id}`, createdAt: d.createdAt })),
      ...filteredWithdrawals.map(w => ({ id: w._id, type: 'withdrawal', message: `Withdrawal: ${w.amount} EGP`, createdAt: w.createdAt })),
      ...milestones.map(m => ({ id: m._id, type: 'milestone', message: `Milestone: ${m.title} (${m.status || 'created'})`, createdAt: m.createdAt })),
      ...offers.map(o => ({ id: o._id, type: 'offer', message: `Offer: Submitted offer for request "${o.requestId?.title || o.requestId || o._id}"`, createdAt: o.createdAt })),
      ...threads.map(t => ({ id: t._id, type: 'message', message: `Message: New thread with ${t.participants?.map(p => p.fullName).join(', ')}`, createdAt: t.lastMessageTime || t.createdAt })),
      ...disputes.map(d => ({ id: d._id, type: 'dispute', message: `Dispute: ${d.type} on ${d.targetId}`, createdAt: d.createdAt })),
      ...directRequests.map(dr => ({ id: dr._id, type: 'directRequest', message: `Direct Request: Sent to ${dr.targetUser?.fullName || dr.targetUser}`, createdAt: dr.createdAt })),
      ...reviews.map(r => ({ id: r._id, type: 'review', message: `Review: ${r.rating} stars from ${r.reviewer?.fullName || r.reviewer}`, createdAt: r.createdAt })),
    ];
    return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  }, [filteredRequests, filteredOrders, filteredDeals, filteredWithdrawals, milestones, offers, threads, disputes, directRequests, reviews]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: interFont, color: '#1e293b' },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: interFont,
        bodyFont: interFont,
        cornerRadius: 8,
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { color: '#64748b', font: { size: 12 } } 
      },
      y: { 
        grid: { color: '#f1f5f9' }, 
        ticks: { color: '#64748b', font: { size: 12 } } 
      },
    },
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          font: { ...interFont, size: 12 }, 
          color: '#1e293b',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      datalabels: {
        color: '#fff',
        font: { size: 12, weight: 'bold', family: 'Inter, sans-serif' },
        formatter: (v, ctx) => {
          const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
          return `${((v / total) * 100).toFixed(0)}%`;
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: interFont,
        bodyFont: interFont,
        cornerRadius: 8,
      },
    },
  };

  const activityIcons = {
    milestone: Award,
    deal: CheckCircle,
    user: Users,
    revenue: DollarSign,
    offer: TrendingUp,
    message: Activity,
    dispute: AlertTriangle,
    directRequest: UserCheck,
    review: Star,
  };

  const StatCard = ({ title, value, icon: Icon, color, gradient, delay = 0 }) => (
    <div 
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-bold mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#1D3557' }}>
                Overview of your business performance and metrics
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5" style={{ color: '#1D3557' }} />
              <span className="text-sm" style={{ color: '#1D3557' }}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          {/* Project Selector */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <label htmlFor="project-select" className="block text-sm font-medium mb-2" style={{ color: '#1D3557' }}>
              Select Project
            </label>
            <select
              id="project-select"
              className="block w-full md:w-64 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              value={selectedBusinessId}
              onChange={e => setSelectedBusinessId(e.target.value)}
            >
              <option value="all">All Projects</option>
              {businesses.map(biz => (
                <option key={biz._id} value={biz._id}>{biz.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Statistics below represent {selectedBusinessId === 'all' ? 'all your projects' : businesses.find(b => b._id === selectedBusinessId)?.name}
            </p>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Deals Closed"
            value={stats.dealsClosed}
            icon={CheckCircle}
            gradient="from-[#457B9D] to-[#1D3557]"
            delay={0}
          />
          <StatCard
            title="Milestones"
            value={stats.milestones}
            icon={Award}
            gradient="from-[#457B9D] to-[#1D3557]"
            delay={100}
          />
          <StatCard
            title="Connected Suppliers"
            value={stats.suppliers}
            icon={UserCheck}
            gradient="from-[#457B9D] to-[#1D3557]"
            delay={200}
          />
          <StatCard
            title="Connected Investors"
            value={stats.investors}
            icon={Users}
            gradient="from-[#457B9D] to-[#1D3557]"
            delay={300}
          />
        </div>
        {/* Revenue & Growth Cards */}
        {/* Removed Total Revenue and Growth Rate cards as requested */}
        {/* Charts Grid */}
        {/* Revenue vs Expenses full width */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 w-full">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1D3557' }}>
              Revenue vs Expenses
            </h3>
            <div className="h-80">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>
        {/* Deal Status Distribution charts side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1D3557' }}>
              Supplier Deal Status Distribution
            </h3>
            <div className="h-80">
              <Doughnut data={supplierDealData} options={donutOptions} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1D3557' }}>
              Investor Deal Status Distribution
            </h3>
            <div className="h-80">
              <Doughnut data={investorDealData} options={donutOptions} />
            </div>
          </div>
        </div>
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-6" style={{ color: '#1D3557' }}>Recent Activity</h3>
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = activityIcons[activity.type] || Users;
              return (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF8F7' }}>
                    <Icon className="w-5 h-5" style={{ color: '#457B9D' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#1D3557' }}>{activity.message}</p>
                    <p className="text-xs text-gray-500">{
                      activity.createdAt
                        ? new Date(activity.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : ''
                    }</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
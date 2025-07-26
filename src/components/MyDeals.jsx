import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buttonHandlers } from '../utils/buttonHandlers';
import axios from 'axios';
import { 
  Package, 
  Users, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  MessageCircle,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Search,
  DollarSign,
  Network,
  TrendingUp,
  Building2
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessSelector from './BusinessSelector';
import OpportunityDetailsModal from './OpportunityDetailsModal';

export default function MyDeals({ userRole = 'entrepreneur' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('suppliers');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deals, setDeals] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Dummy deals for demo
  const [dummyStatus, setDummyStatus] = useState('pending');
  const dummyDeal1 = {
    _id: 'dummy1',
    relatedBusiness: { name: 'Demo Business', _id: 'demo-biz' },
    dealType: 'Investment',
    status: dummyStatus,
    amount: '$10,000',
    participants: [{ user: { name: 'You' } }, { user: { name: 'Demo Partner' } }],
    agreementDate: new Date().toISOString(),
    description: 'This is a demo deal card. Use the filter to change its status.'
  };
  const dummyDeal2 = {
    _id: 'dummy2',
    relatedBusiness: { name: 'Sample Project', _id: 'sample-biz' },
    dealType: 'Supplier',
    status: 'confirmed',
    amount: '$5,000',
    participants: [{ user: { name: 'You' } }, { user: { name: 'Supplier Partner' } }],
    agreementDate: new Date().toISOString(),
    description: 'This is another demo deal card with confirmed status.'
  };

  const isInvestor = userRole === 'investor';

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoadingBusinesses(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/businesses/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const businessesArr = (res.data.businesses ?? res.data.data ?? []).map(biz => ({ id: biz._id, name: biz.name }));
        setBusinesses(businessesArr);
        if (businessesArr.length > 0 && !selectedBusinessId) {
          setSelectedBusinessId(businessesArr[0].id);
        }
      } catch {
        setBusinesses([]);
        setSelectedBusinessId('');
      }
      setLoadingBusinesses(false);
    };
    fetchBusinesses();
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/deals/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeals(res.data.data || res.data.deals || []);
      } catch (err) {
        setDeals([]);
      }
    };
    fetchDeals();
  }, []);

  // فلترة الديلز حسب البزنس المختار
  const filteredDeals = selectedBusinessId
    ? deals.filter(deal => deal.relatedBusiness && (deal.relatedBusiness._id === selectedBusinessId || deal.relatedBusiness === selectedBusinessId))
    : deals;

  // تحديد الطرف الآخر في الديل
  const getOtherParticipant = (deal) => {
    const token = localStorage.getItem('token');
    const userId = JSON.parse(atob(token.split('.')[1])).id;
    return (deal.participants || []).find(p => p.user && (p.user._id || p.user) !== userId);
  };

  // Filter and sort deals
  const getFilteredDeals = () => {
    const dealsToFilter = activeTab === 'suppliers' ? supplierDeals : investorDeals;
    
    let filtered = dealsToFilter;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.agreementDate) - new Date(a.agreementDate);
      } else {
        return new Date(a.agreementDate) - new Date(b.agreementDate);
      }
    });
    
    return filtered;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#EEF8F7' }}>
      <div className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          

          {/* Tabs */}
          {!isInvestor && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid grid-cols-2 gap-4 bg-transparent">
                <TabsTrigger value="suppliers" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white data-[state=inactive]:text-[#1D3557] px-6 py-3 font-medium text-[#1D3557] data-[state=active]:shadow-lg transition-all flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Suppliers</span>
                </TabsTrigger>
                <TabsTrigger value="investors" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white data-[state=inactive]:text-[#1D3557] px-6 py-3 font-medium text-[#1D3557] data-[state=active]:shadow-lg transition-all flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Investors</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Filters */}
          {!isInvestor && (
            <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center">
              <BusinessSelector
                businesses={businesses}
                selectedBusinessId={selectedBusinessId}
                onChange={setSelectedBusinessId}
                loading={loadingBusinesses}
              />
              {/* باقي الفلاتر كما هي */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-[#457B9D]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-[#457B9D]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          )}

          {/* Deals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <div key={deal._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                {/* Deal Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1D3557]">{deal.relatedBusiness?.name || 'No Business'}</h3>
                        <p className="text-sm text-[#457B9D]">{deal.dealType || ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 group relative">
                      {getStatusIcon(deal.status)}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        deal.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(deal.status)}
                      </span>
                    </div>
                  </div>
                  {/* Deal Details */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">Amount:</span>
                      <span className="text-[#1D3557] font-semibold">{deal.amount || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">Participants:</span>
                      <span>{deal.participants?.map(p => p.user?.name || p.user?.fullName || '').join(' & ')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{deal.agreementDate ? formatDate(deal.agreementDate) : (deal.createdAt ? formatDate(deal.createdAt) : 'N/A')}</span>
                    </div>
                  </div>
                  {/* Description */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{deal.description || ''}</p>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="p-6 bg-gray-50">
                  <div className="flex space-x-3">
                    <button
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors duration-300"
                      onClick={() => {
                        setSelectedProject(deal);
                        setShowProjectModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View Project</span>
                    </button>
                    <button 
                      onClick={() => {
                        const other = getOtherParticipant(deal);
                        if (other && other.user && (other.user._id || other.user)) {
                          navigate(`/messages?partner=${other.user._id || other.user}`);
                        }
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-[#457B9D] text-[#457B9D] rounded-lg hover:bg-[#457B9D] hover:text-white transition-colors duration-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Message</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredDeals.length === 0 && (
              <>
                <div className="col-span-full text-center text-[#457B9D] font-semibold mb-4">
                </div>
                <div className="col-span-full flex flex-col sm:flex-row items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <label className="font-medium text-[#1D3557]">Demo Status:</label>
                    <select
                      value={dummyStatus}
                      onChange={e => setDummyStatus(e.target.value)}
                      className="px-4 py-2 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button
                    className="px-4 py-2 bg-[#A8DADC] text-[#1D3557] rounded-lg font-semibold hover:bg-[#457B9D] hover:text-white transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Deals
                  </button>
                </div>
                {/* Dummy deal cards */}
                <div className="col-span-full flex flex-col sm:flex-row justify-center gap-6">
                  {/* Dummy Deal 1 */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 max-w-md w-full">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#1D3557]">{dummyDeal1.relatedBusiness.name}</h3>
                            <p className="text-sm text-[#457B9D]">{dummyDeal1.dealType}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 group relative">
                          {getStatusIcon(dummyDeal1.status)}
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            dummyDeal1.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            dummyDeal1.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(dummyDeal1.status)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="font-medium">Amount:</span>
                          <span className="text-[#1D3557] font-semibold">{dummyDeal1.amount}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="font-medium">Participants:</span>
                          <span>{dummyDeal1.participants.map(p => p.user.name).join(' & ')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(dummyDeal1.agreementDate)}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{dummyDeal1.description}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50">
                      <div className="flex space-x-3">
                        <button
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors duration-300"
                          onClick={() => {}}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View Project</span>
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-[#457B9D] text-[#457B9D] rounded-lg hover:bg-[#457B9D] hover:text-white transition-colors duration-300"
                          onClick={() => {}}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Dummy Deal 2 */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 max-w-md w-full">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#1D3557]">{dummyDeal2.relatedBusiness.name}</h3>
                            <p className="text-sm text-[#457B9D]">{dummyDeal2.dealType}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 group relative">
                          {getStatusIcon(dummyDeal2.status)}
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            dummyDeal2.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            dummyDeal2.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(dummyDeal2.status)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="font-medium">Amount:</span>
                          <span className="text-[#1D3557] font-semibold">{dummyDeal2.amount}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="font-medium">Participants:</span>
                          <span>{dummyDeal2.participants.map(p => p.user.name).join(' & ')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(dummyDeal2.agreementDate)}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{dummyDeal2.description}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50">
                      <div className="flex space-x-3">
                        <button
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors duration-300"
                          onClick={() => {}}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View Project</span>
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-[#457B9D] text-[#457B9D] rounded-lg hover:bg-[#457B9D] hover:text-white transition-colors duration-300"
                          onClick={() => {}}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Project Details Modal */}
      <OpportunityDetailsModal
        opportunity={selectedProject}
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
      />
    </div>
  );
}

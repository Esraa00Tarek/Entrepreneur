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
  const [activeTab, setActiveTab] = useState('received');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [deals, setDeals] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);



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

  // Fetch accepted offers (offers I received and accepted)
  const [acceptedOffers, setAcceptedOffers] = useState([]);
  const [myAcceptedOffers, setMyAcceptedOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    const fetchAcceptedOffers = async () => {
      setLoadingOffers(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch offers I received and accepted
        const receivedRes = await axios.get(`${BASE_URL}/api/offers/accepted-received`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAcceptedOffers(receivedRes.data.data || []);

        // Fetch offers I sent and were accepted
        const sentRes = await axios.get(`${BASE_URL}/api/offers/accepted-sent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyAcceptedOffers(sentRes.data.data || []);
      } catch (err) {
        console.error('Error fetching accepted offers:', err);
        setAcceptedOffers([]);
        setMyAcceptedOffers([]);
      }
      setLoadingOffers(false);
    };
    fetchAcceptedOffers();
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

  // Get data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'received':
        return acceptedOffers;
      case 'sent':
        return myAcceptedOffers;
      case 'deals':
        return filteredDeals;
      default:
        return [];
    }
  };

  // Filter and sort current data
  const getFilteredData = () => {
    const dataToFilter = getCurrentData();
    
    let filtered = dataToFilter;
    
    // Apply status filter (only for deals)
    if (activeTab === 'deals' && statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.agreementDate) - new Date(a.createdAt || a.agreementDate);
      } else {
        return new Date(a.createdAt || a.agreementDate) - new Date(b.createdAt || b.agreementDate);
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1D3557] mb-2">My Deals & Offers</h1>
            <p className="text-[#457B9D]">Manage your accepted offers and active partnerships</p>
          </div>

          {/* Tabs */}
          {!isInvestor && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid grid-cols-3 gap-4 bg-transparent">
                <TabsTrigger value="received" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white data-[state=inactive]:text-[#1D3557] px-6 py-3 font-medium text-[#1D3557] data-[state=active]:shadow-lg transition-all flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Offers I Accepted</span>
                </TabsTrigger>
                <TabsTrigger value="sent" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white data-[state=inactive]:text-[#1D3557] px-6 py-3 font-medium text-[#1D3557] data-[state=active]:shadow-lg transition-all flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>My Accepted Offers</span>
                </TabsTrigger>
                <TabsTrigger value="deals" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white data-[state=inactive]:text-[#1D3557] px-6 py-3 font-medium text-[#1D3557] data-[state=active]:shadow-lg transition-all flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Active Deals</span>
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
              {/* Status filter only for deals */}
              {activeTab === 'deals' && (
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
              )}
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

          {/* Data Grid */}
          {loadingOffers ? (
            <div className="col-span-full flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457B9D]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredData().map((item) => (
                <div key={item._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {/* Item Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-lg flex items-center justify-center">
                          {activeTab === 'deals' ? <Users className="w-6 h-6 text-white" /> : <Package className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1D3557]">
                            {activeTab === 'deals' 
                              ? (item.relatedBusiness?.name || 'No Business')
                              : (item.requestTitle || 'Unknown Request')
                            }
                          </h3>
                          <p className="text-sm text-[#457B9D]">
                            {activeTab === 'deals' 
                              ? (item.dealType || '')
                              : (item.offerType || '')
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 group relative">
                        {activeTab === 'deals' ? getStatusIcon(item.status) : <CheckCircle className="w-5 h-5 text-green-500" />}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          activeTab === 'deals' 
                            ? (item.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                               item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-red-100 text-red-800')
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {activeTab === 'deals' ? getStatusText(item.status) : 'Accepted'}
                        </span>
                      </div>
                    </div>
                    {/* Item Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-medium">Amount:</span>
                        <span className="text-[#1D3557] font-semibold">
                          {activeTab === 'deals' 
                            ? (item.amount || 'N/A')
                            : (item.amount || item.price || 'N/A')
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="font-medium">
                          {activeTab === 'deals' ? 'Participants:' : 'From:'}
                        </span>
                        <span>
                          {activeTab === 'deals' 
                            ? (item.participants?.map(p => p.user?.name || p.user?.fullName || '').join(' & ') || 'N/A')
                            : (item.offeredByInfo?.name || 'Unknown')
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {activeTab === 'deals' 
                            ? (item.agreementDate ? formatDate(item.agreementDate) : (item.createdAt ? formatDate(item.createdAt) : 'N/A'))
                            : (item.createdAt ? formatDate(item.createdAt) : 'N/A')
                          }
                        </span>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description || ''}</p>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="p-6 bg-gray-50">
                    <div className="flex space-x-3">
                      <button
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors duration-300"
                        onClick={() => {
                          setSelectedProject(item);
                          setShowProjectModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View Details</span>
                      </button>
                      {activeTab === 'deals' && (
                        <button 
                          onClick={() => {
                            const other = getOtherParticipant(item);
                            if (other && other.user && (other.user._id || other.user)) {
                              navigate(`/messages?partner=${other.user._id || other.user}`);
                            }
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-[#457B9D] text-[#457B9D] rounded-lg hover:bg-[#457B9D] hover:text-white transition-colors duration-300"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">Message</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {getFilteredData().length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="flex flex-col items-center justify-center mb-4">
                    <Package className="w-12 h-12 text-[#457B9D]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#1D3557]">
                    {activeTab === 'received' && 'No offers you accepted yet'}
                    {activeTab === 'sent' && 'No offers you sent have been accepted yet'}
                    {activeTab === 'deals' && 'No active deals found'}
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'received' && 'When you accept offers from investors or suppliers, they will appear here.'}
                    {activeTab === 'sent' && 'When your offers are accepted by entrepreneurs, they will appear here.'}
                    {activeTab === 'deals' && 'Active deals will appear here once you have ongoing partnerships.'}
                  </p>
                </div>
              )}
            </div>
          )}
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

import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  Trash2, 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Download,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Mail,
  Ban,
  AlertCircle,
  Star,
  MapPin,
  Building
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import OfferDetailsModal from './OfferDetailsModal';
import EmptyState from './EmptyState';
import Toast from './Toast';
import { useToast } from "../ui/use-toast";

// Mock data with more realistic information
const mockVendorOffers = [
  {
    id: '1',
    vendorName: 'TechCorp Solutions',
    vendorId: '2',
    requestId: '1',
    requestTitle: 'E-commerce Mobile App Development',
    submissionDate: '2024-01-21',
    proposedPrice: '$12,500',
    deliveryTime: '10 weeks',
    status: 'pending',
    attachments: ['portfolio.pdf', 'technical_proposal.pdf', 'timeline.pdf'],
    vendorRating: 4.8,
    completedProjects: 45,
    vendorLocation: 'San Francisco, CA',
    vendorEmail: 'contact@techcorp.com',
    description: 'Complete mobile app development with modern UI/UX design and backend integration.',
    lastActivity: '2024-01-25T10:30:00Z'
  },
  {
    id: '2',
    vendorName: 'ModernSpace Interiors',
    vendorId: '4',
    requestId: '2',
    requestTitle: 'Complete Office Renovation & Furniture',
    submissionDate: '2024-01-19',
    proposedPrice: '$25,000',
    deliveryTime: '6 weeks',
    status: 'accepted',
    attachments: ['design_mockups.pdf', 'material_list.pdf'],
    vendorRating: 4.9,
    completedProjects: 32,
    vendorLocation: 'New York, NY',
    vendorEmail: 'info@modernspace.com',
    description: 'Professional office renovation with premium furniture and modern design.',
    lastActivity: '2024-01-24T15:45:00Z'
  },
  {
    id: '3',
    vendorName: 'Digital Marketing Pro',
    vendorId: '6',
    requestId: '3',
    requestTitle: 'Comprehensive Digital Marketing Campaign',
    submissionDate: '2024-01-16',
    proposedPrice: '$8,500',
    deliveryTime: '12 weeks',
    status: 'pending',
    attachments: ['strategy_overview.pdf', 'case_studies.pdf'],
    vendorRating: 4.6,
    completedProjects: 78,
    vendorLocation: 'Austin, TX',
    vendorEmail: 'hello@digitalmarketingpro.com',
    description: 'Full-scale digital marketing strategy with SEO, social media, and content marketing.',
    lastActivity: '2024-01-23T09:15:00Z'
  },
  {
    id: '4',
    vendorName: 'CloudTech Systems',
    vendorId: '8',
    requestId: '4',
    requestTitle: 'Cloud Infrastructure Migration',
    submissionDate: '2024-01-14',
    proposedPrice: '$18,000',
    deliveryTime: '8 weeks',
    status: 'rejected',
    attachments: ['infrastructure_plan.pdf'],
    vendorRating: 4.7,
    completedProjects: 23,
    vendorLocation: 'Seattle, WA',
    vendorEmail: 'support@cloudtech.com',
    description: 'Complete cloud migration with security optimization and performance monitoring.',
    lastActivity: '2024-01-22T14:20:00Z'
  },
  {
    id: '5',
    vendorName: 'Creative Studio LLC',
    vendorId: '10',
    requestId: '5',
    requestTitle: 'Brand Identity & Logo Design',
    submissionDate: '2024-01-12',
    proposedPrice: '$4,200',
    deliveryTime: '4 weeks',
    status: 'pending',
    attachments: ['portfolio.pdf', 'creative_brief.pdf'],
    vendorRating: 4.9,
    completedProjects: 156,
    vendorLocation: 'Los Angeles, CA',
    vendorEmail: 'creative@studiollc.com',
    description: 'Complete brand identity package with logo, guidelines, and marketing materials.',
    lastActivity: '2024-01-25T12:15:00Z'
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

const StatsCard = ({ title, value, icon, iconBg, trend, description }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#E6F0FA] p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl shadow-lg w-12 h-12 flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            <span className="text-sm font-medium">{trend > 0 ? '+' : ''}{trend}%</span>
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

export default function AdminVendorOffers() {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  
  const { toasts, removeToast, success, error, warning } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/supplier-offers', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (Array.isArray(res.data)) {
        setOffers(res.data);
      } else if (Array.isArray(res.data.offers)) {
        setOffers(res.data.offers);
      } else {
        setOffers([]);
      }
    })
    .catch(err => {
      setOffers([]);
      console.error(err);
    });
  }, []);

  const filteredAndSortedOffers = useMemo(() => {
    let filtered = offers.filter(offer => {
    const matchesSearch = offer.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           offer.requestTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           offer.vendorLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'proposedPrice') {
        aValue = parseFloat(aValue.toString().replace(/[$,]/g, ''));
        bValue = parseFloat(bValue.toString().replace(/[$,]/g, ''));
      } else if (sortBy === 'submissionDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [offers, searchTerm, statusFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOffers = filteredAndSortedOffers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (offerId) => {
    setOfferToDelete(offerId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (offerToDelete) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`http://localhost:5000/api/supplier-offers/${offerToDelete}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Refetch offers after delete
        const res = await axios.get('http://localhost:5000/api/supplier-offers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          setOffers(res.data);
        } else if (Array.isArray(res.data.offers)) {
          setOffers(res.data.offers);
        } else {
          setOffers([]);
        }
        success('Offer deleted successfully', 'The vendor offer has been removed from the system.');
        setShowConfirmDialog(false);
        setOfferToDelete(null);
      } catch (err) {
        console.error('Failed to delete offer', err);
        error('Failed to delete offer', 'There was an error deleting the offer.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOffers.length > 0) {
      const token = localStorage.getItem('token');
      try {
        for (const offerId of selectedOffers) {
          await axios.delete(`http://localhost:5000/api/supplier-offers/${offerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        // Refetch offers after bulk delete
        const res = await axios.get('http://localhost:5000/api/supplier-offers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          setOffers(res.data);
        } else if (Array.isArray(res.data.offers)) {
          setOffers(res.data.offers);
        } else {
          setOffers([]);
        }
        success(`${selectedOffers.length} offers deleted`, 'Selected offers have been removed successfully.');
        setSelectedOffers([]);
      } catch (err) {
        console.error('Failed to bulk delete offers', err);
        error('Failed to bulk delete offers', 'There was an error deleting the selected offers.');
      }
    }
  };

  const handleStatusChange = async (offerId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/api/supplier-offers/${offerId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch offers after update
      const res = await axios.get('http://localhost:5000/api/supplier-offers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setOffers(res.data);
      } else if (Array.isArray(res.data.offers)) {
        setOffers(res.data.offers);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error('Failed to update offer status', err);
    }
  };

  const handleSelectOffer = (offerId) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === paginatedOffers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(paginatedOffers.map(offer => offer.id));
    }
  };

  const viewOfferDetails = (offer) => {
    setSelectedOffer(offer);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: Clock, label: 'Pending' },
      accepted: { variant: 'success', icon: CheckCircle, label: 'Accepted' },
      rejected: { variant: 'danger', icon: XCircle, label: 'Rejected' }
    };

    const config = statusConfig[status] || { variant: 'default', icon: AlertCircle, label: status };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
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

  const stats = useMemo(() => {
    const totalValue = offers.reduce((sum, offer) => {
      return sum + parseFloat(offer.proposedPrice.replace(/[$,]/g, ''));
    }, 0);
    const prices = offers.map(o => parseFloat(o.proposedPrice.replace(/[$,]/g, '')));
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const avgPrice = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    return {
      total: offers.length,
    pending: offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
      totalValue: totalValue.toLocaleString(),
      maxPrice: maxPrice.toLocaleString(),
      minPrice: minPrice.toLocaleString(),
      avgPrice: avgPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })
  };
  }, [offers]);

  return (
    <div className="min-h-screen bg-[#EEF8F7]">
      <div className="max-w-7xl mx-auto px-4 space-y-8 mt-2">
        <div className="flex justify-center items-center px-4 py-4">
          {/* Optional: Add a commented heading here for consistency */}
        </div>
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <StatsCard
            title="Total Offers"
            value={stats.total}
            icon={<FileText className="w-6 h-6" style={{ color: '#457B9D' }} />}
            iconBg="bg-[#E6F0FA]"
            trend={12}
            description="All vendor offers"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="w-6 h-6" style={{ color: '#F1C40F' }} />}
            iconBg="bg-[#FEF9C3]"
            trend={-2}
            description="Awaiting review"
          />
          <StatsCard
            title="Accepted"
            value={stats.accepted}
            icon={<CheckCircle className="w-6 h-6" style={{ color: '#22C55E' }} />}
            iconBg="bg-[#D1FADF]"
            trend={8}
            description="Approved offers"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle className="w-6 h-6" style={{ color: '#EF4444' }} />}
            iconBg="bg-[#FEE2E2]"
            trend={-15}
            description="Declined offers"
          />
        </div>
        {/* Featured Total Value Card - Full Width & Extra Data */}
        <div className="w-full mb-8">
          <div className="w-full bg-white rounded-2xl shadow-lg border-2 border-[#8B5CF6] p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="bg-[#EDE9FE] rounded-full p-6 shadow-md border-2 border-[#8B5CF6]">
                <DollarSign className="w-14 h-14 text-[#8B5CF6]" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[#1D3557] mb-1">${stats.totalValue}</div>
                <div className="text-base text-[#8B5CF6] font-medium whitespace-nowrap">Total Value of All Offers</div>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-6 w-full md:w-auto">
              <div className="text-center">
                <div className="text-xl font-bold text-[#1D3557]">${stats.maxPrice}</div>
                <div className="text-xs text-[#457B9D]">Highest Offer</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#1D3557]">${stats.minPrice}</div>
                <div className="text-xs text-[#457B9D]">Lowest Offer</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#1D3557]">${stats.avgPrice}</div>
                <div className="text-xs text-[#457B9D]">Average Offer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="p-6 bg-[#F1FAEE] border-[#457B9D]">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
            <input
              type="text"
                placeholder="Search by vendor, request title, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none bg-white shadow-sm"
            />
          </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* Desktop Filters */}
            <div className={`flex flex-wrap lg:flex-nowrap gap-3 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-[#A8DADC] rounded-lg px-3 py-3 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none bg-white shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-[#A8DADC] rounded-lg px-3 py-3 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent outline-none bg-white shadow-sm"
              >
                <option value="submissionDate">Sort by Date</option>
                <option value="proposedPrice">Sort by Price</option>
                <option value="vendorName">Sort by Vendor</option>
                <option value="vendorRating">Sort by Rating</option>
              </select>

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedOffers.length > 0 && (
          <Card className="p-4 bg-[#F1FAEE] border-[#A8DADC]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1D3557]">
                {selectedOffers.length} offer(s) selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
        </Card>
        )}

        {/* Enhanced Offers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full divide-y divide-[#A8DADC]">
              <thead className="bg-[#457B9D]">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOffers.length === paginatedOffers.length && paginatedOffers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[#A8DADC] text-white focus:ring-[#F1FAEE]"
                    />
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#1D3557] transition-colors"
                    onClick={() => handleSort('vendorName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Vendor</span>
                      {sortBy === 'vendorName' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#1D3557] transition-colors"
                    onClick={() => handleSort('requestTitle')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Request Details</span>
                      {sortBy === 'requestTitle' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#1D3557] transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-[#1D3557] transition-colors"
                    onClick={() => handleSort('submissionDate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Submitted</span>
                      {sortBy === 'submissionDate' && (
                        sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
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
                {paginatedOffers.map((offer) => {
                  const activityStatus = getActivityStatus(offer.lastActivity);
                  return (
                    <tr key={offer.id} className="hover:bg-[#F1FAEE] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOffers.includes(offer.id)}
                          onChange={() => handleSelectOffer(offer.id)}
                          className="rounded border-[#A8DADC] text-[#457B9D] focus:ring-[#457B9D]"
                        />
                  </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#457B9D] to-[#1D3557] flex items-center justify-center shadow-lg">
                              <span className="text-white font-medium text-sm">
                                {offer.vendorName.charAt(0)}
                              </span>
                            </div>
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${activityStatus.color}`} title={activityStatus.label} />
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-[#1D3557]">{offer.vendorName}</div>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-[#457B9D]">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{offer.vendorRating}</span>
                              <span>•</span>
                              <span>{offer.completedProjects} projects</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-[#457B9D]/60">
                              <MapPin className="w-3 h-3" />
                              <span>{offer.vendorLocation}</span>
                            </div>
                      </div>
                    </div>
                  </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-[#1D3557] mb-1">
                          {offer.requestTitle}
                        </div>
                        <div className="text-sm text-[#457B9D]">
                          <span className="font-medium text-green-600">{offer.proposedPrice}</span>
                          <span className="mx-2">•</span>
                          <span>{offer.deliveryTime}</span>
                        </div>
                        <div className="text-xs text-[#457B9D]/60 mt-1">
                          Request #{offer.requestId}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(offer.status)}
                  </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-[#1D3557]">
                          <Calendar className="w-4 h-4 mr-2 text-[#457B9D]" />
                    {new Date(offer.submissionDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-[#457B9D]/60">
                          {Math.floor((new Date() - new Date(offer.submissionDate)) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                  </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${activityStatus.color}`} />
                          <span className="text-xs text-[#457B9D]">{activityStatus.label}</span>
                        </div>
                      {offer.attachments && offer.attachments.length > 0 ? (
                          <div className="flex items-center text-xs text-[#457B9D]/60 mt-1">
                            <FileText className="w-3 h-3 mr-1" />
                            {offer.attachments.length} files
                        </div>
                      ) : (
                          <span className="text-xs text-[#457B9D]/60">No files</span>
                      )}
                  </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                            onClick={() => viewOfferDetails(offer)}
                          >
                            <Eye className="w-4 h-4" />
                      </Button>
                          
                      <Button
                        size="sm"
                            variant="ghost"
                            onClick={() => window.open(`mailto:${offer.vendorEmail}`)}
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
                              {offer.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(offer.id, 'accepted')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-[#1D3557] hover:bg-[#F1FAEE]"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(offer.id, 'rejected')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              <button
                        onClick={() => handleDelete(offer.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                                <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                              </button>
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
          
          {paginatedOffers.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-[#457B9D]" />
              <h3 className="text-lg font-medium text-[#1D3557] mb-2">No offers found</h3>
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedOffers.length)} of {filteredAndSortedOffers.length} offers
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
      </div>

      {/* Modals and Toast Notifications */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Vendor Offer"
        message="Are you sure you want to delete this vendor offer? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <OfferDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        offer={selectedOffer}
        onStatusChange={handleStatusChange}
      />

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
}
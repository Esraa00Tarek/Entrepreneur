import React, { useState, useEffect } from 'react';
import { Plus, List, TrendingUp, Package, Calendar, Filter, Search } from 'lucide-react';
import RequestForm from './RequestForm';
import RequestList from './RequestList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessSelector from '../../components/BusinessSelector';
import axios from 'axios';

// Mock data for requests
const mockRequests = [
  {
    id: 1,
    title: 'Office Chairs Supply',
    type: 'Supply - Product',
    status: 'Pending',
    date: '2025-01-06',
    description: 'High-quality ergonomic office chairs for corporate environments',
    category: 'Office Furniture',
    amount: 15000,
    quantity: 50,
    businessId: 'b1', // Added businessId for filtering
  },
  {
    id: 2,
    title: 'Seed Investment Round',
    type: 'Investment',
    status: 'Approved',
    date: '2024-12-20',
    description: 'Series A funding for tech startup expansion',
    category: 'Technology Startups',
    amount: 500000,
    businessId: 'b2', // Added businessId for filtering
  },
  {
    id: 3,
    title: 'IT Support Services',
    type: 'Supply - Service',
    status: 'Rejected',
    date: '2024-12-15',
    description: '24/7 technical support and maintenance services',
    category: 'IT Services',
    amount: 25000,
    businessId: 'b1', // Added businessId for filtering
  },
];

// Mock data for businesses
const mockBusinesses = [
  { id: 'b1', name: 'Fresh Foods Truck' },
  { id: 'b2', name: 'Tech Solutions Ltd.' },
];

const MyRequests = () => {
  const [typeFilter, setTypeFilter] = useState('All');
  const [tab, setTab] = useState('list');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    subType: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [dropdownOpenStatus, setDropdownOpenStatus] = useState(false);
  const [dropdownOpenType, setDropdownOpenType] = useState(false);
  const [dropdownOpenSubType, setDropdownOpenSubType] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/requests/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        setRequests([]);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoadingBusinesses(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/businesses/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const businessesArr = res.data.data ?? [];
        setBusinesses(businessesArr);
        if (businessesArr.length > 0) {
          setSelectedBusinessId(businessesArr[0]._id);
        }
      } catch (err) {
        setBusinesses([]);
        setSelectedBusinessId('');
      }
      setLoadingBusinesses(false);
    };
    fetchBusinesses();
  }, []);

  // Filter requests by selected business (using business._id)
  const businessRequests = requests.filter(r => r.business === selectedBusinessId || (r.business && r.business._id === selectedBusinessId));

  // Handlers
  const handleCreateRequest = async (newRequest) => {
    // No local add, just refetch after creation
    setTab('list');
    // Optionally, you can refetch requests here
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/requests/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setRequests([]);
    }
  };

  const handleEditRequest = (id, updatedRequest) => {
    setRequests(requests.map(o => o.id === id ? { ...o, ...updatedRequest } : o));
  };

  const handleDeleteRequest = (id) => {
    setRequests(requests.filter(o => o.id !== id));
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    
    // Reset sub-type when main type changes
    if (filterType === 'type') {
      newFilters.subType = 'all';
    }
    
    setFilters(newFilters);
  };

  const filteredRequests = businessRequests.filter(request => {
    const matchesStatus = filters.status === 'all' || request.status.toLowerCase() === filters.status;
    const matchesType = filters.type === 'all' || 
      (filters.type === 'supply' && request.type.startsWith('Supply')) ||
      (filters.type === 'investment' && request.type === 'Investment');
    
    const matchesSubType = filters.subType === 'all' || 
      (filters.subType === 'product' && request.type === 'Supply - Product') ||
      (filters.subType === 'service' && request.type === 'Supply - Service');
    
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSubType && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(o => o.status === 'Pending').length,
    approved: requests.filter(o => o.status === 'Approved').length,
    rejected: requests.filter(o => o.status === 'Rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF8F7] via-[#A8DADC]/30 to-[#457B9D]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Selector always visible at the top */}
        <div className="mb-6">
          <BusinessSelector
            businesses={businesses.map(biz => ({ id: biz._id, name: biz.name }))}
            selectedBusinessId={selectedBusinessId}
            onChange={setSelectedBusinessId}
            loading={loadingBusinesses}
          />
        </div>
        {/* If no businesses, show a message and block the rest of the UI */}
        {(!businesses || businesses.length === 0) ? (
          <div className="bg-white/80 rounded-xl p-8 text-center text-gray-500 shadow-md border border-gray-200">
            You need to add a business before you can create or view requests.
          </div>
        ) : (
        <>
        {/* Tabs using UI library */}
        <Tabs value={tab} onValueChange={setTab} className="mb-8">
          <TabsList className="grid grid-cols-2 gap-4 bg-transparent">
            <TabsTrigger value="list" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white data-[state=inactive]:text-[#1D3557] px-6 py-3 font-medium text-[#1D3557] data-[state=active]:shadow-lg transition-all">My Requests</TabsTrigger>
            <TabsTrigger value="create" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white data-[state=inactive]:text-[#1D3557] px-6 py-3 font-medium text-[#1D3557] data-[state=active]:shadow-lg transition-all" disabled={!selectedBusinessId}>Create Request</TabsTrigger>
          </TabsList>
        </Tabs>
        {/* Enhanced Search and Filter Bar */}
        {tab === 'list' && (
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-8">
            {/* Filters on the right */}
            <div className="flex flex-wrap items-center gap-4 order-1 lg:order-none">
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-[#457B9D]" />
              </div>
                {/* Status Filter */}
              <div className="relative" style={{ minWidth: 140 }}>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#457B9D] text-[#457B9D] bg-white hover:bg-[#457B9D] hover:text-white transition-all w-full justify-between whitespace-nowrap"
                  onClick={() => setDropdownOpenStatus(!dropdownOpenStatus)}
                >
                  <span className="truncate max-w-[100px] whitespace-nowrap block">
                    {filters.status === 'all' ? 'All Status' :
                      filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${dropdownOpenStatus ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpenStatus && (
                  <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
                    {[
                      { value: 'all', label: 'All Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'rejected', label: 'Rejected' },
                    ].map(option => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#457B9D]/10 transition-all ${filters.status === option.value ? 'bg-[#457B9D]/20 text-[#457B9D]' : 'text-[#457B9D]'}`}
                        onClick={() => { handleFilterChange('status', option.value); setDropdownOpenStatus(false); }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Type Filter */}
              <div className="relative" style={{ minWidth: 140 }}>
                      <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#457B9D] text-[#457B9D] bg-white hover:bg-[#457B9D] hover:text-white transition-all w-full justify-between whitespace-nowrap"
                  onClick={() => setDropdownOpenType(!dropdownOpenType)}
                      >
                  <span className="truncate max-w-[100px] whitespace-nowrap block">
                    {filters.type === 'all' ? 'All Types' :
                      filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
                    </span>
                  <svg className={`w-4 h-4 transition-transform ${dropdownOpenType ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                {dropdownOpenType && (
                  <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
                    {[
                      { value: 'all', label: 'All Types' },
                      { value: 'supply', label: 'Supply' },
                      { value: 'investment', label: 'Investment' },
                    ].map(option => (
                      <div
                        key={option.value}
                        className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#457B9D]/10 transition-all ${filters.type === option.value ? 'bg-[#457B9D]/20 text-[#457B9D]' : 'text-[#457B9D]'}`}
                        onClick={() => { handleFilterChange('type', option.value); setDropdownOpenType(false); }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Sub-type Filter (only show when Supply is selected) */}
              {filters.type === 'supply' && (
                <div className="relative" style={{ minWidth: 140 }}>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#457B9D] text-[#457B9D] bg-white hover:bg-[#457B9D] hover:text-white transition-all w-full justify-between whitespace-nowrap"
                    onClick={() => setDropdownOpenSubType(!dropdownOpenSubType)}
                  >
                    <span className="truncate max-w-[100px] whitespace-nowrap block">
                      {filters.subType === 'all' ? 'All Supply Types' :
                        filters.subType.charAt(0).toUpperCase() + filters.subType.slice(1)}
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${dropdownOpenSubType ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {dropdownOpenSubType && (
                    <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10">
                      {[
                        { value: 'all', label: 'All Supply Types' },
                        { value: 'product', label: 'Product' },
                        { value: 'service', label: 'Service' },
                      ].map(option => (
                        <div
                          key={option.value}
                          className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#457B9D]/10 transition-all ${filters.subType === option.value ? 'bg-[#457B9D]/20 text-[#457B9D]' : 'text-[#457B9D]'}`}
                          onClick={() => { handleFilterChange('subType', option.value); setDropdownOpenSubType(false); }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {tab === 'create' && selectedBusinessId && (
          <div className="animate-fadeIn">
            <RequestForm onCreate={handleCreateRequest} businessId={selectedBusinessId} />
          </div>
        )}
        {tab === 'list' && (
          <div className="animate-fadeIn">
            <RequestList 
              requests={filteredRequests} 
              onEdit={handleEditRequest} 
              onDelete={handleDeleteRequest} 
            />
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
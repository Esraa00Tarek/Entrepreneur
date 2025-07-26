import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Edit3, 
  Save, 
  X, 
  User, 
  Building2, 
  Calendar,
  MapPin,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Target,
  Building,
  DollarSign,
  Users,
  FileText,
  Upload,
  MessageCircle,
  Archive,
  RefreshCw,
  Briefcase,
  Star,
  Zap,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { buttonHandlers } from '../utils/buttonHandlers';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBusinesses } from '../redux/slices/businessesSlice';
import { Country, State, City } from 'country-state-city';
import { toast } from '@/hooks/use-toast';

const BASE_URL = 'http://localhost:5000';

function safeJsonParse(val) {
  try {
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch {
    return val;
  }
}

const MyBusiness = () => {
  const dispatch = useDispatch();
  const businesses = useSelector(state => state.businesses.items);
  const loading = useSelector(state => state.businesses.loading);
  const error = useSelector(state => state.businesses.error);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({ completion: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    category: '', // بدل type
    stage: 'Idea',
    description: '',
    file: null,
    logo: '',
    creationDate: new Date().toISOString().split('T')[0],
    progress: 0,
    setupSteps: [],
    partners: [],
    documents: [],
    stats: {
      stepsCompleted: 0,
      servicesRequested: 0,
      activeDeals: 0,
      moneySpent: 0,
      investorInterest: 0
    },
    location: undefined,
    contact: undefined,
    financial: undefined,
    tags: []
  });
  const [addErrors, setAddErrors] = useState({});
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Animation for completion percentage
  useEffect(() => {
    const animateCompletion = () => {
      const targetCompletion = selectedBusiness?.progress || 0;
      let current = 0;
      const increment = targetCompletion / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetCompletion) {
          current = targetCompletion;
          clearInterval(timer);
        }
        setAnimatedValues(prev => ({ ...prev, completion: current }));
      }, 20);
    };
    setTimeout(animateCompletion, 100);
  }, [selectedBusiness]);

  useEffect(() => {
    dispatch(fetchBusinesses());
  }, [dispatch]);

  useEffect(() => {
    if (businesses && businesses.length > 0) {
      setSelectedBusiness(businesses[0]);
      setEditableData(businesses[0]);
        } else {
          setSelectedBusiness(null);
          setEditableData(null);
        }
  }, [businesses]);

  // Handle business switch
  const handleBusinessSwitch = async (businessId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/businesses/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedBusiness(res.data.business);
      setEditableData(res.data.business);
      setIsEditing(false);
    } catch (err) {
      // يمكنك عرض رسالة خطأ هنا
    }
  };

  // Handle save changes
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/businesses/${selectedBusiness._id}`, editableData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(fetchBusinesses()); // Update Redux state
      setSelectedBusiness(editableData);
      setIsEditing(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      // يمكنك عرض رسالة خطأ هنا
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditableData(selectedBusiness);
    setIsEditing(false);
  };

  // Handle document upload (mock function)
  const handleDocumentUpload = (file) => {
    const newDocument = {
      id: selectedBusiness.documents.length + 1,
      name: file.name,
      type: "Uploaded",
      status: "Pending",
      file: file.name,
      uploaded: new Date().toISOString().split('T')[0]
    };
    setBusinesses(businesses.map(b => b._id === selectedBusiness._id ? {
      ...b,
      documents: [...b.documents, newDocument]
    } : b));
    setSelectedBusiness({ ...selectedBusiness, documents: [...selectedBusiness.documents, newDocument] });
  };

  // Handle archive business
  const handleArchive = (businessId) => {
    setBusinesses(businesses.map(b => b._id === businessId ? { ...b, status: "Archived" } : b));
    if (selectedBusiness._id === businessId) {
      setSelectedBusiness({ ...selectedBusiness, status: "Archived" });
    }
  };

  // Handle restart setup
  const handleRestart = (businessId) => {
    setBusinesses(businesses.map(b => b._id === businessId ? {
      ...b,
      status: "In Progress",
      progress: 0,
      setupSteps: b.setupSteps.map(step => ({ ...step, status: step.id === 1 ? "In Progress" : "Planned", date: null }))
    } : b));
    if (selectedBusiness._id === businessId) {
      setSelectedBusiness({
        ...selectedBusiness,
        status: "In Progress",
        progress: 0,
        setupSteps: selectedBusiness.setupSteps.map(step => ({ ...step, status: step.id === 1 ? "In Progress" : "Planned", date: null }))
      });
    }
  };

  // Status badge for steps and documents
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
      case 'Verified':
        return <Badge className="bg-green-100 text-green-700 animate-pulse">✓ {status}</Badge>;
      case 'In Progress':
      case 'Pending':
        return <Badge className="bg-blue-100 text-blue-700">🔄 {status}</Badge>;
      case 'Planned':
        return <Badge className="bg-gray-100 text-gray-600">📋 {status}</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-700">✗ {status}</Badge>;
      case 'Archived':
        return <Badge className="bg-gray-300 text-gray-800">🗃 {status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>;
    }
  };

  // Validation for Add Business Modal
  const validateAddBusiness = () => {
    const errors = {};
    if (!newBusiness.name) errors.name = 'Business Name is required';
    if (!newBusiness.category) errors.category = 'Category is required';
    if (!newBusiness.description) errors.description = 'Description is required and must be at least 150 characters';
    else if (newBusiness.description.length < 150) errors.description = 'Description must be at least 150 characters';
    if (!newBusiness.file) errors.file = 'File is required';
    return errors;
  };

  // Handle add new business
  const handleAddBusiness = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = {
        name: newBusiness.name,
        category: newBusiness.category,
        description: newBusiness.description,
        ...(newBusiness.location && { location: safeJsonParse(newBusiness.location) }),
        ...(newBusiness.contact && { contact: safeJsonParse(newBusiness.contact) }),
        ...(newBusiness.financial && { financial: safeJsonParse(newBusiness.financial) }),
        ...(newBusiness.tags && newBusiness.tags.length > 0 && { tags: newBusiness.tags }),
        ...(newBusiness.stage && { stage: newBusiness.stage }),
        ...(newBusiness.progress && { progress: newBusiness.progress }),
      };
      const res = await axios.post(`${BASE_URL}/api/businesses`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // بعد الإضافة الناجحة، جلب كل البزنسات من الباك اند
      dispatch(fetchBusinesses()); // Update Redux state
      if (businesses && businesses.length > 0) {
        setSelectedBusiness(businesses[0]);
        setEditableData(businesses[0]);
      } else {
        setSelectedBusiness(null);
        setEditableData(null);
      }
      setShowAddModal(false);
      setNewBusiness({
        name: '', category: '', stage: 'Idea', description: '', file: null, logo: '', creationDate: new Date().toISOString().split('T')[0], progress: 0, setupSteps: [], partners: [], documents: [], stats: { stepsCompleted: 0, servicesRequested: 0, activeDeals: 0, moneySpent: 0, investorInterest: 0 }, location: undefined, contact: undefined, financial: undefined, tags: []
      });
      toast({
        title: 'Business Added',
        description: 'Your new business has been added successfully!',
      });
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (newBusiness.location?.country) {
      setStates(State.getStatesOfCountry(newBusiness.location.country));
      setCities([]);
      setNewBusiness(prev => ({ ...prev, location: { ...prev.location, state: '', city: '' } }));
    } else {
      setStates([]);
      setCities([]);
    }
  }, [newBusiness.location?.country]);

  useEffect(() => {
    if (newBusiness.location?.country && newBusiness.location?.state) {
      setCities(City.getCitiesOfState(newBusiness.location.country, newBusiness.location.state));
      setNewBusiness(prev => ({ ...prev, location: { ...prev.location, city: '' } }));
    } else {
      setCities([]);
    }
  }, [newBusiness.location?.country, newBusiness.location?.state]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 px-16 py-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Add New Business Button & Business Switcher Dropdown in the same row */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#457B9D] text-[#457B9D] bg-white hover:bg-[#457B9D] hover:text-white transition-all"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedBusiness ? selectedBusiness.name : 'Select Business'}
              {dropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10 min-w-[220px] w-[240px] max-h-64 overflow-y-auto">
                {businesses.map(business => (
                  <div
                    key={business._id}
                    className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#457B9D]/10 ${selectedBusiness?._id === business._id ? 'bg-[#457B9D]/20' : ''}`}
                    style={{ minWidth: '200px', width: '100%' }}
                    onClick={() => { setSelectedBusiness(business); setEditableData(business); setDropdownOpen(false); }}
                  >
                    {business.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add New Business
          </Button>
        </div>
        {/* Add New Business Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in max-h-[90vh] overflow-y-auto">
              <button className="absolute top-4 right-4 text-gray-500 hover:text-red-500" onClick={() => {
                setShowAddModal(false);
                setNewBusiness({
                  name: '',
                  category: '',
                  description: '',
                  file: null,
                  logo: '',
                  creationDate: new Date().toISOString().split('T')[0],
                  stage: 'Idea',
                  progress: 0,
                  setupSteps: [],
                  partners: [],
                  documents: [],
                  stats: {
                    stepsCompleted: 0,
                    servicesRequested: 0,
                    activeDeals: 0,
                    moneySpent: 0,
                    investorInterest: 0
                  },
                  location: undefined,
                  contact: undefined,
                  financial: undefined,
                  tags: []
                });
                setAddErrors({});
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}>
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-center">Add New Business</h2>
              <div className="space-y-4">
                {/* Section 1: Basic Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#457B9D] mb-2 flex items-center gap-2"><Building2 className="w-5 h-5" /> Basic Information</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <Label htmlFor="business-name">Business Name <span className="text-red-500">*</span></Label>
                      <Input id="business-name" value={newBusiness.name} onChange={e => setNewBusiness({ ...newBusiness, name: e.target.value })} required className={addErrors.name ? 'border-red-500' : ''} placeholder="e.g. My Startup Project" />
                      {addErrors.name && <p className="text-red-500 text-sm mt-1">{addErrors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="business-type">Business Type <span className="text-red-500">*</span></Label>
                      <select id="business-type" className="w-full border rounded px-3 py-2 mt-1" value={newBusiness.category} onChange={e => setNewBusiness({ ...newBusiness, category: e.target.value })} required>
                        <option value="">Select Business Type</option>
                        <option value="tech">Tech</option>
                        <option value="finance">Finance</option>
                        <option value="food">Food</option>
                        <option value="health">Health</option>
                        <option value="education">Education</option>
                        <option value="services">Services</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="other">Other</option>
                      </select>
                      {addErrors.category && <p className="text-red-500 text-sm mt-1">{addErrors.category}</p>}
                    </div>
                    <div>
                      <Label htmlFor="business-stage">Stage of Business <span className="text-red-500">*</span></Label>
                      <select id="business-stage" className="w-full border rounded px-3 py-2 mt-1" value={newBusiness.stage || ''} onChange={e => setNewBusiness({ ...newBusiness, stage: e.target.value })} required>
                        <option value="">Select stage</option>
                        <option value="idea">Idea</option>
                        <option value="mvp">MVP</option>
                        <option value="launched">Launched</option>
                      </select>
                    </div>
                  </div>
                </div>
                <hr className="my-4 border-[#A8DADC]" />
                {/* Section 2: Description */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#457B9D] mb-2 flex items-center gap-2"><FileText className="w-5 h-5" /> Description</h3>
                  <Textarea id="business-description" value={newBusiness.description} onChange={e => setNewBusiness({ ...newBusiness, description: e.target.value })} rows={3} required className={addErrors.description ? 'border-red-500' : ''} placeholder="Describe your business idea, vision, and goals..." />
                  {addErrors.description && <p className="text-red-500 text-sm mt-1">{addErrors.description}</p>}
                </div>
                <hr className="my-4 border-[#A8DADC]" />
                {/* Section 3: Details */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#457B9D] mb-2 flex items-center gap-2"><MapPin className="w-5 h-5" /> Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-country">Country <span className="text-red-500">*</span></Label>
                      <select id="business-country" className="w-full border rounded px-3 py-2 mt-1" value={newBusiness.location?.country || ''} onChange={e => {
                        setNewBusiness({
                          ...newBusiness,
                          location: { country: e.target.value, state: '', city: '' }
                        });
                      }} required>
                        <option value="">Select Country</option>
                        {countries.map(country => (
                          <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="business-state">State/Province</Label>
                      <select id="business-state" className="w-full border rounded px-3 py-2 mt-1" value={newBusiness.location?.state || ''} onChange={e => {
                        setNewBusiness({
                          ...newBusiness,
                          location: { ...newBusiness.location, state: e.target.value, city: '' }
                        });
                      }} disabled={!newBusiness.location?.country}>
                        <option value="">Select State/Province</option>
                        {states.map(state => (
                          <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="business-city">City <span className="text-red-500">*</span></Label>
                      <select id="business-city" className="w-full border rounded px-3 py-2 mt-1" value={newBusiness.location?.city || ''} onChange={e => setNewBusiness({ ...newBusiness, location: { ...newBusiness.location, city: e.target.value } })} disabled={!newBusiness.location?.state} required>
                        <option value="">Select City</option>
                        {cities.map(city => (
                          <option key={city.name} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="business-contact-phone">Phone</Label>
                      <Input id="business-contact-phone" value={newBusiness.contact?.phone || ''} onChange={e => setNewBusiness({ ...newBusiness, contact: { ...newBusiness.contact, phone: e.target.value } })} placeholder="e.g., +201234567890" />
                    </div>
                    <div>
                      <Label htmlFor="business-contact-email">Email</Label>
                      <Input id="business-contact-email" value={newBusiness.contact?.email || ''} onChange={e => setNewBusiness({ ...newBusiness, contact: { ...newBusiness.contact, email: e.target.value } })} placeholder="e.g., info@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="business-tags">Tags</Label>
                      <Input id="business-tags" value={Array.isArray(newBusiness.tags) ? newBusiness.tags.join(',') : newBusiness.tags || ''} onChange={e => setNewBusiness({ ...newBusiness, tags: e.target.value.split(',').map(t => t.trim()) })} placeholder='AI, SaaS, Fintech' />
                    </div>
                  </div>
                </div>
                <hr className="my-4 border-[#A8DADC]" />
                {/* Section 4: File Upload */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#457B9D] mb-2 flex items-center gap-2"><Upload className="w-5 h-5" /> Attachments</h3>
                  <Label htmlFor="business-file">Upload File</Label>
                  <input
                    ref={fileInputRef}
                    id="business-file"
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    className={`w-full border rounded px-3 py-2 mt-1 ${addErrors.file ? 'border-red-500' : ''}`}
                    onChange={e => setNewBusiness({ ...newBusiness, files: Array.from(e.target.files) })}
                    required
                  />
                  {addErrors.file && <p className="text-red-500 text-sm mt-1">{addErrors.file}</p>}
                </div>
                <div className="flex gap-2 mt-6 justify-end">
                  <Button onClick={handleAddBusiness} className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white text-lg px-8 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">Add Business</Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Tabs for Business Details (Business Info & Connected Partners) */}
        <Tabs defaultValue="business-info" className="space-y-6">
          <TabsList className="grid grid-cols-2 gap-4 bg-transparent">
            <TabsTrigger value="business-info" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white">
              Business Info
            </TabsTrigger>
            <TabsTrigger value="partners" className="bg-white shadow-sm rounded-lg data-[state=active]:bg-[#457B9D] data-[state=active]:text-white">
              Connected Partners
            </TabsTrigger>
          </TabsList>
          {/* Business Info Tab */}
          <TabsContent value="business-info">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white">
                <CardTitle className="flex items-center gap-2">
                  Business Info
                </CardTitle>
                <p className="text-blue-100">View and edit your business details</p>
              </CardHeader>
              <CardContent className="p-8 bg-white">
                {selectedBusiness ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Business Name */}
                    {selectedBusiness.name && (
                    <div>
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Business Name</Label>
                        {isEditing ? (
                          <Input value={editableData.name} onChange={e => setEditableData({ ...editableData, name: e.target.value })} className="mt-1 border-2 border-[#A8DADC] focus:border-[#457B9D]" />
                        ) : (
                          <div className="mt-1 text-lg font-bold text-gray-900 break-words">{selectedBusiness.name}</div>
                        )}
                      </div>
                    )}
                    {/* Business Type */}
                    {selectedBusiness.category && (
                      <div>
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Business Type</Label>
                        {isEditing ? (
                          <select id="business-type" className="w-full border rounded px-3 py-2 mt-1" value={editableData.category} onChange={e => setEditableData({ ...editableData, category: e.target.value })} required>
                            <option value="">Select Business Type</option>
                            <option value="tech">Tech</option>
                            <option value="finance">Finance</option>
                            <option value="food">Food</option>
                            <option value="health">Health</option>
                            <option value="education">Education</option>
                            <option value="services">Services</option>
                            <option value="retail">Retail</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="agriculture">Agriculture</option>
                            <option value="other">Other</option>
                          </select>
                        ) : (
                          <div className="mt-1 text-gray-900 break-words">{selectedBusiness.category}</div>
                      )}
                    </div>
                    )}
                    {/* Stage */}
                    {selectedBusiness.stage && (
                    <div>
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Stage</Label>
                        {isEditing ? (
                          <select id="business-stage" className="w-full border rounded px-3 py-2 mt-1" value={editableData.stage || ''} onChange={e => setEditableData({ ...editableData, stage: e.target.value })} required>
                            <option value="">Select stage</option>
                            <option value="idea">Idea</option>
                            <option value="mvp">MVP</option>
                            <option value="launched">Launched</option>
                          </select>
                        ) : (
                          <div className="mt-1 text-gray-900">{selectedBusiness.stage}</div>
                        )}
                      </div>
                    )}
                    {/* Progress */}
                    {selectedBusiness.progress !== undefined && (
                      <div>
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Progress</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <Progress value={selectedBusiness.progress} className="h-2 w-full max-w-[120px]" />
                            <span className="text-xs text-gray-600">{selectedBusiness.progress ? selectedBusiness.progress.toFixed(1) : 0}%</span>
                          </div>
                    </div>
                    )}
                    {/* Created Date */}
                    {(selectedBusiness.creationDate || selectedBusiness.createdAt) && (
                    <div>
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Created</Label>
                        {isEditing ? (
                          <div className="mt-1 flex items-center gap-2 text-gray-900">
                            <Calendar className="w-4 h-4 text-[#457B9D]" />
                            {editableData.creationDate || (editableData.createdAt && new Date(editableData.createdAt).toLocaleDateString())}
                          </div>
                        ) : (
                          <div className="mt-1 flex items-center gap-2 text-gray-900">
                            <Calendar className="w-4 h-4 text-[#457B9D]" />
                            {selectedBusiness.creationDate || (selectedBusiness.createdAt && new Date(selectedBusiness.createdAt).toLocaleDateString())}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Description */}
                    {selectedBusiness.description && (
                      <div className="md:col-span-2">
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Description</Label>
                        {isEditing ? (
                          <Textarea id="business-description" value={editableData.description} onChange={e => setEditableData({ ...editableData, description: e.target.value })} rows={3} required className={addErrors.description ? 'border-red-500' : ''} placeholder="Describe your business idea, vision, and goals..." />
                        ) : (
                          <div className="mt-1 text-gray-700 whitespace-pre-line break-words max-w-full">{selectedBusiness.description}</div>
                        )}
                      </div>
                    )}
                    {/* Location */}
                    {selectedBusiness.location && (
                      <div className="md:col-span-2">
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Location</Label>
                        {isEditing ? (
                          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="business-country">Country <span className="text-red-500">*</span></Label>
                              <select id="business-country" className="w-full border rounded px-3 py-2 mt-1" value={editableData.location?.country || ''} onChange={e => {
                                setEditableData({
                                  ...editableData,
                                  location: { country: e.target.value, state: '', city: '' }
                                });
                              }} required>
                                <option value="">Select Country</option>
                                {countries.map(country => (
                                  <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="business-state">State/Province</Label>
                              <select id="business-state" className="w-full border rounded px-3 py-2 mt-1" value={editableData.location?.state || ''} onChange={e => {
                                setEditableData({
                                  ...editableData,
                                  location: { ...editableData.location, state: e.target.value, city: '' }
                                });
                              }} disabled={!editableData.location?.country}>
                                <option value="">Select State/Province</option>
                                {states.map(state => (
                                  <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                                ))}
                              </select>
                    </div>
                    <div>
                              <Label htmlFor="business-city">City <span className="text-red-500">*</span></Label>
                              <select id="business-city" className="w-full border rounded px-3 py-2 mt-1" value={editableData.location?.city || ''} onChange={e => setEditableData({ ...editableData, location: { ...editableData.location, city: e.target.value } })} disabled={!editableData.location?.state} required>
                                <option value="">Select City</option>
                                {cities.map(city => (
                                  <option key={city.name} value={city.name}>{city.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-gray-900">
                            {selectedBusiness.location.country && (
                              <span>{Country.getCountryByCode(selectedBusiness.location.country)?.name || selectedBusiness.location.country}</span>
                            )}
                            {selectedBusiness.location.state && (
                              <span>{', '}{State.getStateByCodeAndCountry(selectedBusiness.location.country, selectedBusiness.location.state)?.name || selectedBusiness.location.state}</span>
                            )}
                            {selectedBusiness.location.city && (
                              <span>{', '}{selectedBusiness.location.city}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Contact */}
                    {selectedBusiness.contact && (
                      <div className="md:col-span-2">
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Contact</Label>
                        {isEditing ? (
                          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="business-contact-phone">Phone</Label>
                              <Input id="business-contact-phone" value={editableData.contact?.phone || ''} onChange={e => setEditableData({ ...editableData, contact: { ...editableData.contact, phone: e.target.value } })} placeholder="e.g., +201234567890" />
                    </div>
                    <div>
                              <Label htmlFor="business-contact-email">Email</Label>
                              <Input id="business-contact-email" value={editableData.contact?.email || ''} onChange={e => setEditableData({ ...editableData, contact: { ...editableData.contact, email: e.target.value } })} placeholder="e.g., info@example.com" />
                            </div>
                          </div>
                        ) : (
                          <div className="mt-1 text-gray-900 flex flex-wrap gap-x-4 gap-y-1">
                            {selectedBusiness.contact.phone && <span>{selectedBusiness.contact.phone}</span>}
                            {selectedBusiness.contact.email && <span>{selectedBusiness.contact.email}</span>}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Tags */}
                    {selectedBusiness.tags && selectedBusiness.tags.length > 0 && (
                      <div className="md:col-span-2">
                        <Label className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Tags</Label>
                        {isEditing ? (
                          <div className="mt-1 flex flex-wrap gap-2">
                            <Input id="business-tags" value={Array.isArray(editableData.tags) ? editableData.tags.join(',') : editableData.tags || ''} onChange={e => setEditableData({ ...editableData, tags: e.target.value.split(',').map(t => t.trim()) })} placeholder='AI, SaaS, Fintech' />
                          </div>
                        ) : (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {selectedBusiness.tags.map((tag, idx) => (
                              <span key={idx} className="bg-[#457B9D]/10 text-[#457B9D] px-2 py-1 rounded-full text-xs font-medium">{tag}</span>
                            ))}
                          </div>
                        )}
                    </div>
                    )}
                    {/* Attachments / Files Section */}
                    {(selectedBusiness.pitchDeckLink || selectedBusiness.pitchDeckFile || (selectedBusiness.files && selectedBusiness.files.length > 0) || (selectedBusiness.documents && selectedBusiness.documents.length > 0)) && (
                    <div className="md:col-span-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attachments</Label>
                        <div className="mt-1 flex flex-col gap-2">
                          {/* Pitch Deck Link */}
                          {selectedBusiness.pitchDeckLink && (
                            <div>
                              <span className="font-medium">Pitch Deck Link: </span>
                              <a href={selectedBusiness.pitchDeckLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">View Pitch Deck</a>
                            </div>
                          )}
                          {/* Pitch Deck File */}
                          {selectedBusiness.pitchDeckFile && (
                            <div>
                              <span className="font-medium">Pitch Deck File: </span>
                              <a href={selectedBusiness.pitchDeckFile} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">Download</a>
                            </div>
                          )}
                          {/* Files from modal */}
                          {selectedBusiness.files && Array.isArray(selectedBusiness.files) && selectedBusiness.files.length > 0 && (
                            <div>
                              <span className="font-medium">Files: </span>
                              <ul className="list-disc ml-6">
                                {selectedBusiness.files.map((file, idx) => (
                                  <li key={idx} className="break-all">
                                    <a href={typeof file === 'string' ? file : file.url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                      {file.name || (typeof file === 'string' ? file.split('/').pop() : 'File')}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Documents from modal (if any) */}
                          {selectedBusiness.documents && Array.isArray(selectedBusiness.documents) && selectedBusiness.documents.length > 0 && (
                            <div>
                              <span className="font-medium">Documents: </span>
                              <ul className="list-disc ml-6">
                                {selectedBusiness.documents.map((doc, idx) => (
                                  <li key={idx} className="break-all">
                                    <a href={doc.file || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                      {doc.name || doc.file?.split('/').pop() || 'Document'}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                      )}
                    </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{textAlign: 'center', margin: '2rem', color: '#888'}}>No businesses available</div>
                )}
                {/* Edit/Save/Cancel Buttons */}
                <div className="mt-8 flex gap-2 justify-end">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-[#457B9D] to-[#1D3557]"
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-green-500 to-emerald-600"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Connected Partners */}
          <TabsContent value="partners">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-white" />
                  Connected Partners
                </CardTitle>
                <p className="text-blue-100">Manage relationships for {selectedBusiness?.name}</p>
        </CardHeader>
              <CardContent className="p-6 bg-white">
                {selectedBusiness?.partners && selectedBusiness.partners.length > 0 ? (
                  <div className="grid gap-4">
                    {selectedBusiness.partners.map(partner => (
                      <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={partner.avatar} />
                            <AvatarFallback><Users className="w-6 h-6" /></AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {partner.type.toLowerCase().includes('investor') && (
                                <span className="text-sm text-[#1D3557] font-medium">Investor</span>
                              )}
                              {partner.type.toLowerCase().includes('supplier') && (
                                <span className="text-sm text-[#1D3557] font-medium">Supplier</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Deal: {partner.dealValue} • Last Contact: {partner.lastContact}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[#1D3557] border-[#1D3557] hover:bg-[#1D3557] hover:text-white"
                            onClick={() => navigate(`/dashboard/entrepreneur/messages?partner=${partner.id}`)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>
                  </div>
                ))}
            </div>
          ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="mb-4 text-gray-500">No connected partners yet.</p>
                    <Button
                      className="bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white mx-auto flex items-center gap-2"
                      onClick={() => navigate('/dashboard/entrepreneur?tab=marketplace')}
                    >
                      <Users className="w-4 h-4 mr-2" /> Add Partner
                    </Button>
                  </div>
          )}
        </CardContent>
      </Card>
          </TabsContent>
        </Tabs>
        {/* Success Notification */}
        {showNotification && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Changes Saved!</p>
              <p className="text-sm">Business information updated successfully</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBusiness; 
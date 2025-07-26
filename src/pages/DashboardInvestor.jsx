import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import Sidebar from '../components/Sidebar';
import { DollarSign, TrendingUp, Briefcase, BarChart3, User, Settings, LogOut, Eye, Star, Users, X, Lightbulb, Target, Clock, CheckCircle, Bell, Download, MessageCircle, Plus, FileText, MapPin } from 'lucide-react';
import OpportunityDetailsModal from '../components/OpportunityDetailsModal';
import SettingsPage from '../components/SettingsPage';
import Messages from '../components/Messages';
import MyDeals from '../components/MyDeals';
import MilestonesSection from '../components/MilestonesSection';
import DocumentationPage from '../components/DocumentationPage';
import Support from '../pages/Support';
import InvestmentCharts from '../components/overview/InvestmentCharts';
import RequestsPage from './RequestsPage';
import FeedbackAndReviews from './FeedbackAndReviews';
import { Country, City } from 'country-state-city';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBusinesses } from '../redux/slices/businessesSlice';
import ExploreProjects from '../components/ExploreProjects';
import NotificationsPage from '../components/NotificationsPage';

// Sidebar toggle button with notched arrow style
function SidebarToggle({ isOpen, toggleSidebar }) {
  return (
    <button
      onClick={toggleSidebar}
      aria-label="Toggle sidebar"
      className={`
        fixed z-50
        ${isOpen ? 'left-64' : 'left-0'}
        top-1/2 -translate-y-1/2
        transition-all
        shadow
        ${isOpen ? 'rounded-r-lg' : 'rounded-r-lg'}
        w-6 h-12 flex items-center justify-center
        outline-none
      `}
      style={{
        background: isOpen ? '#457B9D' : '#457B9D',
        transition: 'background 0.2s',
        transform: isOpen
          ? 'translateY(-50%)'
          : 'translate(-80%, -50%)',
      }}
      onMouseOver={e => e.currentTarget.style.background = '#27406b'}
      onMouseOut={e => e.currentTarget.style.background = '#457B9D'}
    >
      <span
        className={`
          block w-4 h-8
          ${isOpen ? '' : 'rotate-180'}
          relative
        `}
        style={{
          clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
          background: 'white',
        }}
      ></span>
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
}

const InvestorDashboard = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState([]);
  const [filterStage, setFilterStage] = useState([]);
  const [filterMin, setFilterMin] = useState(0);
  const [filterMax, setFilterMax] = useState(3000000);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [investTarget, setInvestTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolio, setPortfolio] = useState([
    { name: 'DataViz Inc', invested: 50000, value: 75000, roi: '+50%' },
    { name: 'EcoTech Solutions', invested: 25000, value: 30000, roi: '+20%' },
    { name: 'MedConnect', invested: 100000, value: 180000, roi: '+80%' },
  ]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [exploreFilters, setExploreFilters] = useState({
    stage: '',
    industry: '',
    country: '',
    city: '',
    fundingNeeded: [0, 1000000],
    fundingProgress: [0, 100],
    sort: 'newest',
    search: '',
  });
  const [countries] = useState(Country.getAllCountries());
  const [cities, setCities] = useState([]);
  useEffect(() => {
    if (exploreFilters.country) {
      setCities(City.getCitiesOfCountry(exploreFilters.country));
      setExploreFilters(f => ({ ...f, city: '' }));
    } else {
      setCities([]);
      setExploreFilters(f => ({ ...f, city: '' }));
    }
  }, [exploreFilters.country]);
  const [darkMode, setDarkMode] = useState(false);
  const [requests, setRequests] = useState([]);
  const dispatch = useDispatch();
  const { items: exploreProjects, loading: loadingProjects, error: errorProjects } = useSelector(state => state.businesses);
  const [overviewStats, setOverviewStats] = useState({
    projects: 0,
    requests: 0,
    ongoingDeals: 0,
    completedDeals: 0,
    underEvaluation: 0,
  });
  const [allBusinesses, setAllBusinesses] = useState([]);

  useEffect(() => {
    // جلب بيانات overview من عدة endpoints
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    // جلب المشاريع
    axios.get('http://localhost:5000/api/businesses/all', { headers })
      .then(res => {
        const businesses = res.data.businesses ?? res.data.data ?? [];
        setOverviewStats(prev => ({ ...prev, projects: businesses.length }));
      })
      .catch(() => {});
    // جلب الطلبات
    axios.get('http://localhost:5000/api/requests', { headers })
      .then(res => {
        const requests = res.data.requests ?? res.data.data ?? [];
        setOverviewStats(prev => ({ ...prev, requests: requests.length }));
      })
      .catch(() => {});
    // جلب الصفقات الخاصة بالمستثمر
    axios.get('http://localhost:5000/api/deals/my', { headers })
      .then(res => {
        const deals = res.data.deals ?? res.data.data ?? [];
        const ongoing = deals.filter(d => d.status === 'ongoing').length;
        const completed = deals.filter(d => d.status === 'completed').length;
        const underEval = deals.filter(d => d.status === 'under_evaluation' || d.status === 'pending').length;
        setOverviewStats(prev => ({ ...prev, ongoingDeals: ongoing, completedDeals: completed, underEvaluation: underEval }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (
      activeTab === 'exploreProjects' &&
      exploreProjects.length === 0 &&
      !loadingProjects &&
      !errorProjects // أضفنا هذا الشرط
    ) {
      dispatch(fetchBusinesses());
    }
  }, [activeTab, exploreProjects.length, loadingProjects, errorProjects, dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    axios.get('http://localhost:5000/api/businesses/all', { headers })
      .then(res => {
        const businesses = res.data.businesses ?? res.data.data ?? [];
        setAllBusinesses(businesses);
      })
      .catch(() => setAllBusinesses([]));
  }, []);

  // جلب اسم المستخدم من localStorage
  const getUserFirstName = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userFirstName') || 'User';
    }
    return 'User';
  };
  const userFirstName = getUserFirstName();

  const translations = {
    en: {
      welcome: `Welcome back, ${userFirstName}!`,
      overview: "Here's your investment overview",
      projectsViewed: "Projects Viewed",
      ongoingDeals: "Ongoing Deals", 
      completedDeals: "Completed Deals",
      underEvaluation: "Under Evaluation",
      notifications: "Notifications",
      projectFeed: "Project Feed",
      recentActivity: "Recent Activity",
      topPerforming: "Top Performing Investments",
      exploreProjects: "Explore New Projects",
      reviewDeals: "Review Previous Deals",
      contactEntrepreneur: "Contact Entrepreneur",
      viewPlan: "View Plan",
      downloadFiles: "Download Files",
      messageFounder: "Message Founder",
      stage: "Stage",
      founder: "Founder",
      industry: "Industry",
      funding: "Funding",
      status: "Status",
      actions: "Actions",
      viewed: "Viewed",
      notViewed: "Not Viewed",
      idea: "Idea",
      prototype: "Prototype",
      market: "Market Need",
      all: "All Projects",
      unviewed: "Unviewed",
      profile: "Profile",
      settings: "Settings",
      signOut: "Sign Out"
    }
  };
  const t = translations[language];
  const isRTL = language === 'ar';

  const opportunities = [
    {
      name: 'TechFlow AI',
      industry: 'Technology',
      description: 'AI-powered workflow automation for enterprises',
      funded: 1200000,
      goal: 2000000,
      rating: 4.8,
      founder: 'Sarah Chen',
      location: 'San Francisco, CA',
      stage: 'Series A',
      investors: 23,
      minInvestment: 10000,
      roi: '+40%',
      longDescription: 'TechFlow AI is revolutionizing enterprise automation with advanced AI-driven solutions for workflow management, boosting productivity and reducing costs.'
    },
    {
      name: 'GreenEnergy Solutions',
      industry: 'Energy',
      description: 'Renewable energy solutions for residential properties',
      funded: 320000,
      goal: 500000,
      rating: 4.6,
      founder: 'Michael Rodriguez',
      location: 'Austin, TX',
      stage: 'Seed',
      investors: 15,
      minInvestment: 5000,
      roi: '+25%',
      longDescription: 'GreenEnergy Solutions provides affordable and scalable solar energy systems for homes, helping reduce carbon footprint and energy bills.'
    },
    {
      name: 'HealthTrack Pro',
      industry: 'Healthcare',
      description: 'Digital health monitoring platform for chronic diseases',
      funded: 800000,
      goal: 1500000,
      rating: 4.9,
      founder: 'Dr. Emily Watson',
      location: 'Boston, MA',
      stage: 'Pre-Series A',
      investors: 31,
      minInvestment: 20000,
      roi: '+60%',
      longDescription: 'HealthTrack Pro offers real-time health monitoring and analytics for patients with chronic illnesses, improving outcomes and reducing hospital visits.'
    }
  ];

  const industryOptions = ['Technology', 'Energy', 'Healthcare'];
  const stageOptions = ['Seed', 'Series A', 'Pre-Series A'];
  const filteredOpportunities = opportunities.filter(opp => {
    const industryMatch = filterIndustry.length === 0 || filterIndustry.includes(opp.industry);
    const stageMatch = filterStage.length === 0 || filterStage.includes(opp.stage);
    const fundingMatch = opp.goal >= filterMin && opp.goal <= filterMax;
    return industryMatch && stageMatch && fundingMatch;
  });

  const roleSpecificItems = {
    investor: [
      { id: 'startups', label: 'Startups', icon: Lightbulb },
      { id: 'portfolio', label: 'Portfolio', icon: BarChart3 },
      { id: 'deals', label: 'Deals', icon: Target }
    ],
    // ...
  };

  const projects = [
    {
      id: '1',
      name: 'TechFlow AI',
      nameAr: 'تك فلو الذكي',
      stage: 'prototype',
      viewed: false,
      founder: 'Sarah Ahmed',
      founderAr: 'سارة أحمد',
      industry: 'AI/ML',
      industryAr: 'ذكاء اصطناعي',
      funding: '$500K',
      uploadDate: '2 hours ago'
    },
    {
      id: '2',
      name: 'GreenTech Solutions',
      nameAr: 'حلول التقنية الخضراء',
      stage: 'market',
      viewed: true,
      founder: 'Omar Hassan',
      founderAr: 'عمر حسن',
      industry: 'Clean Energy',
      industryAr: 'طاقة نظيفة',
      funding: '$1.2M',
      uploadDate: '1 day ago'
    },
    {
      id: '3',
      name: 'HealthConnect',
      nameAr: 'هيلث كونكت',
      stage: 'idea',
      viewed: true,
      founder: 'Fatima Al-Zahra',
      founderAr: 'فاطمة الزهراء',
      industry: 'Healthcare',
      industryAr: 'رعاية صحية',
      funding: '$750K',
      uploadDate: '3 days ago'
    }
  ];

  const notifications = [
    { id: 1, text: 'New investment opportunity: TechFlow AI', textAr: 'فرصة استثمار جديدة: تك فلو الذكي', time: '2h ago', unread: true },
    { id: 2, text: 'GreenTech Solutions reached funding milestone', textAr: 'حلول التقنية الخضراء وصلت لهدف التمويل', time: '1d ago', unread: true },
    { id: 3, text: 'Portfolio valuation updated', textAr: 'تم تحديث تقييم المحفظة', time: '3d ago', unread: false }
  ];

  const getStageColor = (stage) => {
    switch (stage) {
      case 'idea': return 'bg-yellow-100 text-yellow-800';
      case 'prototype': return 'bg-blue-100 text-blue-800';  
      case 'market': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const [selectedFilter, setSelectedFilter] = useState('all');
  const filteredProjects = projects.filter(project => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unviewed') return !project.viewed;
    return project.stage === selectedFilter;
  });

  // Demo projects data
  const allProjects = [
    {
      id: 1,
      name: 'MedConnect',
      logo: '/public/logo.png',
      description: 'A digital health platform connecting patients and doctors for remote consultations and health tracking.',
      stage: 'Scaling',
      industry: 'Health',
      location: 'Cairo, Egypt',
      fundingNeeded: 500000,
      fundingRaised: 320000,
      badges: ['Verified', 'Trending'],
      featured: true,
      isVerified: true,
      isTrending: true,
      isFeatured: true,
      founder: 'Sarah Ahmed',
      pitchDeck: 'https://example.com/pitchdeck.pdf',
      useOfFunds: 'Product development, marketing, hiring',
      details: 'MedConnect is revolutionizing healthcare access in MENA by providing seamless telemedicine and health analytics.'
    },
    {
      id: 2,
      name: 'EduSpark',
      logo: '/public/logo2.png',
      description: 'An adaptive learning platform for K-12 students, powered by AI and gamification.',
      stage: 'MVP',
      industry: 'Education',
      location: 'Dubai, UAE',
      fundingNeeded: 200000,
      fundingRaised: 80000,
      badges: ['Featured'],
      featured: true,
      isVerified: false,
      isTrending: false,
      isFeatured: true,
      founder: 'Omar Khaled',
      pitchDeck: '',
      useOfFunds: 'Platform scaling, content partnerships',
      details: 'EduSpark personalizes education for every child, making learning fun and effective.'
    },
    {
      id: 3,
      name: 'GreenTech',
      logo: '/public/logo.png',
      description: 'Clean energy solutions for urban buildings, reducing carbon footprint and energy costs.',
      stage: 'Idea',
      industry: 'Tech',
      location: 'Riyadh, Saudi Arabia',
      fundingNeeded: 300000,
      fundingRaised: 20000,
      badges: ['Verified'],
      featured: false,
      isVerified: true,
      isTrending: false,
      isFeatured: false,
      founder: 'Laila Al Saud',
      pitchDeck: '',
      useOfFunds: 'Prototype development, pilot projects',
      details: 'GreenTech aims to make cities greener and more sustainable through innovative energy tech.'
    },
    // ... add more demo projects
  ];

  // Filtering logic for exploreProjects
  const exploreFilteredProjects = exploreProjects.filter(project => {
    const matchesStage = !exploreFilters.stage || project.stage === exploreFilters.stage;
    const matchesIndustry = !exploreFilters.industry || project.industry === exploreFilters.industry;
    // لو عندك country/city في بيانات المشروع من السيرفر أضيفيها هنا
    const matchesFunding = project.fundingNeeded >= exploreFilters.fundingNeeded[0] && project.fundingNeeded <= exploreFilters.fundingNeeded[1];
    const progress = Math.round((project.fundingRaised / project.fundingNeeded) * 100);
    const matchesProgress = progress >= exploreFilters.fundingProgress[0] && progress <= exploreFilters.fundingProgress[1];
    const matchesSearch = !exploreFilters.search || (project.name && project.name.toLowerCase().includes(exploreFilters.search.toLowerCase())) || (project.description && project.description.toLowerCase().includes(exploreFilters.search.toLowerCase()));
    return matchesStage && matchesIndustry && matchesFunding && matchesProgress && matchesSearch;
  });

  // Sorting logic for exploreProjects
  const exploreSortedProjects = [...exploreFilteredProjects].sort((a, b) => {
    if (exploreFilters.sort === 'newest') return b.id - a.id;
    if (exploreFilters.sort === 'mostFunded') return (b.fundingRaised / b.fundingNeeded) - (a.fundingRaised / a.fundingNeeded);
    if (exploreFilters.sort === 'lowestCapital') return a.fundingNeeded - b.fundingNeeded;
    return 0;
  });

  return (
    <>
      <DashboardHeader
        userEmail="investor@demo.com"
        userRole="investor"
        onProfileMenu={() => setShowProfileMenu(!showProfileMenu)}
        showProfileMenu={showProfileMenu}
      >
        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <User className="w-4 h-4 mr-2" />
          Profile
        </a>
        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </a>
        <hr className="my-1" />
        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </a>
      </DashboardHeader>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole="investor"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <SidebarToggle isOpen={!sidebarCollapsed} toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`} style={{ backgroundColor: '#EEF8F7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.welcome}</h1>
                <p className="text-gray-600">{t.overview}</p>
              </div>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 justify-center place-items-center">
                {/* Projects Viewed */}
                <div className="min-w-[260px] min-h-[210px] p-8 rounded-3xl shadow-lg flex flex-col items-center hover:shadow-2xl transition group border border-[#A8DADC] bg-[#A8DADC]">
                  <div className="bg-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Eye className="h-10 w-10" style={{ color: '#457B9D' }} />
                  </div>
                  <div className="text-4xl font-extrabold text-[#1D3557] mb-2">{overviewStats.projects}</div>
                  <div className="text-lg font-semibold mb-2 text-[#1D3557]">Projects Viewed</div>
                  <div className="text-base text-[#457B9D]">Projects you have checked</div>
                </div>
                {/* Ongoing Deals */}
                <div className="min-w-[260px] min-h-[210px] p-8 rounded-3xl shadow-lg flex flex-col items-center hover:shadow-2xl transition group border border-[#A8DADC] bg-[#A8DADC]">
                  <div className="bg-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="h-10 w-10" style={{ color: '#457B9D' }} />
                  </div>
                  <div className="text-4xl font-extrabold text-[#1D3557] mb-2">{overviewStats.ongoingDeals}</div>
                  <div className="text-lg font-semibold mb-2 text-[#1D3557]">Ongoing Deals</div>
                  <div className="text-base text-[#457B9D]">Deals in progress</div>
                </div>
                {/* Completed Deals */}
                <div className="min-w-[260px] min-h-[210px] p-8 rounded-3xl shadow-lg flex flex-col items-center hover:shadow-2xl transition group border border-[#A8DADC] bg-[#A8DADC]">
                  <div className="bg-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-10 w-10" style={{ color: '#457B9D' }} />
                  </div>
                  <div className="text-4xl font-extrabold text-[#1D3557] mb-2">{overviewStats.completedDeals}</div>
                  <div className="text-lg font-semibold mb-2 text-[#1D3557]">Completed Deals</div>
                  <div className="text-base text-[#457B9D]">Deals you finished</div>
                </div>
                {/* Under Evaluation */}
                <div className="min-w-[260px] min-h-[210px] p-8 rounded-3xl shadow-lg flex flex-col items-center hover:shadow-2xl transition group border border-[#A8DADC] bg-[#A8DADC]">
                  <div className="bg-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-10 w-10" style={{ color: '#457B9D' }} />
                  </div>
                  <div className="text-4xl font-extrabold text-[#1D3557] mb-2">{overviewStats.underEvaluation}</div>
                  <div className="text-lg font-semibold mb-2 text-[#1D3557]">Under Evaluation</div>
                  <div className="text-base text-[#457B9D]">Deals being evaluated</div>
                </div>
              </div>
              {/* Investment Charts Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Investment Analytics</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Project Feed */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">{t.projectFeed}</h2>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <select 
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5B9BD5]"
                          >
                            <option value="all">{t.all}</option>
                            <option value="unviewed">{t.unviewed}</option>
                            <option value="idea">{t.idea}</option>
                            <option value="prototype">{t.prototype}</option>
                            <option value="market">{t.market}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {allBusinesses.length === 0 ? (
                          <div className="text-gray-500">No projects found.</div>
                        ) : (
                          allBusinesses.slice(0, 3).map((project) => {
                            console.log('Project:', project);
                            return (
                              <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(project.stage)}`}>{project.stage || 'غير محدد'}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                      <p><span className="font-medium">Founder:</span> {project.founder || project.ownerName || project.owner || 'غير محدد'}</p>
                                      <p><span className="font-medium">Industry:</span> {project.industry || project.category || 'غير محدد'}</p>
                                      <p><span className="font-medium">Funding:</span> {project.fundingNeeded ? `$${project.fundingNeeded}` : project.funding || 'غير محدد'}</p>
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-500">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm"></div>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <button className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1 text-sm text-[#5B9BD5] hover:bg-blue-50 rounded-lg transition-colors" onClick={() => { setSelectedProject(project); setShowProjectModal(true); }}>
                                      <Eye className="w-6 h-6" />
                                      <span>View Plan</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Quick Actions */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-[#5B9BD5] text-white rounded-xl hover:bg-[#4A8BC2] transition-colors"
                      onClick={() => setActiveTab('exploreProjects')}
                    >
                      <Plus className="h-5 w-5" />
                      <span>{t.exploreProjects}</span>
                    </button>
                    <button
                      className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveTab('portfolio')}
                    >
                      <FileText className="h-5 w-5" />
                      <span>{t.reviewDeals}</span>
                    </button>
                    <button
                      className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveTab('settings')}
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{t.contactEntrepreneur}</span>
                    </button>
                  </div>
                </div>
                {/* Notifications Panel */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">{t.recentActivity}</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <div key={notification.id} className={`p-3 rounded-lg ${notification.unread ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                            <div className="flex items-start space-x-3 rtl:space-x-reverse">
                              <div className={`p-1 rounded-full ${notification.unread ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                <div className="h-2 w-2 bg-white rounded-full"></div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">{isRTL ? notification.textAr : notification.text}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-4 text-sm text-[#5B9BD5] hover:text-[#4A8BC2] font-medium">View all notifications</button>
                    </div>
                  </div>
                  {/* Top Performing */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">{t.topPerforming}</h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                            <p className="font-medium text-gray-900">DataViz Inc</p>
                            <p className="text-sm text-gray-600">Invested: $50K</p>
                      </div>
                      <div className="text-right">
                            <p className="font-bold text-gray-900">$75K</p>
                            <p className="text-sm text-green-600">+50%</p>
              </div>
            </div>
                    <div className="flex items-center justify-between">
                      <div>
                            <p className="font-medium text-gray-900">EcoTech Solutions</p>
                            <p className="text-sm text-gray-600">Invested: $25K</p>
          </div>
                      <div className="text-right">
                            <p className="font-bold text-gray-900">$30K</p>
                            <p className="text-sm text-green-600">+20%</p>
          </div>
          </div>
                    <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">MedConnect</p>
                            <p className="text-sm text-gray-600">Invested: $100K</p>
                      </div>
                      <div className="text-right">
                            <p className="font-bold text-gray-900">$180K</p>
                            <p className="text-sm text-green-600">+80%</p>
                          </div>
                            </div>
                          </div>
                        </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'opportunities' && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Investment Opportunities</h1>
              <p className="text-gray-600 mb-6">Discover promising startups and investment opportunities</p>
              <div className="flex items-center mb-6 gap-2">
                <input type="text" placeholder="Search opportunities..." className="flex-1 px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <button className="px-4 py-2 border border-blue-200 rounded-lg text-blue-900 font-semibold hover:bg-blue-50" onClick={() => setShowFilters(true)}>Filters</button>
                        </div>
              {/* Filter Modal */}
              {showFilters && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
                    <button onClick={() => setShowFilters(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"><X className="w-5 h-5" /></button>
                    <h2 className="text-xl font-bold mb-4">Filter Opportunities</h2>
                    <div className="mb-4">
                      <div className="font-semibold mb-2">Industry</div>
                      <div className="flex flex-wrap gap-2">
                        {industryOptions.map(opt => (
                          <button key={opt} type="button" onClick={() => setFilterIndustry(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt])} className={`px-3 py-1 rounded-full border ${filterIndustry.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-900 text-blue-900 bg-white hover:bg-blue-50'}`}>{opt}</button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="font-semibold mb-2">Stage</div>
                      <div className="flex flex-wrap gap-2">
                        {stageOptions.map(opt => (
                          <button key={opt} type="button" onClick={() => setFilterStage(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt])} className={`px-3 py-1 rounded-full border ${filterStage.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-900 text-blue-900 bg-white hover:bg-blue-50'}`}>{opt}</button>
                    ))}
                  </div>
                    </div>
                    <div className="mb-4">
                      <div className="font-semibold mb-2">Funding Goal</div>
                      <div className="flex items-center gap-2">
                        <input type="number" value={filterMin} min={0} max={filterMax} onChange={e => setFilterMin(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" />
                        <span>-</span>
                        <input type="number" value={filterMax} min={filterMin} max={5000000} onChange={e => setFilterMax(Number(e.target.value))} className="w-20 px-2 py-1 border rounded" />
            </div>
                  </div>
                    <button onClick={() => setShowFilters(false)} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Apply Filters</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOpportunities.map((opp, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">{opp.name}</h2>
                        <div className="text-sm text-gray-500">{opp.industry}</div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{opp.stage}</span>
                    </div>
                    <div className="mb-2 text-gray-700">{opp.description}</div>
                    <div className="mb-2 text-xs text-gray-500">Funding Progress</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${Math.min(100, (opp.funded / opp.goal) * 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>${opp.funded.toLocaleString()} / ${opp.goal.toLocaleString()}</span>
                      <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{opp.investors} investors</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center text-yellow-500 text-sm font-semibold"><Star className="w-4 h-4 mr-1" />{opp.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">Founder: {opp.founder}<br />{opp.location}</div>
                    <div className="flex gap-2 mt-4">
                      <button
                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                        onClick={() => { setInvestTarget(opp); setShowInvestModal(true); }}
                      >
                        <DollarSign className="w-4 h-4" /> Invest
                      </button>
                      <button onClick={() => { setSelectedOpportunity(opp); setShowOpportunityModal(true); }} className="p-2 border border-blue-200 rounded-lg text-blue-900 hover:bg-blue-50 flex items-center justify-center">
                        <Eye className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <OpportunityDetailsModal opportunity={selectedOpportunity} isOpen={showOpportunityModal} onClose={() => setShowOpportunityModal(false)} />
            </div>
          )}
          {activeTab === 'portfolio' && (
            <MyDeals userRole="investor" />
          )}
          {activeTab === 'settings' && (
            <SettingsPage user={{
              fullName: 'dfgh',
              email: 'investor@demo.com',
              bio: 'fgh',
              location: 'ccgh',
              phone: '',
              company: '',
              website: ''
            }} role="investor" />
          )}
          {activeTab === 'messages' && (
            <Messages />
          )}
          {activeTab === 'milestones' && (
            <MilestonesSection userRole="investor" />
          )}
          {activeTab === 'documentation' && (
            <DocumentationPage />
          )}
          {activeTab === 'support' && (
            <Support />
          )}
          {activeTab === 'requests' && (
            <RequestsPage />
          )}
          {activeTab === 'feedback' && (
            <FeedbackAndReviews />
          )}
          {activeTab === 'exploreProjects' && (
            <>
             
              <ExploreProjects
                projects={exploreProjects}
                loading={loadingProjects}
                error={errorProjects}
                filters={exploreFilters}
                setFilters={setExploreFilters}
                dispatch={dispatch}
                showProjectModal={showProjectModal}
                setShowProjectModal={setShowProjectModal}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                countries={countries}
                cities={cities}
                fetchBusinesses={fetchBusinesses}
              />
            </>
          )}
          {activeTab === 'notifications' && (
            <NotificationsPage userRole="investor" />
          )}
          {/* Investment Modal */}
          {showInvestModal && investTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
                <button onClick={() => setShowInvestModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"><X className="w-5 h-5" /></button>
                <h2 className="text-xl font-bold mb-4">Invest in {investTarget.name}</h2>
                <div className="mb-4">
                  <div className="text-gray-700 mb-2">Minimum Investment: <span className="font-semibold">${investTarget.minInvestment.toLocaleString()}</span></div>
                  <input
                    type="number"
                    min={investTarget.minInvestment}
                    value={investAmount}
                    onChange={e => setInvestAmount(e.target.value)}
                    placeholder={`Enter amount (min $${investTarget.minInvestment})`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button onClick={() => setShowInvestModal(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100">Cancel</button>
                  <button
                    onClick={() => {
                      setShowInvestModal(false);
                      setInvestAmount('');
                      setPortfolio(prev => [...prev, { name: investTarget.name, invested: Number(investAmount), value: Number(investAmount) * 1.5, roi: '+50%' }]);
                    }}
                    disabled={!investAmount || Number(investAmount) < investTarget.minInvestment}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 disabled:opacity-50"
                  >
                    Invest
                  </button>
            </div>
          </div>
        </div>
          )}
        </div>
      </main>
      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
        }
        .font-inter { font-family: 'Inter', 'Poppins', Arial, sans-serif; }
      `}</style>
    </>
  );
};

export default InvestorDashboard; 

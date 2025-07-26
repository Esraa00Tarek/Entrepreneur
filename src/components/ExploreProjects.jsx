import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Briefcase, MapPin, DollarSign, BarChart3, Eye, User, CheckCircle, Star } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const ExploreProjects = ({
  filters = {},
  setFilters = () => {},
  countries = [],
  cities = [],
}) => {
  const [filtersActive, setFiltersActive] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects from API on mount
  useEffect(() => {
    setLoading(true);
    setError(false);
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get('http://localhost:5000/api/businesses/all', { headers })
      .then(res => {
        const businesses = res.data.businesses ?? res.data.data ?? [];
        setProjects(businesses);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // NEW: Reset filtersActive if all filters are empty/default
  useEffect(() => {
    const isAllFiltersEmpty =
      (!filters.search || filters.search === '') &&
      (!filters.stage || filters.stage === '') &&
      (!filters.industry || filters.industry === '') &&
      (!filters.country || filters.country === '') &&
      (!filters.city || filters.city === '') &&
      (Array.isArray(filters.fundingNeeded) && filters.fundingNeeded[0] === 0 && filters.fundingNeeded[1] === 1000000) &&
      (Array.isArray(filters.fundingProgress) && filters.fundingProgress[0] === 0 && filters.fundingProgress[1] === 100);
    if (isAllFiltersEmpty && filtersActive) {
      setFiltersActive(false);
    }
  }, [filters, filtersActive]);

  // Filtering logic
  const filteredProjects = projects.filter(project => {
    const projectStage = (project.stage || '').toLowerCase();
    const filterStage = (filters.stage || '').toLowerCase();
    const matchesStage = !filterStage || projectStage === filterStage;
    const matchesIndustry = !filters.industry || project.industry === filters.industry;
    const matchesFunding = project.fundingNeeded >= filters.fundingNeeded[0] && project.fundingNeeded <= filters.fundingNeeded[1];
    const progress = Math.round((project.fundingRaised / project.fundingNeeded) * 100);
    const matchesProgress = progress >= filters.fundingProgress[0] && progress <= filters.fundingProgress[1];
    const matchesSearch = !filters.search || (project.name && project.name.toLowerCase().includes(filters.search.toLowerCase())) || (project.description && project.description.toLowerCase().includes(filters.search.toLowerCase()));
    let projectCountry = '';
    let projectCity = '';
    if (typeof project.location === 'object' && project.location !== null) {
      projectCountry = project.location.country || project.location.governorate || '';
      projectCity = project.location.city || '';
    } else if (typeof project.location === 'string') {
      projectCountry = project.location;
    }
    let matchesCountry = true;
    if (filters.country) {
      const filterCountry = filters.country.toLowerCase();
      matchesCountry = (projectCountry && projectCountry.toLowerCase().includes(filterCountry)) ||
                      (projectCountry && projectCountry.toLowerCase().includes(getCountryNameFromIso(filters.country).toLowerCase()));
    }
    let matchesCity = true;
    if (filters.city) {
      matchesCity = projectCity && projectCity.toLowerCase().includes(filters.city.toLowerCase());
    }
    return matchesStage && matchesIndustry && matchesFunding && matchesProgress && matchesSearch && matchesCountry && matchesCity;
  });

  // Sorting logic
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (filters.sort === 'newest') return b.id - a.id;
    if (filters.sort === 'mostFunded') return (b.fundingRaised / b.fundingNeeded) - (a.fundingRaised / a.fundingNeeded);
    if (filters.sort === 'lowestCapital') return a.fundingNeeded - b.fundingNeeded;
    return 0;
  });

  // Helper to shuffle an array
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Helper to get country name from isoCode
  function getCountryNameFromIso(isoCode) {
    const country = countries.find(c => c.isoCode === isoCode);
    return country ? country.name : '';
  }

  const projectsToShow = filtersActive ? sortedProjects : projects;

  return (
    <div className={filters.darkMode ? 'dark bg-[#1D3557] min-h-screen font-inter' : 'min-h-screen font-inter'}>
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 py-12 gap-12">
        {/* Main Content: Show projects first */}
        <section className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
            <h1 className="text-3xl font-extrabold text-[#1D3557] dark:text-white tracking-tight">Explore Projects</h1>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Search projects..." value={filters.search} onChange={e=>{ setFilters(f=>({...f,search:e.target.value})); setFiltersActive(true); }} className="rounded-xl border border-[#A8DADC] p-2 w-56 focus:ring-2 focus:ring-[#457B9D]" />
              <select className="rounded-xl border border-[#A8DADC] p-2 focus:ring-2 focus:ring-[#457B9D]" value={filters.sort} onChange={e=>{ setFilters(f=>({...f,sort:e.target.value})); setFiltersActive(true); }}>
                <option value="newest">Newest</option>
                <option value="mostFunded">Most Funded</option>
                <option value="lowestCapital">Lowest Capital Required</option>
              </select>
            </div>
          </div>
          {/* Projects Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
              <div className="text-lg text-[#457B9D] font-semibold mb-2">Loading projects...</div>
              <div className="text-sm text-[#A8DADC]">Please wait while we fetch the latest opportunities.</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
              <div className="text-lg text-[#457B9D] font-semibold mb-2">Error loading projects</div>
              <div className="text-sm text-[#A8DADC]">Failed to fetch projects. Please try again later.</div>
              <button
                className="mt-4 px-6 py-2 bg-[#457B9D] hover:bg-[#1D3557] text-white rounded-full font-semibold shadow transition-colors duration-200"
                onClick={() => {
                  setLoading(true);
                  setError(false);
                  const token = localStorage.getItem('token');
                  const headers = token ? { Authorization: `Bearer ${token}` } : {};
                  axios.get('http://localhost:5000/api/businesses/all', { headers })
                    .then(res => {
                      const businesses = res.data.businesses ?? res.data.data ?? [];
                      setProjects(businesses);
                      setLoading(false);
                    })
                    .catch(() => {
                      setError(true);
                      setLoading(false);
                    });
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
              {projectsToShow.map((project, idx) => {
                const fundingRaised = typeof project.fundingRaised === 'number' ? project.fundingRaised : 0;
                const fundingNeeded = typeof project.fundingNeeded === 'number' ? project.fundingNeeded : 1; // avoid division by zero
                const percentFunded = Math.round((fundingRaised / fundingNeeded) * 100);
                let locationString = '';
                if (typeof project.location === 'object' && project.location !== null) {
                  // If location is an object, join its values
                  locationString = Object.values(project.location).filter(Boolean).join(', ');
                } else if (typeof project.location === 'string') {
                  locationString = project.location;
                } else {
                  locationString = '';
                }
                return (
                  <div key={project.id + '-' + idx} className="bg-white dark:bg-[#22304A] rounded-3xl shadow-xl p-8 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border border-[#E6F0FA] relative animate-fade-in" style={{animationDelay: `${idx * 60}ms`}}>
                    {/* Logo & Name */}
                    <div className="flex items-center gap-4 mb-2">
                      <img src={project.logo ? project.logo : '/public/logo.png'} alt={project.name} className="w-14 h-14 rounded-2xl object-cover bg-[#E6F0FA] border border-[#A8DADC]" />
                      <div>
                        <div className="text-xl font-bold text-[#1D3557] dark:text-white leading-tight">{project.name}</div>
                        <span className="inline-block text-xs px-3 py-1 rounded-xl bg-[#A8DADC] text-[#1D3557] font-semibold mt-1 tracking-wide">{project.stage}</span>
                      </div>
                    </div>
                    {/* Description */}
                    <div className="text-sm text-[#22304A] dark:text-[#E6F0FA] mb-2 line-clamp-3 font-medium">{project.description}</div>
                    {/* Funding Progress */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#457B9D] font-semibold">${fundingRaised.toLocaleString()} raised</span>
                        <span className="text-[#A8DADC] font-semibold">of ${fundingNeeded.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-[#E6F0FA] rounded-full overflow-hidden">
                        <div className="h-3 rounded-full bg-gradient-to-r from-[#A8DADC] to-[#457B9D] transition-all duration-500" style={{width: `${percentFunded}%`}}></div>
                      </div>
                      <div className="text-xs text-[#1D3557] mt-1 font-semibold">{percentFunded}% funded</div>
                    </div>
                    {/* Location & Support */}
                    <div className="flex flex-wrap gap-2 items-center text-xs text-[#457B9D] mb-2">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{locationString}</span>
                    </div>
                    {/* CTA Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        className="flex-1 bg-[#457B9D] hover:bg-[#1D3557] text-white rounded-full py-1 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
                        onClick={() => { setSelectedProject(project); setShowProjectModal(true); }}
                      >
                        <Eye className="w-6 h-6" />View
                      </button>
                      <button
                        className="flex-1 bg-[#A8DADC] hover:bg-[#457B9D] text-[#1D3557] hover:text-white rounded-full py-1 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
                        onClick={() => alert('Connection request sent successfully!')}
                      >
                        <User className="w-6 h-6" />Contact
                      </button>
                      <button
                        className="flex-1 bg-[#F1C40F] hover:bg-[#FFD700] text-[#1D3557] rounded-full py-1 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
                        onClick={() => alert('Investment request sent to the entrepreneur successfully!')}
                      >
                        <DollarSign className="w-6 h-6" />Invest
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Modal for Project Details */}
          {showProjectModal && selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-[#22304A] rounded-3xl shadow-2xl p-10 w-full max-w-2xl relative border-2 border-[#A8DADC] animate-fade-in">
                <button onClick={()=>setShowProjectModal(false)} className="absolute top-6 right-6 text-[#457B9D] hover:text-[#1D3557] text-3xl bg-[#E6F0FA] rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all">&times;</button>
                <div className="flex items-center gap-6 mb-6">
                  <img src={selectedProject.logo ? selectedProject.logo : '/public/logo.png'} alt={selectedProject.name} className="w-20 h-20 rounded-2xl object-cover bg-[#E6F0FA] border border-[#A8DADC]" />
                  <div>
                    <div className="text-2xl font-bold text-[#1D3557] dark:text-white">{selectedProject.name}</div>
                    <div className="text-xs px-3 py-1 rounded-xl bg-[#A8DADC] text-[#1D3557] font-semibold inline-block mt-1">{selectedProject.stage}</div>
                    <div className="flex gap-2 mt-2">
                      {selectedProject.isVerified && <span className="flex items-center gap-1 bg-[#A8DADC] text-[#1D3557] text-xs px-2 py-1 rounded-xl font-semibold border border-[#457B9D]"><CheckCircle className="w-3 h-3" />Verified</span>}
                      {selectedProject.isTrending && <span className="flex items-center gap-1 bg-[#457B9D] text-white text-xs px-2 py-1 rounded-xl font-semibold border border-[#A8DADC]"><TrendingUp className="w-3 h-3" />Trending</span>}
                      {selectedProject.isFeatured && <span className="flex items-center gap-1 bg-[#F1C40F] text-[#1D3557] text-xs px-2 py-1 rounded-xl font-semibold border border-[#FFD700]"><Star className="w-3 h-3" />Featured</span>}
                    </div>
                  </div>
                </div>
                {/* Business Description */}
                <div className="mb-4">
                  <div className="font-semibold text-[#1D3557] dark:text-white mb-1">Description</div>
                  <div className="text-sm text-[#457B9D]">{selectedProject.description || 'Not provided'}</div>
                </div>
                {selectedProject.pitchDeck && (
                  <a href={selectedProject.pitchDeck} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 px-4 py-2 bg-[#A8DADC] text-[#1D3557] rounded-full font-semibold hover:bg-[#457B9D] hover:text-white transition-colors">View Pitch Deck</a>
                )}
              </div>
            </div>
          )}
        </section>
        {/* Filter Panel: Show after projects */}
        <aside className="w-full lg:w-80 bg-white/80 dark:bg-[#22304A]/80 rounded-3xl shadow-xl pt-8 pb-2 px-8 mb-8 lg:mb-0 flex-shrink-0 backdrop-blur-md border border-[#A8DADC] h-[650px]">
          {/* Stage Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-[#457B9D] mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" />Stage</label>
            <select className="w-full rounded-xl border border-[#A8DADC] p-2 focus:ring-2 focus:ring-[#457B9D]" value={filters.stage} onChange={e=>{ setFilters(f=>({...f,stage:e.target.value})); setFiltersActive(true); }}>
              <option value="">All</option>
              <option value="idea">Idea</option>
              <option value="mvp">MVP</option>
              <option value="launched">Launched</option>
            </select>
          </div>
          {/* Industry Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-[#457B9D] mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" />Industry</label>
            <select className="w-full rounded-xl border border-[#A8DADC] p-2 focus:ring-2 focus:ring-[#457B9D]" value={filters.industry} onChange={e=>{ setFilters(f=>({...f,industry:e.target.value})); setFiltersActive(true); }}>
              <option value="">All</option>
              <option value="Tech">Tech</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
            </select>
          </div>
          {/* Country Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Country</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
              <select
                className="w-full border border-[#A8DADC] rounded-lg px-3 py-3 pl-10 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent bg-white text-[#1D3557] placeholder-[#A8DADC] appearance-none"
                value={filters.country}
                onChange={e => { setFilters(f => ({ ...f, country: e.target.value })); setFiltersActive(true); }}
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* City Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-[#1D3557] mb-2">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
              <select
                className="w-full border border-[#A8DADC] rounded-lg px-3 py-3 pl-10 focus:ring-2 focus:ring-[#457B9D] focus:border-transparent bg-white text-[#1D3557] placeholder-[#A8DADC] appearance-none"
                value={filters.city}
                onChange={e => { setFilters(f => ({ ...f, city: e.target.value })); setFiltersActive(true); }}
                disabled={!filters.country}
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Funding Needed Slider */}
          <div>
            <label className="block text-sm font-semibold text-[#457B9D] mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" />Funding Needed ($)</label>
            <input type="range" min={0} max={1000000} step={10000} value={filters.fundingNeeded[1]} onChange={e=>{ setFilters(f=>({...f,fundingNeeded:[0,Number(e.target.value)]})); setFiltersActive(true); }} className="w-full accent-[#457B9D]" />
            <div className="text-xs text-[#1D3557]">Up to ${filters.fundingNeeded[1].toLocaleString()}</div>
          </div>
          {/* Funding Progress Slider */}
          <div>
            <label className="block text-sm font-semibold text-[#457B9D] mb-2 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Funding Progress (%)</label>
            <input type="range" min={0} max={100} step={5} value={filters.fundingProgress[1]} onChange={e=>{ setFilters(f=>({...f,fundingProgress:[0,Number(e.target.value)]})); setFiltersActive(true); }} className="w-full accent-[#A8DADC]" />
            <div className="text-xs text-[#1D3557]">Up to {filters.fundingProgress[1]}%</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ExploreProjects; 
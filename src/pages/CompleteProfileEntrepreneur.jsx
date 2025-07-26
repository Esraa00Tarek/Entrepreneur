import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Camera, User, MapPin, Phone, Building, Globe, Linkedin, CheckCircle, ArrowRight, Image, Upload } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import RegisterNavbar from "../components/RegisterNavbar";
import AnimatedMoneyBackground from "../components/animated-money-background";
import BasicInformation from '../components/BasicInformation';

export default function CompleteProfileEntrepreneur() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    phoneNumber: '',
    company: '',
    website: '',
    linkedin: '',
    businessStage: '',
    industry: '',
    businessDescription: '',
    fundingNeeded: '',
    teamSize: '',
    businessType: '',
    categories: [],
    supplierBusinessDescription: '',
    yearsInBusiness: '',
    investmentRange: '',
    preferredIndustries: [],
    investmentExperience: '',
    country: '',
    state: '',
    city: '',
    areaCode: '',
    profilePicture: null,
    idCardFront: null,
    idCardBack: null,
  });
  const [stageFiles, setStageFiles] = useState([]);
  const [stageFileError, setStageFileError] = useState('');
  const navigate = useNavigate();

  // Get countries, states, and cities from the package
  const countries = Country.getAllCountries();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country);
      setStates(countryStates);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    } else {
      setStates([]);
      setCities([]);
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const stateCities = City.getCitiesOfState(formData.country, formData.state);
      setCities(stateCities);
      setFormData(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [formData.country, formData.state]);

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleStageFilesChange = (e) => {
    setStageFileError('');
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    // Only allow up to 3 files
    if (files.length + stageFiles.length > 3) {
      setStageFileError('You can upload up to 3 files.');
      return;
    }
    // Only allow PDF, JPG, PNG
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        setStageFileError('Only PDF, JPG, and PNG files are allowed.');
        return;
      }
    }
    setStageFiles(prev => [...prev, ...files].slice(0, 3));
  };

  const handleRemoveStageFile = (idx) => {
    setStageFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    // Validate ID card upload for step 1
    if (currentStep === 1 && (!formData.idCardFront || !formData.idCardBack)) {
      alert("Please upload both sides of your ID card to proceed.");
      return;
    }

    if (
      currentStep === 2 &&
      formData.businessStage &&
      stageFiles.length === 0
    ) {
      setStageFileError('Please upload files to verify your business stage.');
      return;
    }
    setStageFileError('');
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/select-role');
    }
  };

  const handleGetStarted = () => {
    // Validate ID card upload before completing
    if (!formData.idCardFront || !formData.idCardBack) {
      alert("Please upload both sides of your ID card to complete your profile.");
      return;
    }
    // Navigate to entrepreneur dashboard
    navigate('/dashboard/entrepreneur');
  };

  const businessStageHints = {
    idea: {
      label: 'Upload Idea Document',
      hint: 'Upload a document describing your idea or a mind map (PDF, JPG, PNG, up to 3 files).',
    },
    mvp: {
      label: 'Upload MVP/Prototype Evidence',
      hint: 'Upload screenshots, prototype links, or early UI (PDF, JPG, PNG, up to 3 files).',
    },
    startup: {
      label: 'Upload Early Stage Proof',
      hint: 'Upload product demo link, registration doc, or early user feedback (PDF, JPG, PNG, up to 3 files).',
    },
    growth: {
      label: 'Upload Growth Evidence',
      hint: 'Upload revenue reports, KPI charts, or investor deck (PDF, JPG, PNG, up to 3 files).',
    },
    established: {
      label: 'Upload Business Verification',
      hint: 'Upload tax records, financial reports, or business license (PDF, JPG, PNG, up to 3 files).',
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F1FAEE] via-[#A8DADC] to-[#457B9D]">
      <AnimatedMoneyBackground />
      
      <RegisterNavbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1D3557] mb-2">
            Complete Your Elevante Profile
          </h1>
          <p className="text-base text-[#457B9D] mb-1">
            Welcome to Elevante!
          </p>
          <p className="text-sm text-[#457B9D]">
            Setting Up Your Entrepreneur Profile
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-8">
            <div className="flex items-center group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 transform group-hover:scale-110 ${
                currentStep >= 1 ? 'bg-gradient-to-br from-[#1D3557] to-[#457B9D] text-white shadow-lg' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`ml-4 w-24 h-1 transition-all duration-500 ${
                currentStep > 1 ? 'bg-gradient-to-r from-[#1D3557] to-[#457B9D]' : 'bg-gray-300'
              }`}></div>
            </div>
            <div className="flex items-center group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 transform group-hover:scale-110 ${
                currentStep >= 2 ? 'bg-gradient-to-br from-[#1D3557] to-[#457B9D] text-white shadow-lg' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`ml-4 w-24 h-1 transition-all duration-500 ${
                currentStep > 2 ? 'bg-gradient-to-r from-[#1D3557] to-[#457B9D]' : 'bg-gray-300'
              }`}></div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500 transform hover:scale-110 ${
              currentStep >= 3 ? 'bg-gradient-to-br from-[#1D3557] to-[#457B9D] text-white shadow-lg' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-[#457B9D] font-medium">Step {currentStep} of 3</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-0 p-8">
          {currentStep === 1 && (
            <BasicInformation 
              formData={formData}
              handleInputChange={handleInputChange}
              handleFileUpload={handleFileUpload}
            />
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-[#1D3557] mb-2">Entrepreneur Details</h2>
              <p className="text-[#457B9D] mb-8">Provide entrepreneur-specific information</p>
              <div className="space-y-6">
                <div>
                  <label htmlFor="businessStage" className="block text-sm font-medium text-[#1D3557] mb-2">
                    Business Stage *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                    <select
                      id="businessStage"
                      value={formData.businessStage}
                      onChange={(e) => {
                        handleInputChange('businessStage', e.target.value);
                        setStageFiles([]); // Reset files on stage change
                        setStageFileError('');
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none"
                    >
                      <option value="">Select business stage</option>
                      <option value="idea">Idea Stage</option>
                      <option value="mvp">MVP/Prototype</option>
                      <option value="startup">Early Stage Startup</option>
                      <option value="growth">Growth Stage</option>
                      <option value="established">Established Business</option>
                    </select>
                  </div>
                </div>
                {/* Dynamic File Upload Section */}
                {formData.businessStage && businessStageHints[formData.businessStage] && (
                  <div>
                    <label className="block text-sm font-medium text-[#1D3557] mb-1">
                      {businessStageHints[formData.businessStage].label} *
                    </label>
                    <p className="text-xs text-[#457B9D] mb-2">{businessStageHints[formData.businessStage].hint}</p>
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      multiple
                      onChange={handleStageFilesChange}
                      disabled={stageFiles.length >= 3}
                    />
                    {stageFileError && <div className="text-red-600 text-sm mt-1">{stageFileError}</div>}
                    {stageFiles.length > 0 && (
                      <ul className="mt-2 text-sm text-[#457B9D]">
                        {stageFiles.map((file, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span>{file.name}</span>
                            <button type="button" onClick={() => handleRemoveStageFile(idx)} className="text-xs text-[#1D3557] underline">Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-[#1D3557] mb-2">
                    Industry *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                    <select
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none"
                    >
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="education">Education</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="businessDescription" className="block text-sm font-medium text-[#1D3557] mb-2">
                    Business Idea/Description
                  </label>
                  <textarea
                    id="businessDescription"
                    value={formData.businessDescription}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    placeholder="Describe your business idea, problem you're solving, and target market..."
                    rows={5}
                    className="w-full px-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="fundingNeeded" className="block text-sm font-medium text-[#1D3557] mb-2">
                    Funding Needed
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#457B9D]">$</span>
                    <select
                      id="fundingNeeded"
                      value={formData.fundingNeeded}
                      onChange={(e) => handleInputChange('fundingNeeded', e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none"
                    >
                      <option value="">Select funding range</option>
                      <option value="0-10k">$0 - $10,000</option>
                      <option value="10k-50k">$10,000 - $50,000</option>
                      <option value="50k-100k">$50,000 - $100,000</option>
                      <option value="100k-500k">$100,000 - $500,000</option>
                      <option value="500k-1m">$500,000 - $1,000,000</option>
                      <option value="1m+">$1,000,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="teamSize" className="block text-sm font-medium text-[#1D3557] mb-2">
                    Team Size
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                    <input
                      type="number"
                      id="teamSize"
                      value={formData.teamSize}
                      onChange={(e) => handleInputChange('teamSize', e.target.value)}
                      placeholder="3"
                      className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white border border-blue-200 rounded-xl p-8 shadow-sm max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Review & Complete</h2>
              <p className="text-[#457B9D] mb-6">Please review your information before completing your profile</p>
              <div className="bg-gray-50 rounded-lg flex items-center p-4 mb-8">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <div className="font-bold text-lg text-[#1D3557]">{formData.fullName || '—'}</div>
                  <div className="text-[#457B9D] text-sm">Entrepreneur</div>
                  <div className="text-[#457B9D] text-sm">
                    {formData.country && countries.find(c => c.isoCode === formData.country)?.name}
                    {formData.state && states.find(s => s.isoCode === formData.state) && `, ${states.find(s => s.isoCode === formData.state).name}`}
                    {formData.city && `, ${formData.city}`}
                    {!formData.country && !formData.state && !formData.city && '—'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-[#1D3557] mb-2">Contact Information</h4>
                  <div className="text-[#457B9D] text-sm mb-1">Email: —</div>
                  <div className="text-[#457B9D] text-sm mb-1">Phone: {formData.areaCode && formData.phoneNumber ? `${formData.areaCode} ${formData.phoneNumber}` : formData.phoneNumber || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Website: {formData.website || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">LinkedIn: {formData.linkedin || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Location: {
                    formData.country && countries.find(c => c.isoCode === formData.country)?.name
                      ? `${countries.find(c => c.isoCode === formData.country).name}${formData.state && states.find(s => s.isoCode === formData.state) ? `, ${states.find(s => s.isoCode === formData.state).name}` : ''}${formData.city ? `, ${formData.city}` : ''}`
                      : '—'
                  }</div>
                  <div className="text-[#457B9D] text-sm mb-1">Bio</div>
                  <div className="text-[#457B9D] text-sm mb-1">{formData.bio || '—'}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1D3557] mb-2">Business Information</h4>
                  <div className="text-[#457B9D] text-sm mb-1">Business Stage: {formData.businessStage || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Industry: {formData.industry || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Description</div>
                  <div className="text-[#457B9D] text-sm mb-1">{formData.businessDescription || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Funding Needed: {formData.fundingNeeded || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Team Size: {formData.teamSize || '—'}</div>
                </div>
              </div>
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={handleBack} 
                  className="group px-6 py-3 border border-[#A8DADC] rounded-lg text-[#1D3557] hover:bg-gradient-to-r hover:from-[#A8DADC] hover:to-[#457B9D] hover:text-white transition-all duration-500 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                >
                  <span>Back</span>
                </button>
                <button 
                  onClick={handleGetStarted} 
                  disabled={!formData.idCardFront || !formData.idCardBack}
                  className={`group px-6 py-3 text-white rounded-lg transition-all duration-500 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2 ${
                    formData.idCardFront && formData.idCardBack 
                      ? 'bg-gradient-to-r from-[#1D3557] to-[#457B9D] hover:from-[#457B9D] hover:to-[#1D3557]' 
                      : 'bg-gray-400 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>Complete Profile</span>
                  <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>
            </div>
          )}

          {/* Form Navigation */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                className="group px-6 py-3 border border-[#A8DADC] rounded-lg text-[#1D3557] hover:bg-gradient-to-r hover:from-[#A8DADC] hover:to-[#457B9D] hover:text-white transition-all duration-500 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
              >
                <span>Back</span>
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.idCardFront || !formData.idCardBack}
                className={`group px-6 py-3 text-white rounded-lg transition-all duration-500 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2 ${
                  formData.idCardFront && formData.idCardBack 
                    ? 'bg-gradient-to-r from-[#1D3557] to-[#457B9D] hover:from-[#457B9D] hover:to-[#1D3557]' 
                    : 'bg-gray-400 opacity-50 cursor-not-allowed'
                }`}
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
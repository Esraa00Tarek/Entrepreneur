import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, MapPin, Phone, Building, Globe, Linkedin, DollarSign, CheckCircle, ArrowRight, Image, Upload } from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import RegisterNavbar from '../components/RegisterNavbar';
import AnimatedMoneyBackground from '../components/animated-money-background';
import BasicInformation from '../components/BasicInformation';

export default function CompleteProfileInvestor() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    phoneNumber: '',
    company: '',
    website: '',
    linkedin: '',
    investmentExperience: '',
    preferredIndustries: [],
    investmentRange: '',
    yearsInBusiness: '',
    businessType: '',
    categories: [],
    supplierBusinessDescription: '',
    businessStage: '',
    industry: '',
    businessDescription: '',
    fundingNeeded: '',
    teamSize: '',
    country: '',
    state: '',
    city: '',
    areaCode: '',
    profilePicture: null,
    idCardFront: null,
    idCardBack: null,
  });
  const navigate = useNavigate();

  // Get countries, states, and cities from the package
  const countries = Country.getAllCountries();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
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

  const handleNext = () => {
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
    // Navigate to investor dashboard
    navigate('/dashboard/investor');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: `${formData.fullName}`,
        email: "rania@gmail.com",
        password: "Pass123456",
        role: "Investor"
      };
      const user = await register(data);
      // توجيه المستخدم للداشبورد المناسب حسب الدور
      if (user.role === 'Entrepreneur') {
        navigate('/dashboard/entrepreneur');
      } else if (user.role === 'Investor') {
        navigate('/dashboard/investor');
      } else if (user.role === 'Supplier') {
        navigate('/dashboard/supplier');
      }
    } catch (err) {
      setError('حدث خطأ أثناء التسجيل');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F1FAEE] via-[#A8DADC] to-[#457B9D]">
      <AnimatedMoneyBackground />
      
      <RegisterNavbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1D3557] mb-2">
            Complete Your Elevante Profile
          </h1>
          <p className="text-base text-[#457B9D] mb-1">
            Welcome to Elevante!
          </p>
          <p className="text-sm text-[#457B9D]">
            Setting Up Your Investor Profile
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-slate-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`ml-4 w-24 h-1 ${currentStep > 1 ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-slate-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`ml-4 w-24 h-1 ${currentStep > 2 ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-slate-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-[#457B9D]">Step {currentStep} of 3</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-0 p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-[#1D3557] mb-2">Basic Information</h2>
              <p className="text-[#457B9D] mb-8">Tell us about yourself</p>

              <BasicInformation 
                formData={formData} 
                handleInputChange={handleInputChange} 
                handleFileUpload={handleFileUpload} 
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Investor Details</h2>
              <p className="text-gray-600 mb-8">Provide investor-specific information</p>
              <div className="space-y-6">
                {/* Investment Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Range *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.investmentRange || ''}
                      onChange={e => handleInputChange('investmentRange', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Select range</option>
                      <option value="$1K-$10K">$1K - $10K</option>
                      <option value="$10K-$50K">$10K - $50K</option>
                      <option value="$50K-$100K">$50K - $100K</option>
                      <option value="$100K-$500K">$100K - $500K</option>
                      <option value="$500K+">$500K+</option>
                    </select>
                  </div>
                </div>
                {/* Preferred Industries */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Industries *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Technology','Healthcare','Finance','E-commerce','Real Estate','Manufacturing','Education','Energy'].map(ind => (
                      <button
                        type="button"
                        key={ind}
                        onClick={() => {
                          const prev = formData.preferredIndustries || [];
                          handleInputChange('preferredIndustries', prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]);
                        }}
                        className={`border rounded-full px-6 py-2 font-medium transition-colors ${formData.preferredIndustries && formData.preferredIndustries.includes(ind) ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-900 text-blue-900 bg-white hover:bg-blue-50'}`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Investment Experience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Investment Experience</label>
                  <textarea
                    value={formData.investmentExperience || ''}
                    onChange={e => handleInputChange('investmentExperience', e.target.value)}
                    placeholder="Describe your investment experience and portfolio..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white border border-blue-200 rounded-xl p-8 shadow-sm max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Complete</h2>
              <p className="text-gray-600 mb-6">Please review your information before completing your profile</p>
              <div className="bg-gray-50 rounded-lg flex items-center p-4 mb-8">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-900">{formData.fullName || '—'}</div>
                  <div className="text-gray-600 text-sm">Investor</div>
                  <div className="text-gray-500 text-sm">
                    {formData.country && countries.find(c => c.isoCode === formData.country)?.name}
                    {formData.state && states.find(s => s.isoCode === formData.state) && `, ${states.find(s => s.isoCode === formData.state).name}`}
                    {formData.city && `, ${formData.city}`}
                    {!formData.country && !formData.state && !formData.city && '—'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="text-gray-700 text-sm mb-1">Email: —</div>
                  <div className="text-gray-700 text-sm mb-1">Phone: {formData.areaCode && formData.phoneNumber ? `${formData.areaCode} ${formData.phoneNumber}` : formData.phoneNumber || '—'}</div>
                  <div className="text-gray-700 text-sm mb-1">Location: {
                    formData.country && countries.find(c => c.isoCode === formData.country)?.name
                      ? `${countries.find(c => c.isoCode === formData.country).name}${formData.state && states.find(s => s.isoCode === formData.state) ? `, ${states.find(s => s.isoCode === formData.state).name}` : ''}${formData.city ? `, ${formData.city}` : ''}`
                      : '—'
                  }</div>
                  <div className="text-gray-700 text-sm mb-1">Bio</div>
                  <div className="text-gray-500 text-sm mb-1">{formData.bio || '—'}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Investment Information</h4>
                  <div className="text-gray-700 text-sm mb-1">Investment Range: {formData.investmentRange || '—'}</div>
                  <div className="text-gray-700 text-sm mb-1">Preferred Industries: {(formData.preferredIndustries && formData.preferredIndustries.length > 0) ? formData.preferredIndustries.join(', ') : '—'}</div>
                  <div className="text-gray-700 text-sm mb-1">Experience</div>
                  <div className="text-gray-500 text-sm mb-1">{formData.investmentExperience || '—'}</div>
                </div>
              </div>
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button onClick={handleBack} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200">Back</button>
                <button onClick={handleGetStarted} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors duration-200">Complete Profile</button>
              </div>
            </div>
          )}

          {/* Form Navigation */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors duration-200"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, MapPin, Phone, Building, Globe, Linkedin, Package, Truck, CheckCircle, ArrowRight, Image, Upload } from 'lucide-react';
import AnimatedMoneyBackground from "../components/animated-money-background";
import RegisterNavbar from "../components/RegisterNavbar";
import { Country, State, City } from 'country-state-city';
import BasicInformation from '../components/BasicInformation';

export default function CompleteProfileSupplier() {
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
    // Navigate to supplier dashboard
    navigate('/dashboard/supplier');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F1FAEE] via-[#A8DADC] to-[#457B9D]">
      <AnimatedMoneyBackground />
      
      <RegisterNavbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1D3557] mb-2">
            Complete Your Elevante Profile
          </h1>
          <p className="text-base text-[#457B9D] mb-1">
            Welcome to Elevante!
          </p>
          <p className="text-sm text-[#457B9D]">
            Setting Up Your Supplier Profile
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

              <BasicInformation formData={formData} handleInputChange={handleInputChange} handleFileUpload={handleFileUpload} />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-[#1D3557] mb-2">Supplier Details</h2>
              <p className="text-[#457B9D] mb-8">Provide supplier-specific information</p>

              <div className="space-y-6">
                {/* Business Type */}
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-[#1D3557] mb-2">
                    Business Type *
                  </label>
                  <select
                    id="businessType"
                    value={formData.businessType || ''}
                    onChange={e => handleInputChange('businessType', e.target.value)}
                    className="w-full px-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    <option value="manufacturer">Manufacturer</option>
                    <option value="distributor">Distributor</option>
                    <option value="service">Service Provider</option>
                    <option value="retailer">Retailer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Product/Service Categories */}
                <div>
                  <label className="block text-sm font-medium text-[#1D3557] mb-2">
                    Product/Service Categories *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Electronics', 'Clothing', 'Food & Beverage', 'Industrial', 'Software', 'Consulting', 'Marketing', 'Logistics'].map(category => (
                      <button
                        type="button"
                        key={category}
                        onClick={() => {
                          const prev = formData.categories || [];
                          handleInputChange('categories', prev.includes(category)
                            ? prev.filter((c) => c !== category)
                            : [...prev, category]
                          );
                        }}
                        className={`border-2 rounded-full px-6 py-2 font-semibold text-base transition-colors duration-150 ${
                          (formData.categories || []).includes(category)
                            ? 'border-[#1D3557] bg-blue-50 text-[#1D3557]'
                            : 'border-[#1D3557] bg-white text-[#1D3557] hover:bg-blue-50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Business Description */}
                <div>
                  <label htmlFor="supplierBusinessDescription" className="block text-sm font-medium text-[#1D3557] mb-2">
                    Business Description
                  </label>
                  <textarea
                    id="supplierBusinessDescription"
                    value={formData.supplierBusinessDescription || ''}
                    onChange={e => handleInputChange('supplierBusinessDescription', e.target.value)}
                    placeholder="Describe your products/services and target market..."
                    rows={4}
                    className="w-full px-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                  />
                </div>

                {/* Years in Business */}
                <div>
                  <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-[#1D3557] mb-2">
                    Years in Business
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#457B9D]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </span>
                    <input
                      type="number"
                      id="yearsInBusiness"
                      value={formData.yearsInBusiness || ''}
                      onChange={e => handleInputChange('yearsInBusiness', e.target.value)}
                      placeholder="5"
                      className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Review & Complete</h2>
              <p className="text-[#457B9D] mb-6">Please review your information before completing your profile</p>
              <div className="bg-gray-50 rounded-lg flex items-center p-4 mb-8">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z' /></svg>
                </div>
                <div>
                  <div className="font-bold text-lg text-[#1D3557]">{formData.fullName || '—'}</div>
                  <div className="text-[#457B9D] text-sm">Supplier</div>
                  <div className="text-[#457B9D] text-sm">{formData.location || '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-[#1D3557] mb-2">Contact Information</h4>
                  <div className="text-[#457B9D] text-sm mb-1">Email: —</div>
                  <div className="text-[#457B9D] text-sm mb-1">Phone: {formData.phoneNumber || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Bio</div>
                  <div className="text-[#457B9D] text-sm mb-1">{formData.bio || '—'}</div>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1D3557] mb-2">Supplier Information</h4>
                  <div className="text-[#457B9D] text-sm mb-1">Business Type: {formData.businessType || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Categories: {(formData.categories && formData.categories.length > 0) ? formData.categories.join(', ') : '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Description</div>
                  <div className="text-[#457B9D] text-sm mb-1">{formData.supplierBusinessDescription || '—'}</div>
                  <div className="text-[#457B9D] text-sm mb-1">Years in Business: {formData.yearsInBusiness || '—'}</div>
                </div>
              </div>
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors duration-200"
                >
                  Complete Profile
                </button>
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
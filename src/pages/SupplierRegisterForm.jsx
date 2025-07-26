import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterNavbar from "../components/RegisterNavbar";
import AnimatedMoneyBackground from "../components/animated-money-background";
import { Country, State, City } from 'country-state-city';
// import { registerSupplier } from "../services/supplier";
import { MapPin } from 'lucide-react';
import axios from "axios"


export default function SupplierRegisterForm({ oldData = {}, feedback = {}, rejected = false }) {
  const initialState = rejected ? {
    fullName: oldData.fullName || '',
    email: oldData.email || '',
    phone: oldData.phone || '',
    country: oldData.country || '',
    city: oldData.city || '',
    supplierType: oldData.supplierType || '',
    serviceField: oldData.serviceField || '',
    portfolio: oldData.portfolio || '',
    companyProfile: null,
    idCardFront: null,
    idCardBack: null,
    password: '',
    confirmPassword: '',
    username: '',
  } : {
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    supplierType: '',
    serviceField: '',
    portfolio: '',
    companyProfile: null,
    idCardFront: null,
    idCardBack: null,
    password: '',
    confirmPassword: '',
    username: '',
  };
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [countries] = useState(Country.getAllCountries());
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
    if (form.country) {
      setStates(State.getStatesOfCountry(form.country));
      setCities([]);
      setForm(prev => ({ ...prev, state: '', city: '' }));
    } else {
      setStates([]);
      setCities([]);
    }
  }, [form.country]);
  useEffect(() => {
    if (form.country && form.state) {
      setCities(City.getCitiesOfState(form.country, form.state));
      setForm(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [form.country, form.state]);

  useEffect(() => {
    if (rejected) {
      setForm(initialState);
    }
    // eslint-disable-next-line
  }, [rejected, oldData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'idCardFront' || name === 'idCardBack' || name === 'companyProfile') {
      setForm({ ...form, [name]: files[0] });
    } else if (name === 'username') {
      let val = value.startsWith('@') ? value : '@' + value.replace(/^@+/, '');
      setForm({ ...form, username: val });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = 'Full Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    
    if (!form.username || form.username.length < 3) newErrors.username = 'Username is required and must be at least 3 characters';
    else if (!/^@[A-Za-z0-9_]+$/.test(form.username)) newErrors.username = 'Username must start with @ and contain only letters, numbers, and underscores';
    if (!form.phone) newErrors.phone = 'Phone is required';
    if (!form.country) newErrors.country = 'Country is required';
    if (!form.city) newErrors.city = 'City is required';
    if (!form.supplierType) newErrors.supplierType = 'Supplier Type is required';
    if (!form.serviceField) newErrors.serviceField = 'Service Field is required';
    if (!form.companyProfile && !form.portfolio) newErrors.companyProfile = 'You must upload a company profile/brochure or provide a portfolio/website link';
    if (!form.idCardFront) newErrors.idCardFront = 'ID card front image is required';
    if (!form.idCardBack) newErrors.idCardBack = 'ID card back image is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("username", form.username);
      formData.append("phone", form.phone);
      formData.append("country", form.country);
      formData.append("city", form.city);
      formData.append("idCardFront", form.idCardFront);
      formData.append("idCardBack", form.idCardBack);
      formData.append("password", form.password);
      formData.append("confirmPassword", form.confirmPassword);
      formData.append("role", "supplier");
      formData.append("supplierType", form.supplierType);
      formData.append("serviceField", form.serviceField);
      if (form.portfolio) formData.append("portfolioLink", form.portfolio);
      if (form.companyProfile) formData.append("companyProfile", form.companyProfile);
      await axios.post(
        "https://backendelevante-production.up.railway.app/api/users/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      navigate("/pending-approval");
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.response && error.response.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F1FAEE] via-[#A8DADC] to-[#457B9D]">
      <AnimatedMoneyBackground />
      <RegisterNavbar />
      <main className="flex items-center justify-center min-h-screen px-2 py-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 md:p-12 relative z-10">
          <h1 className="text-2xl font-bold text-[#1D3557] mb-6 text-center">Supplier Registration</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Full Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-[#1D3557] mb-1">Full Name *</label>
                <input type="text" name="fullName" value={form.fullName || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block font-medium text-[#1D3557] mb-1">Email *</label>
                <input type="email" name="email" value={form.email || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            {/* 2. Username */}
            <div>
              <label className="block font-medium text-[#1D3557] mb-1">Username *</label>
              <input type="text" name="username" value={form.username || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required placeholder="@yourname" />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
            {/* 3. Phone & Supplier Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-[#1D3557] mb-1">Phone *</label>
                <input type="text" name="phone" value={form.phone || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block font-medium text-[#1D3557] mb-1">Supplier Type *</label>
                <select name="supplierType" value={form.supplierType || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required>
                  <option value="">Select type</option>
                  <option value="individual">Services</option>
                  <option value="company">Products</option>
                  <option value="both">Both</option>
                </select>
                {errors.supplierType && <p className="text-red-500 text-sm mt-1">{errors.supplierType}</p>}
              </div>
            </div>
            {/* Service Field & Portfolio */}
            <div>
              <label className="block font-medium text-[#1D3557] mb-1">Service Field *</label>
              <input type="text" name="serviceField" value={form.serviceField || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required placeholder="e.g. legal, marketing, logistics..." />
              {errors.serviceField && <p className="text-red-500 text-sm mt-1">{errors.serviceField}</p>}
            </div>
            <div>
              <label className="block font-medium text-[#1D3557] mb-1">Portfolio or Website (optional)</label>
              <input type="url" name="portfolio" value={form.portfolio || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" placeholder="https://yourportfolio.com" />
            </div>
            {/* 4. LinkedIn */}
            <div>
              <label className="block font-medium text-[#1D3557] mb-1">LinkedIn</label>
              <input type="url" name="linkedin" value={form.linkedin || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" placeholder="https://linkedin.com/in/yourprofile" />
              {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>}
            </div>
            {/* 5. Website */}
            <div>
              <label className="block font-medium text-[#1D3557] mb-1">Website</label>
              <input type="url" name="website" value={form.website || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" placeholder="https://yourwebsite.com" />
              {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
            </div>
            {/* 6. Geographical Location (card) */}
            <div className="bg-gray-50 border rounded-lg p-6 mb-2">
              <h3 className="font-semibold text-[#1D3557] mb-4">Geographical Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-[#1D3557] mb-2">Country *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                    <select name="country" value={form.country || ""} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557]">
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-[#1D3557] mb-2">State/Province</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                    <select name="state" value={form.state || ""} onChange={handleChange} disabled={!form.country} className={`w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557] ${!form.country ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                      <option value="">Select State/Province</option>
                      {states.map(state => (
                        <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-medium text-[#1D3557] mb-2">City *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                    <select name="city" value={form.city || ""} onChange={handleChange} disabled={!form.state} className={`w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557] ${!form.state ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                      <option value="">Select City</option>
                      {cities.map(city => (
                        <option key={city.name} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
              </div>
            </div>
            {/* 7. ID Card Upload (card) */}
            <div className="bg-gray-50 border rounded-lg p-6 mb-2">
              <h3 className="font-semibold text-[#1D3557] mb-4">ID Card Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium text-[#1D3557] mb-1">ID Card Image (Front) *</label>
                  <input type="file" name="idCardFront" onChange={handleChange} className="w-full" />
                  {errors.idCardFront && <p className="text-red-500 text-sm mt-1">{errors.idCardFront}</p>}
                </div>
                <div>
                  <label className="block font-medium text-[#1D3557] mb-1">ID Card Image (Back) *</label>
                  <input type="file" name="idCardBack" onChange={handleChange} className="w-full" />
                  {errors.idCardBack && <p className="text-red-500 text-sm mt-1">{errors.idCardBack}</p>}
                </div>
              </div>
            </div>
            {/* 8. Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-[#1D3557] mb-1">Password *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={form.password || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] hover:text-[#1D3557]">
                    {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.875 19.875L4.125 4.125" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.67 1.664-1.175 2.4" /></svg>}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block font-medium text-[#1D3557] mb-1">Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={form.confirmPassword || ""} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 pr-10" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] hover:text-[#1D3557]">
                    {showConfirmPassword ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.875 19.875L4.125 4.125" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.857-.67 1.664-1.175 2.4" /></svg>}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            {/* 9. Submit button */}
            <button type="submit" disabled={submitting} className="w-full bg-[#1D3557] text-white py-3 rounded-lg font-semibold mt-4 hover:bg-[#457B9D] transition">
              {submitting ? 'Submitting...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 
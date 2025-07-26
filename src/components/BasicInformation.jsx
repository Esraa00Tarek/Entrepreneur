import React from 'react';
import { Camera, User, MapPin, Phone, Building, Globe, Linkedin, Image, Upload } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

export default function BasicInformation({ formData, handleInputChange, handleFileUpload }) {
  // Get countries, states, and cities
  const countries = Country.getAllCountries();
  const states = formData.country ? State.getStatesOfCountry(formData.country) : [];
  const cities = formData.state ? City.getCitiesOfState(formData.country, formData.state) : [];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[#1D3557] mb-2">Basic Information</h2>
        <p className="text-[#457B9D] mb-8">Tell us about yourself</p>

        {/* Profile Picture Upload */}
        <div className="flex justify-center mb-8">
          <div className="group">
            <label className="block text-sm font-medium text-[#1D3557] mb-4 group-hover:text-[#457B9D] transition-colors duration-300">
              Profile Picture
            </label>
            <div className="relative">
              <div className="flex items-center justify-center w-32 h-32 mx-auto bg-gradient-to-br from-[#A8DADC] to-[#457B9D] rounded-full transform group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl">
                {formData.profilePicture ? (
                  <img 
                    src={URL.createObjectURL(formData.profilePicture)} 
                    alt="Profile Preview" 
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <Image className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload('profilePicture', e.target.files[0])}
                className="hidden"
                id="profilePicture"
              />
              <label 
                htmlFor="profilePicture"
                className="mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white rounded-lg hover:from-[#457B9D] hover:to-[#1D3557] transition-all duration-500 transform hover:scale-105 hover:shadow-lg cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Photo</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="group">
          <label htmlFor="bio" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
            Bio *
          </label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself and your background..."
            rows={4}
            className="w-full px-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557] resize-none"
          />
        </div>

        {/* Country, State, City in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Country */}
          <div className="group">
            <label htmlFor="country" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
              Country *
            </label>
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D] group-hover:scale-110 transition-transform duration-300" />
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557]"
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.isoCode} value={country.isoCode}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* State */}
          <div className="group">
            <label htmlFor="state" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
              State/Province
            </label>
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D] group-hover:scale-110 transition-transform duration-300" />
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                disabled={!formData.country}
                className={`w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557] ${!formData.country ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Select State/Province</option>
                {states.map(state => (
                  <option key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* City */}
          <div className="group">
            <label htmlFor="city" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
              City *
            </label>
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D] group-hover:scale-110 transition-transform duration-300" />
              <select
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                disabled={!formData.state}
                className={`w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557] ${!formData.state ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Area Code + Phone Number in one row */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          <div className="group col-span-1">
            <label htmlFor="areaCode" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
              Area Code *
            </label>
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <select
                id="areaCode"
                value={formData.areaCode}
                onChange={(e) => handleInputChange('areaCode', e.target.value)}
                className="w-full px-2 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent appearance-none text-center text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557] bg-white"
              >
                <option value="">Code</option>
                {formData.country && countries.find(c => c.isoCode === formData.country) && (
                  <option value={countries.find(c => c.isoCode === formData.country).phonecode}>
                    +{countries.find(c => c.isoCode === formData.country).phonecode} ({countries.find(c => c.isoCode === formData.country).name})
                  </option>
                )}
                {countries.map(country => (
                  <option key={country.isoCode} value={country.phonecode}>
                    +{country.phonecode} ({country.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="group col-span-2 md:col-span-5">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
              Phone Number *
            </label>
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D] group-hover:scale-110 transition-transform duration-300" />
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="Enter your phone number"
                className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557]"
              />
            </div>
          </div>
        </div>

        {/* Company Name in a row alone */}
        <div className="group">
          <label htmlFor="company" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
            Company Name
          </label>
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D] group-hover:scale-110 transition-transform duration-300" />
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Enter your company name"
              className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557]"
            />
          </div>
        </div>

        {/* Website in a row alone */}
        <div className="group">
          <label htmlFor="website" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
            Website
          </label>
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D] group-hover:scale-110 transition-transform duration-300" />
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557]"
            />
          </div>
        </div>

        {/* LinkedIn Profile in a row alone */}
        <div className="group">
          <label htmlFor="linkedin" className="block text-sm font-medium text-[#1D3557] mb-2 group-hover:text-[#457B9D] transition-colors duration-300">
            LinkedIn Profile
          </label>
          <div className="relative transform hover:scale-105 transition-transform duration-300">
            <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D] group-hover:scale-110 transition-transform duration-300" />
            <input
              type="url"
              id="linkedin"
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full pl-10 pr-4 py-3 border border-[#A8DADC] rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md hover:border-[#1D3557]"
            />
          </div>
        </div>

        {/* ID Card Upload Section - Moved to the end */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* ID Card Front Upload */}
          <div className="group">
            <label className="block text-sm font-medium text-[#1D3557] mb-4 group-hover:text-[#457B9D] transition-colors duration-300">
              ID Card Front <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center justify-center w-full h-32 mx-auto bg-gradient-to-br from-[#F1FAEE] to-[#A8DADC] rounded-lg border-2 border-dashed border-[#457B9D] transform group-hover:scale-105 transition-all duration-500 shadow-sm group-hover:shadow-md">
                {formData.idCardFront ? (
                  <img src={URL.createObjectURL(formData.idCardFront)} alt="ID Card Front Preview" className="w-28 h-28 object-contain rounded" />
                ) : (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-[#457B9D] mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <p className="text-sm text-[#1D3557] font-medium">Upload ID Card Front</p>
                    <p className="text-xs text-[#457B9D]">PNG only, up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/png"
                onChange={e => handleFileUpload('idCardFront', e.target.files[0])}
                className="hidden"
                id="idCardFront"
                required
              />
              <label htmlFor="idCardFront" className="mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white rounded-lg hover:from-[#457B9D] hover:to-[#1D3557] transition-all duration-500 transform hover:scale-105 hover:shadow-lg cursor-pointer">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Front</span>
              </label>
            </div>
          </div>
          {/* ID Card Back Upload */}
          <div className="group">
            <label className="block text-sm font-medium text-[#1D3557] mb-4 group-hover:text-[#457B9D] transition-colors duration-300">
              ID Card Back <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center justify-center w-full h-32 mx-auto bg-gradient-to-br from-[#F1FAEE] to-[#A8DADC] rounded-lg border-2 border-dashed border-[#457B9D] transform group-hover:scale-105 transition-all duration-500 shadow-sm group-hover:shadow-md">
                {formData.idCardBack ? (
                  <img src={URL.createObjectURL(formData.idCardBack)} alt="ID Card Back Preview" className="w-28 h-28 object-contain rounded" />
                ) : (
                  <div className="text-center">
                    <Image className="w-8 h-8 text-[#457B9D] mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <p className="text-sm text-[#1D3557] font-medium">Upload ID Card Back</p>
                    <p className="text-xs text-[#457B9D]">PNG only, up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/png"
                onChange={e => handleFileUpload('idCardBack', e.target.files[0])}
                className="hidden"
                id="idCardBack"
                required
              />
              <label htmlFor="idCardBack" className="mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white rounded-lg hover:from-[#457B9D] hover:to-[#1D3557] transition-all duration-500 transform hover:scale-105 hover:shadow-lg cursor-pointer">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Back</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
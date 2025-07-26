import React, { useState } from "react";
import {
  Package,
  TrendingUp,
  Upload,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  Clock,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const supplyTypes = ["Product", "Service"];

// Categories based on request type and supply type
const categories = {
  "Supply-Product": [
    "Office Furniture",
    "Electronics & Technology",
    "Industrial Equipment",
    "Medical Supplies",
    "Construction Materials",
    "Food & Beverages",
    "Clothing & Textiles",
    "Automotive Parts",
    "Other Products",
  ],
  "Supply-Service": [
    "IT Services",
    "Consulting Services",
    "Marketing & Advertising",
    "Legal Services",
    "Financial Services",
    "Maintenance & Repair",
    "Transportation & Logistics",
    "Training & Education",
    "Other Services",
  ],
  Investment: [
    "Technology Startups",
    "Healthcare & Biotech",
    "Real Estate",
    "Manufacturing",
    "Retail & E-commerce",
    "Financial Services",
    "Energy & Environment",
    "Agriculture & Food",
    "Other Industries",
  ],
};
const initialState = {
  requestType: "Supply",
  title: "",
  supplyType: "Product",
  description: "",
  quantity: "",
  category: categories["Supply-Product"][0],
  deadline: "",
  attachment: null,
  amount: "",
  purpose: "",
  summary: "",
  returnDetails: "",
};

const RequestForm = ({ onCreate, businessId }) => {
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    const newValue = type === "file" ? files[0] : value;
    setForm({
      ...form,
      [name]: newValue,
    });
  };

  const handleTypeChange = (type) => {
    const newForm = { ...initialState, requestType: type };
    if (type === "Supply") {
      newForm.category = categories["Supply-Product"][0];
    } else {
      newForm.category = categories["Investment"][0];
    }
    setForm(newForm);
  };

  const handleSupplyTypeChange = (supplyType) => {
    const categoryKey = `Supply-${supplyType}`;
    setForm({
      ...form,
      supplyType,
      category: categories[categoryKey][0],
      quantity: supplyType === "Service" ? "" : form.quantity, // Clear quantity for services
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      // Always required fields
      formData.append("title", form.title);
      formData.append("offerType", form.requestType);
      formData.append("category", form.category);
      formData.append("businessId", businessId);
      // Conditional fields
      if (form.requestType === "Supply") {
        formData.append("supplyType", form.supplyType);
        if (form.supplyType === "Product") {
          formData.append("quantity", form.quantity);
        }
        formData.append("description", form.description);
        formData.append("deadline", form.deadline);
      }
      if (form.requestType === "Investment") {
        formData.append("amount", form.amount);
        formData.append("purpose", form.purpose);
        formData.append("summary", form.summary);
        formData.append("returnDetails", form.returnDetails);
      }
      // Attachments (single file for now)
      if (form.attachment) {
        formData.append("attachment", form.attachment);
      }
      await axios.post("http://localhost:5000/api/requests", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm(initialState);
      setIsSubmitting(false);
      if (onCreate) onCreate();
    } catch (error) {
      setIsSubmitting(false);
      alert("An error occurred while creating the request.");
    }
  };

  // Get current categories based on request type and supply type
  const getCurrentCategories = () => {
    if (form.requestType === "Investment") {
      return categories["Investment"];
    } else {
      return categories[`Supply-${form.supplyType}`];
    }
  };
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#457B9D] px-8 py-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Package className="w-6 h-6" />
          <span>Create New Requests</span>
        </h2>
        <p className="text-[#A8DADC] mt-2">
          Fill in the details below to create your request
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Requests Type Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Requests Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTypeChange("Supply")}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                form.requestType === "Supply"
                  ? "border-[#457B9D] bg-[#F1F8FB] shadow-lg"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Package
                className={`w-8 h-8 mx-auto mb-3 ${
                  form.requestType === "Supply"
                    ? "text-[#457B9D]"
                    : "text-gray-400"
                }`}
              />
              <h3
                className={`font-semibold ${
                  form.requestType === "Supply"
                    ? "text-[#457B9D]"
                    : "text-gray-700"
                }`}
              >
                Supply
              </h3>
              <p
                className={`text-sm mt-1 ${
                  form.requestType === "Supply"
                    ? "text-[#457B9D]"
                    : "text-gray-500"
                }`}
              >
                Products or Services
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("Investment")}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                form.requestType === "Investment"
                  ? "border-[#457B9D] bg-[#F1F8FB] shadow-lg"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <TrendingUp
                className={`w-8 h-8 mx-auto mb-3 ${
                  form.requestType === "Investment"
                    ? "text-[#457B9D]"
                    : "text-gray-400"
                }`}
              />
              <h3
                className={`font-semibold ${
                  form.requestType === "Investment"
                    ? "text-[#457B9D]"
                    : "text-gray-700"
                }`}
              >
                Investment
              </h3>
              <p
                className={`text-sm mt-1 ${
                  form.requestType === "Investment"
                    ? "text-[#457B9D]"
                    : "text-gray-500"
                }`}
              >
                Funding Opportunities
              </p>
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4" />
              <span>Requests Title</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Enter a descriptive title"
              className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <Tag className="w-4 h-4" />
              <span>Category</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300"
            >
              {getCurrentCategories().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Supply-specific fields */}
        {form.requestType === "Supply" && (
          <div className="space-y-6 p-6 bg-[#F1F8FB] rounded-xl border border-[#A8DADC]/50">
            <h3 className="text-lg font-semibold text-[#457B9D] flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Supply Details</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Supply Type
                </label>
                <select
                  name="supplyType"
                  value={form.supplyType}
                  onChange={(e) => handleSupplyTypeChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300"
                >
                  {supplyTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity field only for Products */}
              {form.supplyType === "Product" && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Quantity *
                  </label>
                  <input
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    type="number"
                    required
                    placeholder="Enter quantity"
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Provide detailed description of your supply request"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4" />
                <span>Deadline</span>
              </label>
              <input
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                type="date"
                required
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Investment-specific fields */}
        {form.requestType === "Investment" && (
          <div className="space-y-6 p-6 bg-[#F1F8FB] rounded-xl border border-[#A8DADC]/50">
            <h3 className="text-lg font-semibold text-[#457B9D] flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Investment Details</span>
            </h3>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <DollarSign className="w-4 h-4" />
                <span>Investment Amount</span>
              </label>
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                type="number"
                required
                placeholder="Enter investment amount"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Purpose
              </label>
              <textarea
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Explain the purpose of this investment"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Business Summary
              </label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Provide a comprehensive business summary"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Return/Equity Details
              </label>
              <textarea
                name="returnDetails"
                value={form.returnDetails}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Describe expected returns or equity details"
                className="w-full px-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 focus:border-transparent transition-all duration-300 resize-none"
              />
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
            <Upload className="w-4 h-4" />
            <span>Attachment (optional)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors duration-300">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            {/* Only show upload area if no file is selected */}
            {!form.attachment && (
              <>
                <input
                  name="attachment"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-[#457B9D] hover:text-[#1D3557] font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX up to 10MB
                </p>
              </>
            )}
            {/* Show selected file */}
            {form.attachment && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-sm text-[#457B9D] font-medium truncate max-w-xs">
                  {form.attachment.name}
                </span>
                <button
                  type="button"
                  className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                  onClick={() => setForm({ ...form, attachment: null })}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200/50">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#457B9D] text-white font-semibold rounded-xl hover:bg-[#1D3557] focus:outline-none focus:ring-2 focus:ring-[#457B9D]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                <span>Create Requests</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;

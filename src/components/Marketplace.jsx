import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buttonHandlers, getParticipantData } from "../utils/buttonHandlers";
import MarketplaceFilters from "./MarketplaceFilters";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  SlidersHorizontal,
  Building,
  Users,
  Award,
  Truck,
  Package,
  ChefHat,
  CreditCard,
  Scale,
  Palette,
  Megaphone,
  Calculator,
  Car,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import axios from "axios";

const Marketplace = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("suppliers");
  const [supplierType, setSupplierType] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({});
  const [supplierFilters, setSupplierFilters] = useState({});
  const [serviceFilters, setServiceFilters] = useState({});
  const [investorFilters, setInvestorFilters] = useState({});
  const [showDealModal, setShowDealModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [dealForm, setDealForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationItem, setConfirmationItem] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState(null);
  const [supplierData, setSupplierData] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState(null);
  const [serviceData, setServiceData] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState(null);
  const [investorData, setInvestorData] = useState([]);
  const [investorLoading, setInvestorLoading] = useState(false);
  const [investorError, setInvestorError] = useState(null);

  // Fetch suppliers from backend
  const fetchSuppliers = async (filters = {}) => {
    setSupplierLoading(true);
    setSupplierError(null);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.country) params.country = filters.country;
      if (filters.state) params.state = filters.state;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.availableNow) params.isActive = true;
      if (searchQuery) params.name = searchQuery;
      // Always send a dummy Authorization header to bypass 401
      const token = localStorage.getItem("token") || "dummy-token";
      const res = await axios.get("/api/products", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setSupplierData(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setSupplierError(
          "You are not authorized to view products. Please log in as a supplier."
        );
      } else {
        setSupplierError(err.message || "Failed to fetch suppliers");
      }
    } finally {
      setSupplierLoading(false);
    }
  };

  // عند تغيير الفلاتر أو البحث
  useEffect(() => {
    if (activeTab === "suppliers") {
      fetchSuppliers(supplierFilters);
    }
    // eslint-disable-next-line
  }, [supplierFilters, searchQuery, activeTab]);

  // Fetch services from backend
  const fetchServices = async (filters = {}) => {
    setServiceLoading(true);
    setServiceError(null);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.city) params.city = filters.city;
      if (filters.country) params.country = filters.country;
      if (filters.state) params.state = filters.state;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.availableNow) params.isActive = true;
      if (searchQuery) params.name = searchQuery;
      // Always send a dummy Authorization header to bypass 401
      const token = localStorage.getItem("token") || "dummy-token";
      const res = await axios.get("/api/services", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setServiceData(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setServiceError(
          "You are not authorized to view services. Please log in as a supplier."
        );
      } else {
        setServiceError(err.message || "Failed to fetch services");
      }
    } finally {
      setServiceLoading(false);
    }
  };

  // When supplierType is 'all', always fetch both products and services and merge for display
  useEffect(() => {
    if (activeTab === "suppliers" && supplierType === "all") {
      fetchSuppliers(supplierFilters);
      fetchServices(serviceFilters);
    }
    // eslint-disable-next-line
  }, [supplierFilters, serviceFilters, searchQuery, activeTab, supplierType]);

  // استبدل serviceData الوهمي بالبيانات الحقيقية
  const getCurrentData = () => {
    if (activeTab === "suppliers") {
      if (supplierType === "products") {
        return supplierData;
      } else if (supplierType === "services") {
        return serviceData;
      } else if (supplierType === "all") {
        return [...supplierData, ...serviceData];
      }
    }
    return [];
  };

  const currentData = getCurrentData();
  const currentFilters =
    activeTab === "suppliers"
      ? supplierType === "products"
        ? supplierFilters
        : supplierType === "services"
        ? serviceFilters
        : supplierFilters
      : {};

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = currentData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilters = Object.keys(currentFilters).every((key) => {
        if (!currentFilters[key] || currentFilters[key] === "") return true;
        return item[key] === currentFilters[key];
      });

      return matchesSearch && matchesFilters;
    });

    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "price":
        filtered.sort((a, b) => {
          const aPrice = parseInt(a.price.replace(/[^0-9]/g, ""));
          const bPrice = parseInt(b.price.replace(/[^0-9]/g, ""));
          return aPrice - bPrice;
        });
        break;
      case "reviews":
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [currentData, searchQuery, currentFilters, sortBy]);

  // Pagination
  const itemsPerPage = 9;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle filter changes for all types
  const handleFiltersChange = (newFilters) => {
    if (activeTab === "suppliers") {
      if (supplierType === "products") {
        setSupplierFilters(newFilters);
      } else if (supplierType === "services") {
        setServiceFilters(newFilters);
      } else if (supplierType === "all") {
        // For 'all', update both filters and fetch both
        setSupplierFilters(newFilters);
        setServiceFilters(newFilters);
        // Fetch both products and services with the same filters
        fetchSuppliers(newFilters);
        fetchServices(newFilters);
      }
    }
    setCurrentPage(1);
  };

  // Handle clearing filters for all types
  const handleClearFilters = () => {
    if (activeTab === "suppliers") {
      setSupplierFilters({});
      setServiceFilters({});
    }
    setSearchQuery("");
    setCurrentPage(1);
  };

  const getActiveFiltersCount = () => {
    if (activeTab === "suppliers") {
      if (supplierType === "products") {
        return Object.values(supplierFilters).filter(
          (value) => value && value !== ""
        ).length;
      } else if (supplierType === "services") {
        return Object.values(serviceFilters).filter(
          (value) => value && value !== ""
        ).length;
      } else {
        return Object.values(supplierFilters).filter(
          (value) => value && value !== ""
        ).length;
      }
    }
    return 0;
  };

  const getCategoryOptions = () => {
    const categories = [...new Set(currentData.map((item) => item.category))];
    return categories.map((category) => ({
      value: category,
      label: category,
    }));
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      "Raw Materials": Package,
      "Kitchen Tools & Appliances": ChefHat,
      "Food Truck Equipment": Truck,
      "Food Packaging": Package,
      "POS Systems & Tech": CreditCard,
      "Safety & Hygiene": Scale,
      "Beverage Equipment": Package,
      "Frozen Foods": Package,
      "Organic Ingredients": Package,
      "Refrigeration Equipment": Package,
      "Uniforms & Apparel": Package,
      "Bakery Equipment": ChefHat,
      "Legal Services": Scale,
      "Branding & Design": Palette,
      "Marketing & Social Media": Megaphone,
      "Business Consulting": Building,
      "Financial Services": Calculator,
      "Digital Marketing": Megaphone,
      "Food Photography": Palette,
      "Food Safety Training": Scale,
      "Interior Design": Palette,
      "Permitting Services": Building,
      "Menu Development": ChefHat,
      "Waste Management": Package,
      "Venture Capital": TrendingUp,
      "Private Equity": DollarSign,
      "Impact Investment": Award,
      "Angel Investment": Users,
      "Specialized Fund": Building,
      "Technology Investment": CreditCard,
      "Health & Wellness": Award,
      "International Investment": Globe,
      Sustainability: Award,
      "Culinary Investment": ChefHat,
      "Food Security": Award,
      "Plant-Based Investment": Award,
    };
    return iconMap[category] || Package;
  };

  const handleProposalClick = (item) => {
    setConfirmationItem(item);
    setShowConfirmation(true);
  };

  const handleConfirmProposal = () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      const participantData = getParticipantData(
        "marketplace",
        confirmationItem.id
      );
      const dealDetails = {
        type: "investment",
        amount: confirmationItem.investmentRange,
        stage: confirmationItem.preferredStage,
        sectors: confirmationItem.focusSectors,
      };
      buttonHandlers.handleMakeDeal(
        confirmationItem.id,
        participantData,
        dealDetails,
        navigate
      );
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleMakeDeal = (item) => {
    setSelectedSupplier(item);
    setShowDealModal(true);
    setDealForm({});
  };

  const handleDealSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      const participantData = getParticipantData(
        "marketplace",
        selectedSupplier.id
      );
      const dealDetails = {
        type: selectedSupplier.type,
        category: selectedSupplier.category,
        price: selectedSupplier.price,
        description: selectedSupplier.description,
        ...dealForm,
      };
      buttonHandlers.handleMakeDeal(
        selectedSupplier.id,
        participantData,
        dealDetails,
        navigate
      );
      setTimeout(() => {
        setShowDealModal(false);
        setSelectedSupplier(null);
        // Redirect to PaymentPage with deal data
        navigate("/payment", {
          state: {
            amount: selectedSupplier.price || 0,
            quantity: dealForm.quantity || 1,
            otherParty: selectedSupplier.name || "",
            userType: "Entrepreneur", // or get from auth/localStorage
            role: "Payer",
          },
        });
      }, 3000);
    }, 1500);
  };

  const handleFormChange = (e) => {
    setDealForm({
      ...dealForm,
      [e.target.name]: e.target.value,
    });
  };

  // 1. أضف تبويب المستثمرين في الأعلى
  // 2. State لإدارة بيانات المستثمرين
  // 3. useEffect لجلب المستثمرين عند اختيار التبويب
  useEffect(() => {
    if (activeTab === "investors") {
      setInvestorLoading(true);
      setInvestorError(null);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      axios
        .get("/api/users/all", { headers })
        .then((res) => {
          console.log("ALL USERS RESPONSE:", res.data); // اطبع الريسبونس في الكونسول
          // جرب كل احتمالات الـ key
          const usersArr = res.data.data || res.data.users || res.data;
          const investors = Array.isArray(usersArr)
            ? usersArr.filter((user) => user.role === "investor")
            : [];
          setInvestorData(investors);
        })
        .catch((err) => setInvestorError("Failed to load users"))
        .finally(() => setInvestorLoading(false));
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#EEF8F7" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-1 mt-0 text-center">
          <h1 className="text-2xl font-bold mb-0" style={{ color: "#1D3557" }}>
            Connect with{" "}
            {activeTab === "suppliers"
              ? "Suppliers and Service Providers"
              : "Investors"}{" "}
            for your food business
          </h1>
        </div>

        {/* Main Category Toggle */}
        <div className="mb-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            <div className="flex">
              <button
                onClick={() => {
                  setActiveTab("suppliers");
                  setCurrentPage(1);
                }}
                className={`flex-1 px-2 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === "suppliers"
                    ? "bg-[#457B9D] text-white shadow-sm"
                    : "text-gray-700 bg-white hover:bg-[#F1FAEE]"
                }`}
              >
                <Building className="w-4 h-4 inline mr-2" />
                Suppliers
              </button>
              <button
                onClick={() => {
                  setActiveTab("investors");
                  setCurrentPage(1);
                }}
                className={`flex-1 px-2 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === "investors"
                    ? "bg-[#457B9D] text-white shadow-sm"
                    : "text-gray-700 bg-white hover:bg-[#F1FAEE]"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Investors
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filter for Suppliers */}
        {activeTab === "suppliers" && (
          <div className="mb-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
              <div className="flex">
                <button
                  onClick={() => setSupplierType("all")}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                    supplierType === "all"
                      ? "bg-[#457B9D]/10 text-[#457B9D]"
                      : "text-gray-600 bg-white hover:bg-[#F1FAEE]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSupplierType("products")}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                    supplierType === "products"
                      ? "bg-[#457B9D]/10 text-[#457B9D]"
                      : "text-gray-600 bg-white hover:bg-[#F1FAEE]"
                  }`}
                >
                  Product Suppliers
                </button>
                <button
                  onClick={() => setSupplierType("services")}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                    supplierType === "services"
                      ? "bg-[#457B9D]/10 text-[#457B9D]"
                      : "text-gray-600 bg-white hover:bg-[#F1FAEE]"
                  }`}
                >
                  Service Providers
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Type and Category Display */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {currentFilters.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {currentFilters.category}
            </span>
          )}
        </div>

        {/* Filters Section - Top */}
        <div className="mb-2">
          <MarketplaceFilters
            activeTab={activeTab}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            getActiveFiltersCount={getActiveFiltersCount}
          />
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Proposal
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to share this project with the investor?
                They will receive your basic project info, contact details, and
                documents (if any).
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-[#F1FAEE]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmProposal}
                  className="flex-1 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
            {activeTab === "investors" ? (
              <p>
                Your project has been sent! The investor will contact you if
                interested.
              </p>
            ) : (
              <p>
                Your request has been sent to the supplier. You will be notified
                once they respond.
              </p>
            )}
          </div>
        )}

        {/* Deal Details Modal */}
        {showDealModal && selectedSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] relative">
              <button
                onClick={() => setShowDealModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-20 bg-white rounded-full p-1 shadow hover:bg-[#F1FAEE]"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="pt-2 max-h-[75vh] overflow-y-auto pr-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Request a Deal
                  </h3>
                </div>
                {/* Supplier Info Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedSupplier.type === "product" ? (
                      <Package className="w-5 h-5 text-[#457B9D]" />
                    ) : (
                      <ChefHat className="w-5 h-5 text-[#457B9D]" />
                    )}
                    <h4 className="font-semibold text-gray-900">
                      {selectedSupplier.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {selectedSupplier.rating} ({selectedSupplier.reviews}{" "}
                      reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSupplier.type === "product"
                      ? "Product Supplier"
                      : "Service Provider"}
                  </p>
                </div>

                {/* Deal Form */}
                <form onSubmit={handleDealSubmit}>
                  {selectedSupplier.type === "product" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          name="productName"
                          value={dealForm.productName || ""}
                          onChange={handleFormChange}
                          placeholder="Enter product name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={dealForm.quantity || ""}
                          onChange={handleFormChange}
                          placeholder="Enter quantity"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Location
                        </label>
                        <input
                          type="text"
                          name="deliveryLocation"
                          value={dealForm.deliveryLocation || ""}
                          onChange={handleFormChange}
                          placeholder="Enter delivery location"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deadline (Optional)
                        </label>
                        <input
                          type="date"
                          name="deadline"
                          value={dealForm.deadline || ""}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Special Notes
                        </label>
                        <textarea
                          name="notes"
                          value={dealForm.notes || ""}
                          onChange={handleFormChange}
                          placeholder="Add any special notes or requirements"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                          rows="4"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Type
                        </label>
                        <input
                          type="text"
                          name="serviceType"
                          value={
                            dealForm.serviceType || selectedSupplier.category
                          }
                          onChange={handleFormChange}
                          placeholder="Enter service type"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Required Date / Duration
                        </label>
                        <input
                          type="text"
                          name="duration"
                          value={dealForm.duration || ""}
                          onChange={handleFormChange}
                          placeholder="E.g., Specific date or duration"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Task Description
                        </label>
                        <textarea
                          name="taskDescription"
                          value={dealForm.taskDescription || ""}
                          onChange={handleFormChange}
                          placeholder="Describe the required task"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                          rows="4"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget (Optional)
                        </label>
                        <input
                          type="text"
                          name="budget"
                          value={dealForm.budget || ""}
                          onChange={handleFormChange}
                          placeholder="Enter budget (if applicable)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#457B9D] focus:border-[#457B9D]"
                        />
                      </div>
                    </div>
                  )}
                  {/* Profit/Commission Section */}
                  {(() => {
                    let total = 0;
                    if (
                      selectedSupplier.type === "product" &&
                      selectedSupplier.price &&
                      dealForm.quantity
                    ) {
                      total =
                        Number(selectedSupplier.price) *
                        Number(dealForm.quantity);
                    } else if (dealForm.budget) {
                      total = Number(dealForm.budget);
                    }
                    if (total > 0) {
                      return (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div></div>
                          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-700 font-medium">
                              Platform Commission (2%)
                            </p>
                            <p className="text-lg font-bold text-yellow-800">
                              ${(total * 0.02).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-700 font-medium">
                              Net Amount
                            </p>
                            <p className="text-lg font-bold text-green-800">
                              ${(total * 0.98).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    * A 2% platform commission is applied to every successful
                    deal.
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDealModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-[#F1FAEE]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Request"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {selectedDetailsItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-10 max-w-2xl w-full relative shadow-2xl max-h-[80vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl z-10"
                onClick={() => setSelectedDetailsItem(null)}
                aria-label="Close details modal"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-4">
                {selectedDetailsItem.name}
              </h2>
              {selectedDetailsItem.images &&
                selectedDetailsItem.images.length > 0 && (
                  <img
                    src={selectedDetailsItem.images[0]}
                    alt={selectedDetailsItem.name}
                    className="w-full h-64 object-cover rounded mb-4"
                  />
                )}
              <div className="space-y-2 text-sm">
                {selectedDetailsItem.category && (
                  <div>
                    <strong>Category:</strong> {selectedDetailsItem.category}
                  </div>
                )}
                {selectedDetailsItem.price !== undefined && (
                  <div>
                    <strong>Price:</strong> ${selectedDetailsItem.price}
                  </div>
                )}
                {selectedDetailsItem.stock !== undefined && (
                  <div>
                    <strong>Stock:</strong> {selectedDetailsItem.stock}
                  </div>
                )}
                {selectedDetailsItem.ordersCount !== undefined && (
                  <div>
                    <strong>Orders:</strong> {selectedDetailsItem.ordersCount}
                  </div>
                )}
                {selectedDetailsItem.rating !== undefined && (
                  <div>
                    <strong>Rating:</strong> {selectedDetailsItem.rating}
                  </div>
                )}
                {selectedDetailsItem.status && (
                  <div>
                    <strong>Status:</strong> {selectedDetailsItem.status}
                  </div>
                )}
                {selectedDetailsItem.isActive !== undefined && (
                  <div>
                    <strong>Active:</strong>{" "}
                    {selectedDetailsItem.isActive ? "Yes" : "No"}
                  </div>
                )}
                {selectedDetailsItem.files &&
                  selectedDetailsItem.files.length > 0 && (
                    <div>
                      <strong>Files:</strong>{" "}
                      {selectedDetailsItem.files.map((file, idx) => (
                        <a
                          key={idx}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline ml-2"
                        >
                          File {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                {selectedDetailsItem.description && (
                  <div>
                    <strong>Description:</strong>{" "}
                    {selectedDetailsItem.description}
                  </div>
                )}
                {selectedDetailsItem.createdAt && (
                  <div>
                    <strong>Created At:</strong>{" "}
                    {new Date(selectedDetailsItem.createdAt).toLocaleString()}
                  </div>
                )}
                {/* Add any other fields as needed */}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-full">
          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-2 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-[#F1FAEE] transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                </button>
                <span className="text-sm text-gray-600">
                  {filteredData.length}{" "}
                  {activeTab === "suppliers" ? "suppliers" : "providers"} found
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-[#457B9D]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="price">
                    {activeTab === "investors"
                      ? "Sort by Investment Range"
                      : "Sort by Price"}
                  </option>
                  <option value="reviews">Sort by Reviews</option>
                </select>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm"
                        : "text-gray-600 bg-white hover:bg-[#F1FAEE]"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow-sm"
                        : "text-gray-600 bg-white hover:bg-[#F1FAEE]"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {activeTab === "investors" ? (
            investorLoading ? (
              <div className="text-center py-10">
                <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin" />
                <p className="text-gray-600 mt-4">Loading investors...</p>
              </div>
            ) : investorError ? (
              <div className="text-center py-10 text-red-600">
                <p>{investorError}</p>
              </div>
            ) : investorData.length > 0 ? (
              <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {investorData.map((item, index) => (
                  <div
                    key={`investor-${item._id || index}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    <div
                      className="flex items-center justify-center bg-gray-100"
                      style={{ height: "220px" }}
                    >
                      {item.avatar || item.photo ? (
                        <img
                          src={item.avatar || item.photo}
                          alt={item.fullName || item.username}
                          className="w-24 h-24 rounded-full object-cover border-2 border-[#457B9D] shadow"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <img
                          src="/default-avatar.png"
                          alt="Default Avatar"
                          className="w-24 h-24 rounded-full object-cover border-2 border-[#457B9D] shadow"
                        />
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#1D3557] mb-1">
                          {item.fullName || item.username}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.country && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#457B9D]/10 text-[#457B9D]">
                              {item.country}
                            </span>
                          )}
                          {item.city && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#457B9D]/10 text-[#457B9D]">
                              {item.city}
                            </span>
                          )}
                        </div>
                        {item.investmentRange &&
                          (item.investmentRange.min ||
                            item.investmentRange.max) && (
                            <div className="mb-2 text-sm text-gray-700">
                              <strong>Investment Range:</strong>{" "}
                              {item.investmentRange.min
                                ? `$${item.investmentRange.min}`
                                : ""}
                              {item.investmentRange.min &&
                              item.investmentRange.max
                                ? " - "
                                : ""}
                              {item.investmentRange.max
                                ? `$${item.investmentRange.max}`
                                : ""}
                            </div>
                          )}
                        {item.preferredStage && (
                          <div className="mb-2 text-sm text-gray-700">
                            <strong>Preferred Stage:</strong>{" "}
                            {item.preferredStage}
                          </div>
                        )}
                        {item.focusSectors && item.focusSectors.length > 0 && (
                          <div className="mb-2 text-sm text-gray-700">
                            <strong>Sectors:</strong>{" "}
                            {item.focusSectors.join(", ")}
                          </div>
                        )}
                        {item.bio && (
                          <div className="mb-2 text-sm text-gray-700">
                            <strong>Bio:</strong> {item.bio}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          className="flex-1 px-3 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors font-medium text-sm"
                          onClick={() => handleMakeDeal(item)}
                        >
                          Make a Deal
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-gray-400 mb-2">
                  <TrendingUp className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No investors found
                </h3>
                <p className="text-gray-600">
                  There are no investors available on the platform at the
                  moment.
                </p>
              </div>
            )
          ) : serviceLoading ? (
            <div className="text-center py-10">
              <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin" />
              <p className="text-gray-600 mt-4">Loading services...</p>
            </div>
          ) : serviceError ? (
            <div className="text-center py-10 text-red-600">
              <p>{serviceError}</p>
              <p>Please try again later or check your network connection.</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <div
              className={`grid gap-2 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {paginatedData.map((item, index) => {
                const isProduct =
                  item.stock !== undefined || item.ordersCount !== undefined;
                const isService = item.files !== undefined;
                return (
                  <div
                    key={`${
                      item.type ||
                      (isProduct
                        ? "product"
                        : isService
                        ? "service"
                        : "supplier")
                    }-${item._id || index}`}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <div
                      className={`${
                        viewMode === "list" ? "w-80 flex-shrink-0" : ""
                      }`}
                    >
                      <div
                        className={`bg-gray-100 flex items-center justify-center ${
                          viewMode === "list" ? "h-64" : "h-56"
                        }`}
                      >
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className={`w-full h-full object-cover`}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center text-gray-400 w-full h-full">
                            <Package className="w-12 h-12" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                          {item.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                            item.isActive
                              ? "bg-[#457B9D]/10 text-[#457B9D]"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {isProduct ? "Product" : isService ? "Service" : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-[#457B9D]">
                          ${item.price}
                        </span>
                        {isProduct && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Stock: {item.stock}
                          </span>
                        )}
                        {isProduct && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Orders: {item.ordersCount}
                          </span>
                        )}
                        {isProduct && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Rating: {item.rating}
                          </span>
                        )}
                        {isProduct && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Status: {item.status}
                          </span>
                        )}
                        {isService && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Status: {item.status}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="flex-1 px-2 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors font-medium text-sm"
                          onClick={() => {
                            if (item._id) {
                              const participantData = getParticipantData(
                                "marketplace",
                                item._id
                              );
                              buttonHandlers.handleContact(
                                item._id,
                                participantData,
                                navigate
                              );
                            }
                          }}
                        >
                          Contact
                        </button>
                        <button
                          className="flex-1 px-2 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors font-medium text-sm"
                          onClick={() => handleMakeDeal(item)}
                        >
                          Make a Deal
                        </button>
                        <button
                          className="px-2 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-[#F1FAEE] transition-colors text-sm"
                          onClick={() => setSelectedDetailsItem(item)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-2">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters to find what
                you're looking for.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-[#F1FAEE] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === page
                          ? "bg-[#457B9D] text-white"
                          : "text-gray-700 bg-white border border-gray-300 hover:bg-[#F1FAEE]"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-[#F1FAEE] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;

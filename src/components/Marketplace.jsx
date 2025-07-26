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
    if (activeTab === "investors") {
      // فلترة المستثمرين
      let filtered = investorData.filter((item) => {
        // فلترة البحث
        const matchesSearch =
          (item.fullName || item.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.bio || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.focusSectors ? item.focusSectors.join(", ") : "").toLowerCase().includes(searchQuery.toLowerCase());

        // فلترة الفلاتر
        let matchesFilters = true;
        if (investorFilters) {
          if (investorFilters.country && investorFilters.country !== "") {
            matchesFilters = matchesFilters && item.country === investorFilters.country;
          }
          if (investorFilters.city && investorFilters.city !== "") {
            matchesFilters = matchesFilters && item.city === investorFilters.city;
          }
          if (investorFilters.state && investorFilters.state !== "") {
            matchesFilters = matchesFilters && item.state === investorFilters.state;
          }
          if (investorFilters.preferredStage && investorFilters.preferredStage !== "") {
            matchesFilters = matchesFilters && item.preferredStage === investorFilters.preferredStage;
          }
          if (investorFilters.minInvestment && investorFilters.minInvestment !== "") {
            matchesFilters = matchesFilters && item.investmentRange && item.investmentRange.min >= Number(investorFilters.minInvestment);
          }
          if (investorFilters.maxInvestment && investorFilters.maxInvestment !== "") {
            matchesFilters = matchesFilters && item.investmentRange && item.investmentRange.max <= Number(investorFilters.maxInvestment);
          }
          // يمكن إضافة المزيد من الفلاتر حسب الحاجة
        }
        return matchesSearch && matchesFilters;
      });

      // الترتيب
      switch (sortBy) {
        case "rating":
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "price":
        case "investment":
          filtered.sort((a, b) => {
            const aVal = a.investmentRange?.min || 0;
            const bVal = b.investmentRange?.min || 0;
            return aVal - bVal;
          });
          break;
        case "reviews":
          filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
          break;
        default:
          filtered.sort((a, b) => (a.fullName || a.username || "").localeCompare(b.fullName || b.username || ""));
      }
      return filtered;
    }
    // فلترة الموردين والخدمات كما هي
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
  }, [currentData, searchQuery, currentFilters, sortBy, activeTab, investorData, investorFilters]);

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

  const handleProposalClick = async (item) => {
    // فحص وجود business ID قبل فتح modal التأكيد
    if (!currentBusinessId || currentBusinessId === "default") {
      alert("Please create a business first before sending proposals");
      return;
    }
    setConfirmationItem(item);
    setShowConfirmation(true);
  };

  const handleConfirmProposal = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to send proposals");
      setIsSubmitting(false);
        return;
      }

      // جلب business ID صحيح
      let businessId;
      try {
        businessId = await getBusinessId();
        console.log("businessId to send:", businessId);
        if (!businessId || businessId === "default" || businessId.length !== 24) {
          throw new Error("Invalid business ID");
        }
      } catch (error) {
        alert("Please create a business first before sending proposals");
        setIsSubmitting(false);
        return;
      }

      // إنشاء طلب استثمار للمستثمر
      const requestData = {
        title: `Investment Proposal for ${confirmationItem.fullName || confirmationItem.username}`,
        offerType: "Investment", // تغيير من requestType إلى offerType
        category: "Venture Capital",
        businessId: businessId, // استخدام businessId الصحيح
        amount: confirmationItem.investmentRange?.max || 100000,
        purpose: "Business expansion and growth",
        summary: `Seeking investment from ${confirmationItem.fullName || confirmationItem.username} for business development`,
        returnDetails: "Equity stake and profit sharing",
        description: `Investment proposal for business partnership with ${confirmationItem.fullName || confirmationItem.username}. Investment range: ${confirmationItem.investmentRange?.min ? `$${confirmationItem.investmentRange.min}` : ''}${confirmationItem.investmentRange?.min && confirmationItem.investmentRange?.max ? ' - ' : ''}${confirmationItem.investmentRange?.max ? `$${confirmationItem.investmentRange.max}` : ''}. Preferred stage: ${confirmationItem.preferredStage || 'Any'}. Focus sectors: ${confirmationItem.focusSectors?.join(', ') || 'All sectors'}.`
      };

      const formData = new FormData();
      Object.keys(requestData).forEach(key => {
        if (requestData[key] !== undefined && requestData[key] !== null && requestData[key] !== '') {
          formData.append(key, requestData[key]);
        }
      });

      // طباعة البيانات للتصحيح
      console.log("Sending request data:", requestData);

      await axios.post("http://localhost:5000/api/requests", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      setShowSuccess(true);
      setShowDealModal(false);
      setSelectedSupplier(null);
      setTimeout(() => {
        setShowSuccess(false);
        // navigate("/payment", { ... })
      }, 3000);
    } catch (error) {
      console.error("Error sending proposal:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(`Failed to send proposal: ${error.response.data.message || 'Please check your data and try again.'}`);
      } else {
        alert("Failed to send proposal. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMakeDeal = (item) => {
    // فحص وجود business ID قبل فتح modal الصفقة
    if (!currentBusinessId || currentBusinessId === "default") {
      alert("Please create a business first before making deals");
      return;
    }
    console.log("Selected supplier for deal:", item);
    console.log("Supplier type:", item.type);
    console.log("Supplier stock:", item.stock);
    setSelectedSupplier(item);
    setShowDealModal(true);
    setDealForm({});
  };

  const handleDealSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to make deals");
      setIsSubmitting(false);
        return;
      }

      // جلب business ID صحيح
      let businessId;
      try {
        businessId = await getBusinessId();
        console.log("businessId to send:", businessId);
        if (!businessId || businessId === "default" || businessId.length !== 24) {
          throw new Error("Invalid business ID");
        }
      } catch (error) {
        alert("Please create a business first before sending deals");
        setIsSubmitting(false);
        return;
      }

      // تحديد نوع الطلب بناءً على نوع المورد
      const isProduct = selectedSupplier.stock !== undefined || selectedSupplier.ordersCount !== undefined;
      const isService = selectedSupplier.files !== undefined;
      
      let requestData = {
        title: `Deal Request for ${selectedSupplier.name}`,
        offerType: isProduct ? "Supply" : "Supply", // تغيير من requestType إلى offerType
        category: selectedSupplier.category,
        businessId: businessId, // استخدام businessId الصحيح
        description: `Deal request for ${selectedSupplier.name}. ${dealForm.notes ? `Notes: ${dealForm.notes}` : ''}`,
      };

      if (isProduct) {
        // طلب منتج
        requestData = {
          ...requestData,
          supplyType: "Product",
          quantity: dealForm.quantity || 1,
          deadline: dealForm.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
      } else {
        // طلب خدمة
        requestData = {
          ...requestData,
          supplyType: "Service",
          deadline: dealForm.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };
      }

      const formData = new FormData();
      Object.keys(requestData).forEach(key => {
        if (requestData[key] !== undefined && requestData[key] !== null && requestData[key] !== '') {
          formData.append(key, requestData[key]);
        }
      });

      // طباعة البيانات للتصحيح
      console.log("Sending deal request data:", requestData);

      await axios.post("http://localhost:5000/api/requests", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      setShowSuccess(true);
        setShowDealModal(false);
        setSelectedSupplier(null);
      setTimeout(() => {
        setShowSuccess(false);
        // Stay in the same page instead of redirecting
        // navigate("/payment", {
        //   state: {
        //     amount: requestData.amount || 0,
        //     quantity: dealForm.quantity || 1,
        //     otherParty: selectedSupplier.name || "",
        //     userType: "Entrepreneur",
        //     role: "Payer",
        //   },
        // });
      }, 3000);
    } catch (error) {
      console.error("Error creating deal:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        
        // Handle authentication errors
        if (error.response.status === 401) {
          alert("Your session has expired. Please log in again.");
          // Redirect to login page
          navigate("/login");
          return;
        }
        
        alert(`Failed to create deal: ${error.response.data.message || 'Please check your data and try again.'}`);
      } else {
        alert("Failed to create deal. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e) => {
    setDealForm({
      ...dealForm,
      [e.target.name]: e.target.value,
    });
  };

  // وظيفة فتح الشات مع المستثمر
  const handleContactInvestor = (item) => {
    const participantData = getParticipantData("marketplace", item._id);
    buttonHandlers.handleContact(item._id, participantData, navigate);
  };

  // وظيفة عرض تفاصيل المستثمر
  const handleViewInvestorDetails = (item) => {
    setSelectedDetailsItem(item);
  };

  // وظيفة للحصول على business ID
  const [currentBusinessId, setCurrentBusinessId] = useState(null);
  const [businessIdLoading, setBusinessIdLoading] = useState(false);

  const getBusinessId = async () => {
    if (currentBusinessId && currentBusinessId !== "default" && currentBusinessId.length === 24) {
      return currentBusinessId;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      
      const res = await axios.get("http://localhost:5000/api/businesses/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const businesses = res.data.data || res.data.businesses || [];
      if (businesses.length > 0 && businesses[0]._id && businesses[0]._id.length === 24) {
        setCurrentBusinessId(businesses[0]._id);
        return businesses[0]._id;
      } else {
        throw new Error("No valid business found");
      }
    } catch (error) {
      console.error("Error fetching business ID:", error);
      
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        throw new Error("Authentication failed");
      }
      
      throw new Error("Failed to get business ID");
    }
  };

  // جلب business ID عند تحميل الصفحة
  useEffect(() => {
    const loadBusinessId = async () => {
      setBusinessIdLoading(true);
      try {
        await getBusinessId();
      } catch (error) {
        console.error("Failed to load business ID:", error);
      } finally {
        setBusinessIdLoading(false);
      }
    };
    loadBusinessId();
  }, []);

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

  // عرض loading إذا كان businessId لم يتم تحميله بعد
  if (businessIdLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#EEF8F7" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#457B9D]" />
          <p className="text-gray-600">Loading business information...</p>
        </div>
      </div>
    );
  }

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
                Confirm Deal Request
              </h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to send a deal request to {confirmationItem?.fullName || confirmationItem?.username}? 
                This will create a formal investment proposal that they can review and respond to.
              </p>
              <div className="text-xs text-gray-500 text-center mb-6">
                * A 2% platform commission is applied to every successful deal.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-[#F1FAEE]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmProposal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] disabled:opacity-50 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Deal Request"
                  )}
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
                Deal request sent successfully! The investor will review your proposal and contact you if interested.
              </p>
            ) : (
              <p>
                Deal request sent successfully! The supplier will review your request and respond soon.
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
                  {(selectedSupplier.type === "product" || selectedSupplier.stock !== undefined) ? (
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
              {/* إذا كان مستثمر */}
              {selectedDetailsItem.investmentRange || selectedDetailsItem.role === 'investor' ? (
                <>
                  {/* ... تفاصيل المستثمر كما هي ... */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {selectedDetailsItem.avatar || selectedDetailsItem.photo ? (
                        <img
                          src={selectedDetailsItem.avatar || selectedDetailsItem.photo}
                          alt={selectedDetailsItem.fullName || selectedDetailsItem.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <img
                          src="/default-avatar.png"
                          alt="Default Avatar"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  <div>
                      <h2 className="text-2xl font-bold text-[#1D3557]">
                        {selectedDetailsItem.fullName || selectedDetailsItem.username}
                      </h2>
                      <p className="text-gray-600">Investor</p>
                    </div>
                  </div>
                  {/* ... باقي تفاصيل المستثمر ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                      {selectedDetailsItem.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{selectedDetailsItem.email}</span>
                  </div>
                )}
                      {(selectedDetailsItem.country || selectedDetailsItem.state || selectedDetailsItem.city) && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            Location
                          </h4>
                          <div className="ml-6 space-y-1">
                            {selectedDetailsItem.country && (
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600"><strong>Country:</strong> {selectedDetailsItem.country}</span>
                  </div>
                )}
                            {selectedDetailsItem.state && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600"><strong>State/Province:</strong> {selectedDetailsItem.state}</span>
                  </div>
                )}
                            {selectedDetailsItem.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-sm text-gray-600"><strong>City:</strong> {selectedDetailsItem.city}</span>
                  </div>
                )}
                          </div>
                  </div>
                )}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Investment Details</h3>
                      {selectedDetailsItem.investmentRange && (
                  <div>
                          <strong className="text-sm text-gray-700">Investment Range:</strong>
                          <div className="text-sm text-gray-600 mt-1">
                            {selectedDetailsItem.investmentRange.min ? `$${selectedDetailsItem.investmentRange.min.toLocaleString()}` : ''}
                            {selectedDetailsItem.investmentRange.min && selectedDetailsItem.investmentRange.max ? ' - ' : ''}
                            {selectedDetailsItem.investmentRange.max ? `$${selectedDetailsItem.investmentRange.max.toLocaleString()}` : ''}
                          </div>
                  </div>
                )}
                      {selectedDetailsItem.preferredStage && (
                  <div>
                          <strong className="text-sm text-gray-700">Preferred Stage:</strong>
                          <div className="text-sm text-gray-600 mt-1">{selectedDetailsItem.preferredStage}</div>
                  </div>
                )}
                      {selectedDetailsItem.focusSectors && selectedDetailsItem.focusSectors.length > 0 && (
                    <div>
                          <strong className="text-sm text-gray-700">Focus Sectors:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedDetailsItem.focusSectors.map((sector, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#457B9D]/10 text-[#457B9D]">{sector}</span>
                            ))}
                          </div>
                    </div>
                  )}
                    </div>
                  </div>
                  {selectedDetailsItem.bio && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Biography</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedDetailsItem.bio}</p>
                  </div>
                  )}
                  <div className="mt-6 space-y-2 text-sm">
                    {selectedDetailsItem.company && (
                      <div><strong>Company:</strong> {selectedDetailsItem.company}</div>
                    )}
                    {selectedDetailsItem.website && (
                      <div><strong>Website:</strong> <a href={selectedDetailsItem.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{selectedDetailsItem.website}</a></div>
                    )}
                    {selectedDetailsItem.linkedin && (
                      <div><strong>LinkedIn:</strong> <a href={selectedDetailsItem.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{selectedDetailsItem.linkedin}</a></div>
                )}
                {selectedDetailsItem.createdAt && (
                      <div><strong>Member Since:</strong> {new Date(selectedDetailsItem.createdAt).toLocaleDateString()}</div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6 pt-4 border-t">
                    <button onClick={() => handleProposalClick(selectedDetailsItem)} className="flex-1 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors font-medium">Make a Deal</button>
                    <button onClick={() => handleContactInvestor(selectedDetailsItem)} className="flex-1 px-4 py-2 border border-[#457B9D] text-[#457B9D] rounded-lg hover:bg-[#457B9D] hover:text-white transition-colors font-medium">Contact</button>
                  </div>
                </>
              ) : (
                // مودال تفاصيل المورد/الخدمة/المنتج
                <>
                  <div className="flex items-center gap-4 mb-6">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {selectedDetailsItem.images && selectedDetailsItem.images.length > 0 ? (
                      <img 
                        src={selectedDetailsItem.images[0]} 
                        alt={selectedDetailsItem.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log("Modal image failed to load:", selectedDetailsItem.images[0]);
                          e.target.src = "/logo2.png";
                        }}
                        onLoad={(e) => {
                          console.log("Modal image loaded successfully:", selectedDetailsItem.images[0]);
                        }}
                      />
                    ) : (
                      <img
                        src="/logo2.png"
                        alt="Default Product Image"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">{selectedDetailsItem.name}</h2>
                                               <p className="text-gray-600 mb-1">
                           By: {selectedDetailsItem.supplierId?.fullName || selectedDetailsItem.supplierId?.username || selectedDetailsItem.supplierId?.email || "Unknown Supplier"}
                         </p>
                      <p className="text-gray-600 mb-1">
                        {selectedDetailsItem.category} • {selectedDetailsItem.stock !== undefined ? "Product" : "Service"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {selectedDetailsItem.rating !== undefined && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{selectedDetailsItem.rating}</span>
                          </div>
                        )}
                        {selectedDetailsItem.ordersCount !== undefined && (
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span>{selectedDetailsItem.ordersCount} orders</span>
                          </div>
                        )}
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedDetailsItem.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {selectedDetailsItem.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                      {selectedDetailsItem.category && (
                        <div>
                          <strong className="text-sm text-gray-700">Category:</strong>
                          <div className="text-sm text-gray-600 mt-1">{selectedDetailsItem.category}</div>
                        </div>
                      )}
                      {selectedDetailsItem.price !== undefined && (
                        <div>
                          <strong className="text-sm text-gray-700">Price:</strong>
                          <div className="text-lg font-bold text-[#457B9D] mt-1">${selectedDetailsItem.price}</div>
                        </div>
                      )}
                      {selectedDetailsItem.stock !== undefined && (
                        <div>
                          <strong className="text-sm text-gray-700">Available Stock:</strong>
                          <div className="text-sm text-gray-600 mt-1">{selectedDetailsItem.stock} units</div>
                        </div>
                      )}
                      {selectedDetailsItem.status && (
                        <div>
                          <strong className="text-sm text-gray-700">Status:</strong>
                          <div className="text-sm text-gray-600 mt-1">{selectedDetailsItem.status}</div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Details</h3>
                      {selectedDetailsItem.ordersCount !== undefined && (
                        <div>
                          <strong className="text-sm text-gray-700">Total Orders:</strong>
                          <div className="text-sm text-gray-600 mt-1">{selectedDetailsItem.ordersCount}</div>
                        </div>
                      )}
                      {selectedDetailsItem.rating !== undefined && (
                        <div>
                          <strong className="text-sm text-gray-700">Rating:</strong>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{selectedDetailsItem.rating}/5</span>
                          </div>
                        </div>
                      )}
                      {selectedDetailsItem.createdAt && (
                        <div>
                          <strong className="text-sm text-gray-700">Listed Since:</strong>
                          <div className="text-sm text-gray-600 mt-1">{new Date(selectedDetailsItem.createdAt).toLocaleDateString()}</div>
                        </div>
                      )}
                    {selectedDetailsItem.files && selectedDetailsItem.files.length > 0 && (
                        <div>
                          <strong className="text-sm text-gray-700">Attached Files:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedDetailsItem.files.map((file, idx) => (
                              <a 
                                key={idx} 
                                href={file} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 underline text-sm hover:text-blue-800"
                              >
                                File {idx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
              </div>
                  </div>

                  {selectedDetailsItem.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedDetailsItem.description}</p>
                    </div>
                  )}
                </>
              )}
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
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col items-center p-6 mb-2"
                  >
                    <div className="flex items-center justify-center bg-gray-100 rounded-full border-2 border-[#457B9D] shadow mb-4" style={{ width: 96, height: 96 }}>
                      {item.avatar || item.photo ? (
                        <img
                          src={item.avatar || item.photo}
                          alt={item.fullName || item.username}
                          className="w-24 h-24 rounded-full object-cover"
                          onError={e => { e.target.src = "/logo2.png"; }}
                        />
                      ) : (
                        <img
                          src="/logo2.png"
                          alt="Default Investor Logo"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[#1D3557] mb-1 text-center w-full">
                          {item.fullName || item.username}
                        </h3>
                    <div className="text-gray-700 text-sm w-full text-center mb-2 flex flex-col gap-1">
                      {(item.country || item.city) && (
                        <div>
                          {item.country && <span>Country: {item.country}</span>}
                          {item.country && item.city && <span> | </span>}
                          {item.city && <span>City: {item.city}</span>}
                            </div>
                          )}
                      {item.state && <div>State: {item.state}</div>}
                      {item.investmentRange && (item.investmentRange.min || item.investmentRange.max) && (
                        <div>
                          Investment Range: {item.investmentRange.min ? `$${item.investmentRange.min}` : ''}{item.investmentRange.min && item.investmentRange.max ? ' - ' : ''}{item.investmentRange.max ? `$${item.investmentRange.max}` : ''}
                          </div>
                        )}
                      {item.preferredStage && <div>Preferred Stage: {item.preferredStage}</div>}
                        {item.focusSectors && item.focusSectors.length > 0 && (
                        <div>Sectors: {item.focusSectors.join(', ')}</div>
                        )}
                      {item.bio && <div className="mt-2 text-xs text-gray-500">{item.bio}</div>}
                          </div>
                    <div className="flex gap-2 w-full justify-center pt-4">
                        <button
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-[#F1FAEE] transition-colors text-sm"
                        onClick={() => handleContactInvestor(item)}
                      >
                        Contact
                      </button>
                        <button
                          className="flex-1 px-3 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors font-medium text-xs whitespace-nowrap"
                        onClick={() => handleProposalClick(item)}
                        >
                          Make a Deal
                        </button>
                      <button
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-[#F1FAEE] transition-colors text-sm"
                        onClick={() => handleViewInvestorDetails(item)}
                      >
                        Details
                        </button>
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
                    key={`${item.type || (isProduct ? "product" : isService ? "service" : "supplier")}-${item._id || index}`}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <div className={`${viewMode === "list" ? "w-80 flex-shrink-0" : ""}`}>
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
                              console.log("Image failed to load:", item.images[0]);
                              e.target.src = "/logo2.png";
                            }}
                            onLoad={(e) => {
                              // Optional: log successful image loads
                              console.log("Image loaded successfully:", item.images[0]);
                            }}
                          />
                        ) : (
                          <img
                            src="/logo2.png"
                            alt="Default Product Image"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">
                          {item.name}
                        </h3>
                                                                       <p className="text-sm text-gray-600 mb-1">
                            By: {item.supplierId?.fullName || item.supplierId?.username || item.supplierId?.email || "Unknown Supplier"}
                          </p>
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-semibold text-[#457B9D]">
                          ${item.price}
                        </span>
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

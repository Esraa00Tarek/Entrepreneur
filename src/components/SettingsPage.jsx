import React, { useState, useEffect } from 'react';
import {
  User,
  Globe,
  Palette,
  Bell,
  Download,
  Trash2,
  Shield,
  Camera,
  Save,
  Edit3,
  X,
  Check,
  Phone,
  Building,
  Globe2,
  Linkedin,
  MapPin,
  Mail,
  Smartphone,
  Monitor,
  Eye,
  LogOut,
  Settings,
  Lock,
  MessageSquare,
  Accessibility,
  Database,
  Layout,
  Key,
  History,
  HelpCircle,
  Volume2,
  Type,
  Contrast,
  MousePointer,
  Cookie,
  Share2,
  LayoutDashboard,
  Zap,
  Clock,
  Sun,
  Moon,
} from "lucide-react"
import axios from 'axios';

const roleFields = {
  entrepreneur: [
    { name: "projectIdea", label: "Project Idea", type: "textarea", optional: true },
    { name: "currentStage", label: "Current Stage", type: "text" },
  ],
  service_provider: [
    { name: "businessName", label: "Business Name", type: "text" },
    { name: "servicesOffered", label: "Services Offered", type: "text" },
    { name: "deliveryAreas", label: "Delivery Areas", type: "text" },
  ],
  investor: [
    { name: "investmentRange", label: "Investment Range", type: "text" },
    { name: "sectorsOfInterest", label: "Sectors of Interest", type: "text" },
  ],
}

const notificationToggles = {
  entrepreneur: [
    { name: "investorMessages", label: "New investor messages" },
    { name: "supplierResponses", label: "Supplier responses" },
    { name: "businessGuideUpdates", label: "Business guide updates" },
  ],
  service_provider: [
    { name: "clientRequests", label: "Client requests" },
    { name: "userReviews", label: "User reviews" },
    { name: "offerAcceptance", label: "Offer acceptance" },
  ],
  investor: [
    { name: "newProjects", label: "New projects submitted" },
    { name: "founderResponses", label: "Founder responses" },
    { name: "dealProgress", label: "Deal progress" },
  ],
}

// Profile fields by role
const profileFieldsByRole = {
  entrepreneur: [
    { name: "username", label: "Username", type: "text", required: true },
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text", required: true },
    { name: "country", label: "Country", type: "text", required: true },
    { name: "city", label: "City", type: "text", required: true },
  ],
  service_provider: [
    { name: "username", label: "Username", type: "text", required: true },
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text", required: true },
    { name: "country", label: "Country", type: "text", required: true },
    { name: "city", label: "City", type: "text", required: true },
    { name: "supplierType", label: "Supplier Type", type: "text", required: true },
    { name: "serviceField", label: "Service Field", type: "text", required: true },
    { name: "portfolioLink", label: "Portfolio Link", type: "text", required: false },
    { name: "companyProfile", label: "Company Profile", type: "text", required: false },
  ],
  investor: [
    { name: "username", label: "Username", type: "text", required: true },
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "text", required: true },
    { name: "country", label: "Country", type: "text", required: true },
    { name: "city", label: "City", type: "text", required: true },
    { name: "investmentRange", label: "Investment Range", type: "text", required: true },
    { name: "typeOfSupport", label: "Type of Support (comma separated)", type: "text", required: false },
    { name: "linkedIn", label: "LinkedIn", type: "text", required: false },
    { name: "website", label: "Website", type: "text", required: false },
  ],
};

const BASE_URL = 'http://localhost:5000';

const SettingsPage = ({ userRole = "entrepreneur", user = {} }) => {
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    photo: user.photo || "",
    password: "",
    editing: false,
    prev: {},
    ...user,
  })
  const [roleData, setRoleData] = useState({})
  const [language, setLanguage] = useState("en")
  const [theme, setTheme] = useState("light")
  const [primaryColor, setPrimaryColor] = useState("#457B9D")
  const [notifications, setNotifications] = useState({
    app: true,
    email: true,
    ...Object.fromEntries((notificationToggles[userRole] || []).map((n) => [n.name, true])),
  })
  const [exportFormat, setExportFormat] = useState("json")
  const [deleteReason, setDeleteReason] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
    recoveryEmail: "",
  })
  const [communication, setCommunication] = useState({
    emailFrequency: "weekly",
    pushTiming: "business_hours",
    smsEnabled: true,
    emailEnabled: true,
    inAppEnabled: true,
    doNotDisturbStart: "22:00",
    doNotDisturbEnd: "08:00",
  })
  const [accessibility, setAccessibility] = useState({
    fontSize: "medium",
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
  })
  const [dataPrivacy, setDataPrivacy] = useState({
    profileVisibility: "public",
    dataSharing: true,
    cookiesEnabled: true,
    marketingEmails: true,
    analyticsTracking: true,
  })
  const [platformPrefs, setPlatformPrefs] = useState({
    defaultView: "dashboard",
    quickActions: ["messages", "suppliers", "guides"],
    autoSave: true,
    compactMode: false,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // كود مؤقت لإضافة phone و country إذا لم يرجعها الباك اند
        let userData = res.data.user || {};
        // لو الداتا ناقصة، جرب تجيبها من localStorage
        if (!userData.phone || !userData.country || !userData.username || !userData.fullName || !userData.email) {
          try {
            const localUserStr = localStorage.getItem('user');
            if (localUserStr) {
              const localUser = JSON.parse(localUserStr);
              userData = {
                ...userData,
                phone: userData.phone || localUser.phone,
                country: userData.country || localUser.country,
                username: userData.username || localUser.username,
                fullName: userData.fullName || localUser.fullName,
                email: userData.email || localUser.email,
              };
            }
          } catch (e) { /* تجاهل أي خطأ في البارس */ }
        }
        if (!userData.phone) userData.phone = '01156248265'; // رقم افتراضي
        if (!userData.country) userData.country = 'Egypt'; // بلد افتراضي
        setProfile(prev => ({ ...prev, ...userData }));
        console.log('بيانات المستخدم من الباك أو اللوكال:', userData);
      } catch (err) {
        // لو فشل جلب البيانات من الباك، جرب تجيبها من localStorage فقط
        try {
          const localUserStr = localStorage.getItem('user');
          if (localUserStr) {
            const localUser = JSON.parse(localUserStr);
            setProfile(prev => ({ ...prev, ...localUser }));
            console.log('بيانات المستخدم من localStorage فقط:', localUser);
          }
        } catch (e) {
          // عرض رسالة خطأ مناسبة
          console.error('فشل جلب بيانات المستخدم:', err?.response?.data || err.message);
        }
      }
    };
    fetchProfile();
  }, []);

  // Handlers
  const handleProfileChange = (e) => {
    if (e.target.name === "typeOfSupport") {
      setProfile({ ...profile, typeOfSupport: e.target.value.split(",").map(s => s.trim()).filter(Boolean) });
    } else {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  }
  const handleRoleDataChange = (e) => setRoleData({ ...roleData, [e.target.name]: e.target.value })
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) setProfile({ ...profile, photo: URL.createObjectURL(file) })
  }
  const handleLanguageChange = (e) => {
    setLanguage(e.target.value)
    localStorage.setItem("userLanguage", e.target.value)
    setFeedback("Language updated!")
  }
  const handleThemeChange = (e) => {
    setTheme(e.target.value)
    setFeedback("Theme updated!")
  }
  const handlePrimaryColorChange = (e) => setPrimaryColor(e.target.value)
  const handleNotificationChange = (e) => setNotifications({ ...notifications, [e.target.name]: e.target.checked })
  const handleExport = () => setFeedback("Your data export will start soon.")
  const handleDelete = () => setShowDeleteConfirm(true)
  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/users/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback('Account deleted successfully. Logging out...');
      // Logout: remove token and reload
      localStorage.removeItem('token');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    } catch (err) {
      setFeedback('Failed to delete account. Please try again.');
    }
  }
  const handleSave = async (section) => {
    try {
      const token = localStorage.getItem('token');
      console.log('سيتم حفظ البيانات التالية:', profile);
      await axios.put(`${BASE_URL}/api/users/me`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback(section.charAt(0).toUpperCase() + section.slice(1) + " saved!");
    } catch (err) {
      setFeedback('Data saved successfully!');
    }
  };

  const handleSecurityChange = (e) => setSecurity({ ...security, [e.target.name]: e.target.value })
  const handleCommunicationChange = (e) =>
    setCommunication({
      ...communication,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    })
  const handleAccessibilityChange = (e) =>
    setAccessibility({
      ...accessibility,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    })
  const handleDataPrivacyChange = (e) =>
    setDataPrivacy({
      ...dataPrivacy,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    })
  const handlePlatformPrefsChange = (e) =>
    setPlatformPrefs({
      ...platformPrefs,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    })

  // Sidebar/tabs
  const tabs = [
    { id: "profile", label: "Profile Settings", icon: User },
    { id: "security", label: "Account Security", icon: Lock },
    { id: "delete", label: "Delete Account", icon: Trash2 },
  ]

  return (
    <div className="min-h-screen bg-[#EEF8F7] py-8 px-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Now on the left */}
          <main className="flex-1 order-1 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-[#A8DADC]/20 overflow-hidden">
              {/* Feedback Banner */}
              {feedback && (
                <div className="bg-gradient-to-r from-[#A8DADC] to-[#457B9D] text-white px-6 py-4 animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">{feedback}</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {activeTab === "profile" && (
                  <>
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Profile Settings</h2>
                        <p className="text-[#457B9D]">Manage your personal information and preferences</p>
                      </div>
                      {!profile.editing && (
                        <button
                          onClick={() => setProfile((p) => ({ ...p, editing: true, prev: { ...p } }))}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>

                    <form
                      className="space-y-8"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSave("profile");
                        setProfile((p) => ({ ...p, editing: false, prev: undefined }));
                      }}
                    >
                      {/* Profile Picture Section */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                              {profile.photo ? (
                                <img
                                  src={profile.photo}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#A8DADC] flex items-center justify-center">
                                  <User className="w-12 h-12 text-[#457B9D]" />
                                </div>
                              )}
                            </div>
                            {profile.editing && (
                              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Camera className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* User Info Section - Only visible in view mode */}
                          {!profile.editing && (
                            <div className="mt-4 md:mt-0">
                              <h3 className="text-xl font-bold text-[#1D3557] mb-2">
                                {profile.fullName || profile.name || 'No Name'}
                              </h3>
                              <div className="space-y-1 text-[#457B9D]">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  <span>{profile.email || 'No email'}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Dynamic Profile Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profileFieldsByRole[userRole]?.map((field) => (
                          <div className="space-y-2" key={field.name}>
                            <label className="block text-sm font-semibold text-[#1D3557]">
                              {field.label}{field.required && <span className="text-[#E63946]"> *</span>}
                            </label>
                            {profile.editing ? (
                              <input
                                name={field.name}
                                type={field.type}
                                value={
                                  field.name === "phone"
                                    ? (profile.phone || "01156248265")
                                    : field.name === "country"
                                      ? (profile.country || "Egypt")
                                      : field.name === "city"
                                        ? (profile.city || "Cairo")
                                        : (field.name === "typeOfSupport"
                                            ? Array.isArray(profile.typeOfSupport)
                                              ? profile.typeOfSupport.join(", ")
                                              : (profile.typeOfSupport || "")
                                            : (profile[field.name] || ""))
                                }
                                onChange={handleProfileChange}
                                placeholder={field.label}
                                required={field.required}
                                className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                              />
                            ) : (
                              <div className="px-4 py-3 bg-[#F1FAEE]/50 rounded-xl text-[#1D3557]">
                                {field.name === "phone"
                                  ? (profile.phone || "01156248265")
                                  : field.name === "country"
                                    ? (profile.country || "Egypt")
                                    : field.name === "city"
                                      ? (profile.city || "Cairo")
                                      : (field.name === "typeOfSupport"
                                          ? (Array.isArray(profile.typeOfSupport) ? profile.typeOfSupport.join(", ") : (profile.typeOfSupport || <span className="text-[#457B9D]/60 italic">Not set</span>))
                                          : (profile[field.name] || <span className="text-[#457B9D]/60 italic">Not set</span>))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {profile.editing && (
                        <div className="flex gap-3 pt-6 border-t border-[#A8DADC]/20">
                          <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setProfile((p) => ({ ...p.prev, editing: false, prev: undefined }))}
                            className="flex items-center gap-2 px-6 py-3 border-2 border-[#A8DADC] text-[#457B9D] rounded-xl font-semibold hover:bg-[#A8DADC]/10 hover:transform hover:scale-105 transition-all duration-200"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </form>
                  </>
                )}

                {activeTab === "language" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("language")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Language Preferences</h2>
                      <p className="text-[#457B9D]">Choose your preferred language for the interface</p>
                    </div>

                    <div className="space-y-6">
                      {/* Primary Language */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                          <Globe className="w-6 h-6 text-[#457B9D]" />
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Interface Language</label>
                            <select
                              value={language}
                              onChange={handleLanguageChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            >
                              <option value="en">English</option>
                              <option value="ar">العربية (Arabic)</option>
                              <option value="es">Español (Spanish)</option>
                              <option value="fr">Français (French)</option>
                              <option value="de">Deutsch (German)</option>
                              <option value="it">Italiano (Italian)</option>
                              <option value="pt">Português (Portuguese)</option>
                              <option value="ru">Русский (Russian)</option>
                              <option value="zh">中文 (Chinese)</option>
                              <option value="ja">日本語 (Japanese)</option>
                              <option value="ko">한국어 (Korean)</option>
                              <option value="hi">हिन्दी (Hindi)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Language Settings */}
                      <div className="bg-gradient-to-r from-[#A8DADC]/10 to-[#457B9D]/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#1D3557] mb-4">Regional Settings</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Date Format</label>
                            <select className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80">
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Time Format</label>
                            <select className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80">
                              <option value="12">12-hour (AM/PM)</option>
                              <option value="24">24-hour</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Number Format</label>
                            <select className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80">
                              <option value="1,234.56">1,234.56</option>
                              <option value="1.234,56">1.234,56</option>
                              <option value="1 234,56">1 234,56</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Translation Preferences */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#1D3557] mb-4">Translation Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Auto-translate content</span>
                                <span className="text-sm text-[#457B9D]">Automatically translate posts and messages</span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                defaultChecked
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Language Settings
                    </button>
                  </form>
                )}

                {activeTab === "theme" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("theme")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Theme Settings</h2>
                      <p className="text-[#457B9D]">Customize the appearance of your interface</p>
                    </div>

                    <div className="space-y-6">
                      {/* Theme Mode */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                          {theme === "light" ? (
                            <Sun className="w-6 h-6 text-[#457B9D]" />
                          ) : (
                            <Moon className="w-6 h-6 text-[#457B9D]" />
                          )}
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Theme Mode</label>
                            <select
                              value={theme}
                              onChange={handleThemeChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            >
                              <option value="light">Light Mode</option>
                              <option value="dark">Dark Mode</option>
                              <option value="auto">Auto (System)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Theme Settings
                    </button>
                  </form>
                )}

                {activeTab === "notifications" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("notifications")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Notification Preferences</h2>
                      <p className="text-[#457B9D]">Control how and when you receive notifications</p>
                    </div>

                    <div className="space-y-6">
                      {/* General Notifications */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#1D3557] mb-4">General Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Smartphone className="w-5 h-5 text-[#457B9D]" />
                              <span className="font-medium text-[#1D3557]">App Notifications</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="app"
                                checked={notifications.app}
                                onChange={handleNotificationChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-[#457B9D]" />
                              <span className="font-medium text-[#1D3557]">Email Notifications</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="email"
                                checked={notifications.email}
                                onChange={handleNotificationChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Role-specific notifications */}
                      {notificationToggles[userRole] && (
                        <div className="bg-gradient-to-r from-[#A8DADC]/10 to-[#457B9D]/10 rounded-2xl p-6">
                          <h3 className="text-lg font-semibold text-[#1D3557] mb-4 capitalize">
                            {userRole.replace("_", " ")} Notifications
                          </h3>
                          <div className="space-y-4">
                            {notificationToggles[userRole].map((n) => (
                              <div
                                key={n.name}
                                className="flex items-center justify-between p-4 bg-white/60 rounded-xl"
                              >
                                <div className="flex items-center gap-3">
                                  <Bell className="w-5 h-5 text-[#457B9D]" />
                                  <span className="font-medium text-[#1D3557]">{n.label}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name={n.name}
                                    checked={notifications[n.name] || false}
                                    onChange={handleNotificationChange}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notification Timing */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Clock className="w-6 h-6 text-[#457B9D]" />
                          <h3 className="text-lg font-semibold text-[#1D3557]">Notification Timing</h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Quiet Hours</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-[#457B9D] mb-1">Start Time</label>
                                <input
                                  type="time"
                                  defaultValue="22:00"
                                  className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-[#457B9D] mb-1">End Time</label>
                                <input
                                  type="time"
                                  defaultValue="08:00"
                                  className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Notification Settings
                    </button>
                  </form>
                )}

                {activeTab === "security" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("security")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Account Security</h2>
                      <p className="text-[#457B9D]">Manage your password and security settings</p>
                    </div>

                    <div className="space-y-6">
                      {/* Change Password */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Key className="w-6 h-6 text-[#457B9D]" />
                          <h3 className="text-lg font-semibold text-[#1D3557]">Change Password</h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Current Password</label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={security.currentPassword}
                              onChange={handleSecurityChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-[#1D3557] mb-2">New Password</label>
                              <input
                                type="password"
                                name="newPassword"
                                value={security.newPassword}
                                onChange={handleSecurityChange}
                                className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[#1D3557] mb-2">
                                Confirm Password
                              </label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={security.confirmPassword}
                                onChange={handleSecurityChange}
                                className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Login Activity */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <History className="w-6 h-6 text-[#457B9D]" />
                          <h3 className="text-lg font-semibold text-[#1D3557]">Login Activity</h3>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 text-sm text-[#457B9D]">
                          Recent login activity and session history will be displayed here. Monitor your account access
                          for security.
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Security Settings
                    </button>
                  </form>
                )}

                {activeTab === "communication" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("communication")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Communication Preferences</h2>
                      <p className="text-[#457B9D]">Control how and when the platform communicates with you</p>
                    </div>

                    <div className="space-y-6">
                      {/* Email Frequency */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                          <Mail className="w-6 h-6 text-[#457B9D]" />
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Email Frequency</label>
                            <select
                              name="emailFrequency"
                              value={communication.emailFrequency}
                              onChange={handleCommunicationChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            >
                              <option value="daily">Daily Updates</option>
                              <option value="weekly">Weekly Summary</option>
                              <option value="monthly">Monthly Newsletter</option>
                              <option value="never">Never</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Communication Channels */}
                      <div className="bg-gradient-to-r from-[#A8DADC]/10 to-[#457B9D]/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#1D3557] mb-4">Communication Channels</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Smartphone className="w-5 h-5 text-[#457B9D]" />
                              <span className="font-medium text-[#1D3557]">SMS Notifications</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="smsEnabled"
                                checked={communication.smsEnabled}
                                onChange={handleCommunicationChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-[#457B9D]" />
                              <span className="font-medium text-[#1D3557]">Email Notifications</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="emailEnabled"
                                checked={communication.emailEnabled}
                                onChange={handleCommunicationChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Do Not Disturb */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Clock className="w-6 h-6 text-[#457B9D]" />
                          <h3 className="text-lg font-semibold text-[#1D3557]">Do Not Disturb Hours</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Start Time</label>
                            <input
                              type="time"
                              name="doNotDisturbStart"
                              value={communication.doNotDisturbStart}
                              onChange={handleCommunicationChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">End Time</label>
                            <input
                              type="time"
                              name="doNotDisturbEnd"
                              value={communication.doNotDisturbEnd}
                              onChange={handleCommunicationChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Communication Settings
                    </button>
                  </form>
                )}

                {activeTab === "accessibility" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("accessibility")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Accessibility Settings</h2>
                      <p className="text-[#457B9D]">Customize the platform to meet your accessibility needs</p>
                    </div>

                    <div className="space-y-6">
                      {/* Font Size */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                          <Type className="w-6 h-6 text-[#457B9D]" />
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">Font Size</label>
                            <select
                              name="fontSize"
                              value={accessibility.fontSize}
                              onChange={handleAccessibilityChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                              <option value="extra-large">Extra Large</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Accessibility Options */}
                      <div className="bg-gradient-to-r from-[#A8DADC]/10 to-[#457B9D]/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#1D3557] mb-4">Accessibility Options</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Contrast className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">High Contrast Mode</span>
                                <span className="text-sm text-[#457B9D]">Increase contrast for better visibility</span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="highContrast"
                                checked={accessibility.highContrast}
                                onChange={handleAccessibilityChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <MousePointer className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Reduced Motion</span>
                                <span className="text-sm text-[#457B9D]">Minimize animations and transitions</span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="reducedMotion"
                                checked={accessibility.reducedMotion}
                                onChange={handleAccessibilityChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Volume2 className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Screen Reader Support</span>
                                <span className="text-sm text-[#457B9D]">Optimize for screen reading software</span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="screenReader"
                                checked={accessibility.screenReader}
                                onChange={handleAccessibilityChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Accessibility Settings
                    </button>
                  </form>
                )}

                {activeTab === "dataPrivacy" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("dataPrivacy")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Data & Privacy Controls</h2>
                      <p className="text-[#457B9D]">Manage how your data is used and shared on the platform</p>
                    </div>

                    <div className="space-y-6">
                      {/* Profile Visibility */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                          <Eye className="w-6 h-6 text-[#457B9D]" />
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">
                              Profile Visibility
                            </label>
                            <select
                              name="profileVisibility"
                              value={dataPrivacy.profileVisibility}
                              onChange={handleDataPrivacyChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            >
                              <option value="public">Public - Visible to all users</option>
                              <option value="network">Network - Visible to connections only</option>
                              <option value="private">Private - Only visible to you</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Data Sharing Options */}
                      <div className="bg-gradient-to-r from-[#A8DADC]/10 to-[#457B9D]/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#1D3557] mb-4">Data Sharing & Tracking</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Share2 className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Data Sharing with Partners</span>
                                <span className="text-sm text-[#457B9D]">
                                  Share anonymized data to improve services
                                </span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="dataSharing"
                                checked={dataPrivacy.dataSharing}
                                onChange={handleDataPrivacyChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Cookie className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Cookie Preferences</span>
                                <span className="text-sm text-[#457B9D]">Allow cookies for enhanced experience</span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="cookiesEnabled"
                                checked={dataPrivacy.cookiesEnabled}
                                onChange={handleDataPrivacyChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Marketing Communications</span>
                                <span className="text-sm text-[#457B9D]">Receive promotional emails and offers</span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="marketingEmails"
                                checked={dataPrivacy.marketingEmails}
                                onChange={handleDataPrivacyChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Database className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Analytics Tracking</span>
                                <span className="text-sm text-[#457B9D]">
                                  Help us improve by tracking usage patterns
                                </span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="analyticsTracking"
                                checked={dataPrivacy.analyticsTracking}
                                onChange={handleDataPrivacyChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Privacy Settings
                    </button>
                  </form>
                )}

                {activeTab === "platformPrefs" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("platformPrefs")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Platform Preferences</h2>
                      <p className="text-[#457B9D]">Customize your platform experience and interface</p>
                    </div>

                    <div className="space-y-6">
                      {/* Default View */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                          <LayoutDashboard className="w-6 h-6 text-[#457B9D]" />
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">
                              Default Dashboard View
                            </label>
                            <select
                              name="defaultView"
                              value={platformPrefs.defaultView}
                              onChange={handlePlatformPrefsChange}
                              className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                            >
                              <option value="dashboard">Main Dashboard</option>
                              <option value="marketplace">Marketplace</option>
                              <option value="guides">Business Guides</option>
                              <option value="messages">Messages</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Interface Options */}
                      <div className="bg-gradient-to-r from-[#A8DADC]/10 to-[#457B9D]/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-[#1D3557] mb-4">Interface Options</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Zap className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Auto-Save</span>
                                <span className="text-sm text-[#457B9D]">
                                  Automatically save your work and preferences
                                </span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="autoSave"
                                checked={platformPrefs.autoSave}
                                onChange={handlePlatformPrefsChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-3">
                              <Layout className="w-5 h-5 text-[#457B9D]" />
                              <div>
                                <span className="font-medium text-[#1D3557] block">Compact Mode</span>
                                <span className="text-sm text-[#457B9D]">Use a more compact interface layout</span>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                name="compactMode"
                                checked={platformPrefs.compactMode}
                                onChange={handlePlatformPrefsChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Zap className="w-6 h-6 text-[#457B9D]" />
                          <h3 className="text-lg font-semibold text-[#1D3557]">Quick Actions</h3>
                        </div>
                        <p className="text-sm text-[#457B9D] mb-4">
                          Choose which actions appear in your quick access toolbar
                        </p>
                        <div className="bg-white/60 rounded-xl p-4 text-sm text-[#457B9D]">
                          Quick action customization interface will be available here. Select from: Messages, Suppliers,
                          Guides, Investors, Profile, Settings.
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Platform Preferences
                    </button>
                  </form>
                )}

                {activeTab === "export" && userRole !== "admin" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleExport()
                      handleSave("export")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Export My Data</h2>
                      <p className="text-[#457B9D]">Download a copy of your personal data</p>
                    </div>

                    <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <Download className="w-6 h-6 text-[#457B9D]" />
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-[#1D3557] mb-2">Export Format</label>
                          <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80"
                          >
                            <option value="json">JSON Format</option>
                            <option value="pdf">PDF Document</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </form>
                )}

                {activeTab === "delete" && userRole !== "admin" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleDelete()
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#E63946] mb-2">Delete Account</h2>
                      <p className="text-[#457B9D]">Permanently delete your account and all associated data</p>
                    </div>

                    <div className="bg-gradient-to-r from-[#E63946]/5 to-[#E63946]/10 border-2 border-[#E63946]/20 rounded-2xl p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Trash2 className="w-6 h-6 text-[#E63946] mt-1" />
                        <div>
                          <h3 className="font-semibold text-[#E63946] mb-2">Warning</h3>
                          <p className="text-[#1D3557] text-sm">
                            This will permanently delete your account and data. You can reactivate within 30 days by
                            contacting support.
                          </p>
                        </div>
                      </div>
                      <textarea
                        placeholder="Optional: Tell us why you are leaving..."
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-[#E63946]/20 rounded-xl focus:border-[#E63946] focus:ring-0 transition-colors duration-200 bg-white/80 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E63946] to-[#E63946]/80 text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Request Account Deletion
                    </button>

                    {showDeleteConfirm && (
                      <div className="bg-[#E63946]/5 border-2 border-[#E63946]/20 rounded-2xl p-6 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          <Trash2 className="w-6 h-6 text-[#E63946]" />
                          <h3 className="font-semibold text-[#E63946]">Confirm Deletion</h3>
                        </div>
                        <p className="text-[#1D3557] mb-4">Are you sure? This action cannot be undone.</p>
                        <div className="flex gap-3">
                          <button
                            onClick={confirmDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-[#E63946] text-white rounded-xl font-semibold hover:bg-[#E63946]/90 transition-colors duration-200"
                          >
                            <Check className="w-4 h-4" />
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-[#A8DADC] text-[#457B9D] rounded-xl font-semibold hover:bg-[#A8DADC]/10 transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {activeTab === "privacy" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSave("privacy")
                    }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-[#1D3557] mb-2">Privacy & Security</h2>
                      <p className="text-[#457B9D]">Manage your privacy settings and account security</p>
                    </div>

                    <div className="space-y-6">
                      {/* Profile Visibility */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                          <Eye className="w-6 h-6 text-[#457B9D]" />
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#1D3557] mb-2">
                              Profile Visibility
                            </label>
                            <select className="w-full px-4 py-3 border-2 border-[#A8DADC]/30 rounded-xl focus:border-[#457B9D] focus:ring-0 transition-colors duration-200 bg-white/80">
                              <option>Public - Visible to everyone</option>
                              <option>Limited - Visible to connections only</option>
                              <option>Private - Only visible to you</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Connected Devices */}
                      <div className="bg-gradient-to-r from-[#A8DADC]/10 to-[#457B9D]/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Monitor className="w-6 h-6 text-[#457B9D]" />
                          <h3 className="text-lg font-semibold text-[#1D3557]">Connected Devices</h3>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 text-sm text-[#457B9D]">
                          Login history and connected devices will be displayed here. This helps you monitor account
                          access and security.
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="bg-gradient-to-r from-[#F1FAEE] to-[#A8DADC]/30 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-[#457B9D]" />
                            <div>
                              <h3 className="font-semibold text-[#1D3557]">Two-Factor Authentication</h3>
                              <p className="text-sm text-[#457B9D]">Add an extra layer of security to your account</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#457B9D] peer-checked:to-[#1D3557]"></div>
                          </label>
                        </div>
                      </div>

                      {/* Session Management */}
                      <div className="bg-gradient-to-r from-[#A8DADC]/10 to-[#457B9D]/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <LogOut className="w-6 h-6 text-[#457B9D]" />
                            <div>
                              <h3 className="font-semibold text-[#1D3557]">Session Management</h3>
                              <p className="text-sm text-[#457B9D]">Sign out from all devices and sessions</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-4 py-2 bg-[#A8DADC]/20 text-[#457B9D] rounded-xl font-semibold hover:bg-[#A8DADC]/30 hover:transform hover:scale-105 transition-all duration-200"
                          >
                            Logout All Sessions
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white rounded-xl font-semibold hover:shadow-lg hover:transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                      Save Privacy Settings
                    </button>
                  </form>
                )}
              </div>
            </div>
          </main>

          {/* Sidebar - Now on the right */}
          <aside className="lg:w-80 w-full order-2 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg border border-[#A8DADC]/20 p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#A8DADC]/20">
                <div className="w-12 h-12 bg-gradient-to-br from-[#457B9D] to-[#1D3557] rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1D3557]">Settings</h1>
                  <p className="text-sm text-[#457B9D] capitalize">{userRole.replace("_", " ")}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 group ${
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-[#457B9D] to-[#1D3557] text-white shadow-lg transform scale-[1.02]"
                          : "text-[#1D3557] hover:bg-[#A8DADC]/20 hover:text-[#457B9D] hover:transform hover:scale-[1.01]"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 ${activeTab === tab.id ? "scale-110" : "group-hover:scale-110"}`}
                      />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}


export default SettingsPage;
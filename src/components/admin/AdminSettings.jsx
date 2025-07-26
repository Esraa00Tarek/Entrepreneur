import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, 
  Shield, 
  Bell, 
  Upload, 
  Wrench, 
  FileText, 
  Save,
  Eye,
  EyeOff,
  Download,
  Trash2,
  Edit,
  Check,
  X
} from 'lucide-react';

// Add API base URL helper at the top
const API_BASE_URL = 'http://localhost:5000/api';

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'default', size = 'md', className = '', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export default function AdminSettings() {
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'Admin Dashboard',
    contactEmail: 'admin@example.com',
    logo: null
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    weeklyReports: false
  });

  // Upload Settings
  const [uploadSettings, setUploadSettings] = useState({
    maxFileSize: 10, // MB
    allowedFormats: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    maxFilesPerUpload: 5
  });

  // Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  // UI States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  // Add loading state for fetching settings
  const [loading, setLoading] = useState(true);

  // Fetch settings and audit logs on component mount
  useEffect(() => {
    fetchSettings();
    fetchAuditLogs();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        // Ensure backend returns the expected structure
        setGeneralSettings(prev => ({ ...prev, ...response.data.general }));
        setSecuritySettings(prev => ({ ...prev, ...response.data.security }));
        setNotificationSettings(prev => ({ ...prev, ...response.data.notifications }));
        setUploadSettings(prev => ({ ...prev, ...response.data.upload }));
        setMaintenanceMode(response.data.maintenanceMode || false);
      }
    } catch (err) {
      setSaveMessage('Failed to fetch settings.');
      setTimeout(() => setSaveMessage(''), 3000);
      console.error('Failed to fetch settings:', err);
    }
    setLoading(false);
  };

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`${API_BASE_URL}/activity-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        setAuditLogs(response.data);
      } else if (Array.isArray(response.data.logs)) {
        setAuditLogs(response.data.logs);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      setAuditLogs([]);
      setSaveMessage('Failed to fetch audit logs.');
      setTimeout(() => setSaveMessage(''), 3000);
      console.error('Failed to fetch audit logs:', err);
    }
  };

  // Handle file upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setGeneralSettings(prev => ({ ...prev, logo: file }));
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setSaveMessage('Passwords do not match!');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    if (securitySettings.newPassword.length < 8) {
      setSaveMessage('Password must be at least 8 characters!');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_BASE_URL}/admin/change-password`, {
        currentPassword: securitySettings.password,
        newPassword: securitySettings.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSecuritySettings(prev => ({
        ...prev,
        password: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordModal(false);
      setSaveMessage('Password changed successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to change password. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
      console.error('Failed to change password:', err);
    }
  };

  // Handle save all settings
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveMessage('');
    const token = localStorage.getItem('token');
    
    try {
      const formData = new FormData();
      
      // Add general settings
      formData.append('platformName', generalSettings.platformName);
      formData.append('contactEmail', generalSettings.contactEmail);
      if (generalSettings.logo) {
        formData.append('logo', generalSettings.logo);
      }
      
      // Add security settings
      formData.append('twoFactorEnabled', securitySettings.twoFactorEnabled);
      
      // Add notification settings
      Object.entries(notificationSettings).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      // Add upload settings
      formData.append('maxFileSize', uploadSettings.maxFileSize);
      formData.append('allowedFormats', JSON.stringify(uploadSettings.allowedFormats));
      formData.append('maxFilesPerUpload', uploadSettings.maxFilesPerUpload);
      
      // Add maintenance mode
      formData.append('maintenanceMode', maintenanceMode);
      
      await axios.put(`${API_BASE_URL}/admin/settings`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsSaving(false);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      fetchSettings(); // Refresh settings after save
    } catch (err) {
      setIsSaving(false);
      setSaveMessage('Failed to save settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
      console.error('Failed to save settings:', err);
    }
  };

  // Toggle maintenance mode
  const toggleMaintenanceMode = async () => {
    const token = localStorage.getItem('token');
    const newMode = !maintenanceMode;
    
    if (newMode) {
      if (!window.confirm('Are you sure you want to enable maintenance mode? This will restrict access to the platform.')) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to disable maintenance mode?')) {
        return;
      }
    }
    
    try {
      await axios.put(`${API_BASE_URL}/admin/maintenance-mode`, {
        enabled: newMode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMaintenanceMode(newMode);
      setSaveMessage('Maintenance mode updated.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to update maintenance mode. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
      console.error('Failed to toggle maintenance mode:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-2 md:px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-7 h-7 text-blue-600" />
          {/* <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2> */}
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {saveMessage}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <span className="text-lg text-gray-500">Loading settings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                <input
                  type="text"
                  value={generalSettings.platformName}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, platformName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={generalSettings.contactEmail}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="w-full"
              >
                Change Password
              </Button>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h4>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !value }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Upload Settings */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Upload Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size (MB)</label>
                <input
                  type="number"
                  value={uploadSettings.maxFileSize}
                  onChange={(e) => setUploadSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Files Per Upload</label>
                <input
                  type="number"
                  value={uploadSettings.maxFilesPerUpload}
                  onChange={(e) => setUploadSettings(prev => ({ ...prev, maxFilesPerUpload: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Maintenance Mode */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wrench className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">Temporarily disable platform access</p>
            </div>
          </div>
          <button
            onClick={toggleMaintenanceMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Audit Logs */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.user} • {log.ip}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{log.timestamp}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No activity logs found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={securitySettings.password}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={securitySettings.newPassword}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={securitySettings.confirmPassword}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={handlePasswordChange}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                Change Password
              </Button>
              <Button
                onClick={() => setShowPasswordModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
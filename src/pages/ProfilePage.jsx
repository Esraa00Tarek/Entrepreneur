import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
    location: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get user data from localStorage (simulate login info)
    const stored = JSON.parse(localStorage.getItem('user')) || {};
    setUser({
      name: stored.name || 'User Name',
      email: stored.email || 'user@email.com',
      role: stored.role || 'Entrepreneur',
      location: stored.location || 'Cairo, Egypt',
    });
  }, []);

  const handleEdit = () => {
    if (user.role.toLowerCase() === 'supplier') {
      navigate('/dashboard/supplier/settings');
    } else {
      navigate('/dashboard/entrepreneur/settings');
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: '#EEF8F7' }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mt-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 rounded-full bg-[#A8DADC] flex items-center justify-center mb-4">
              <img src="/placeholder-user.jpg" alt="User Avatar" className="w-24 h-24 rounded-full object-cover" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#1D3557] mb-1">{user.name}</h1>
            <p className="text-[#457B9D] text-lg">{user.email}</p>
            <button
              onClick={handleEdit}
              className="mt-4 px-6 py-2 bg-[#457B9D] text-white rounded-lg font-semibold text-base hover:bg-[#1D3557] transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1D3557] mb-2">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-[#457B9D] font-medium mb-1">Full Name</div>
                  <div className="text-gray-900 font-semibold">{user.name}</div>
                </div>
                <div>
                  <div className="text-sm text-[#457B9D] font-medium mb-1">Email</div>
                  <div className="text-gray-900 font-semibold">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-[#457B9D] font-medium mb-1">Role</div>
                  <div className="text-gray-900 font-semibold">{user.role}</div>
                </div>
                <div>
                  <div className="text-sm text-[#457B9D] font-medium mb-1">Location</div>
                  <div className="text-gray-900 font-semibold">{user.location}</div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1D3557] mb-2">About</h2>
              <p className="text-[#457B9D]">This is a placeholder for the user's bio or description. You can edit this section to add more details about the user.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
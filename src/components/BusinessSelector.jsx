import React, { useState } from 'react';

const BusinessSelector = ({ businesses, selectedBusinessId, onChange, loading }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-blue-700 font-medium">Loading businesses...</span>
      </div>
    );
  }
  if (!businesses || businesses.length === 0) {
    return (
      <div className="py-4 text-gray-500 text-sm">No businesses found. Please add a business to get started.</div>
    );
  }
  return (
    <div className="relative" style={{ minWidth: 220, maxWidth: 320 }}>
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#457B9D] text-[#457B9D] bg-white hover:bg-[#457B9D] hover:text-white transition-all w-full justify-between whitespace-nowrap"
        style={{ minWidth: 220, maxWidth: 320 }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="truncate block" style={{ minWidth: 120, maxWidth: 220 }}>
          {businesses.find(b => b.id === selectedBusinessId)?.name}
        </span>
        <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {dropdownOpen && (
        <div className="absolute left-0 mt-2 w-full bg-white border rounded-lg shadow-lg z-10" style={{ maxHeight: 220, overflowY: 'auto' }}>
          {businesses.map(biz => (
            <div
              key={biz.id}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-[#457B9D]/10 ${selectedBusinessId === biz.id ? 'bg-[#457B9D]/20 text-[#457B9D]' : 'text-[#457B9D]'}`}
              onClick={() => { onChange(biz.id); setDropdownOpen(false); }}
            >
              {biz.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessSelector; 
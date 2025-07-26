import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Calendar, Target, TrendingUp } from 'lucide-react';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/business/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBusiness(res.data.data || res.data.business);
      } catch (err) {
        setError('Business not found or you are not authorized.');
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-[#457B9D] font-bold">Loading business details...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;
  if (!business) return <div className="p-8 text-center text-gray-500">No business found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg mt-8">
      <div className="flex items-center gap-4 mb-6">
        <BarChart3 className="w-10 h-10 text-[#457B9D]" />
        <div>
          <h1 className="text-2xl font-bold text-[#1D3557]">{business.name}</h1>
          <div className="text-sm text-gray-500">{business.category}</div>
        </div>
      </div>
      <div className="mb-4">
        <span className="font-semibold text-[#457B9D]">Status:</span> {business.stage || business.status || 'N/A'}
      </div>
      <div className="mb-4">
        <span className="font-semibold text-[#457B9D]">Description:</span>
        <div className="text-gray-700 mt-1">{business.description}</div>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <Calendar className="w-5 h-5 text-[#457B9D]" />
        <span className="text-sm text-gray-600">Created: {business.createdAt ? new Date(business.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <TrendingUp className="w-5 h-5 text-[#457B9D]" />
        <span className="text-sm text-gray-600">Progress: {business.progress !== undefined ? business.progress + '%' : 'N/A'}</span>
      </div>
      {business.milestones && business.milestones.length > 0 && (
        <div className="mb-4">
          <span className="font-semibold text-[#457B9D]">Milestones:</span>
          <ul className="list-disc ml-6 mt-2 text-gray-700">
            {business.milestones.map((m, idx) => (
              <li key={m._id || idx}>{m.title || m}</li>
            ))}
          </ul>
        </div>
      )}
      {/* يمكنك إضافة المزيد من التفاصيل هنا */}
    </div>
  );
};

export default BusinessDetails; 
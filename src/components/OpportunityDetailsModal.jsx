import React from 'react';
import { X, Star, Users, DollarSign, TrendingUp, Briefcase, MapPin } from 'lucide-react';

const OpportunityDetailsModal = ({ opportunity, isOpen, onClose }) => {
  if (!isOpen || !opportunity) return null;

  // Extract fields from deal/project
  const {
    relatedBusiness,
    dealType,
    status,
    amount,
    participants,
    agreementDate,
    description,
    milestones = [],
  } = opportunity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors duration-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div className="p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="text-3xl font-bold text-gray-900">{relatedBusiness?.name || 'No Business'}</div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                status === 'confirmed' ? 'bg-green-100 text-green-700' :
                status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>{status}</span>
            </div>
            <div className="mb-2 text-gray-600 font-medium">{dealType}</div>
            <div className="mb-6 text-gray-700">{description}</div>
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Amount</div>
              <div className="text-2xl font-bold text-[#1D3557]">{amount || 'N/A'}</div>
            </div>
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Participants</div>
              <div className="flex flex-wrap gap-2">
                {(participants || []).map((p, i) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    {p.user?.name || p.user?.fullName || p.user?.username || 'Unknown'}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Agreement Date</div>
              <div className="text-gray-700">{agreementDate ? new Date(agreementDate).toLocaleDateString() : 'N/A'}</div>
            </div>
            {milestones && milestones.length > 0 && (
              <div className="mb-6">
                <div className="text-lg font-semibold text-[#457B9D] mb-2">Milestones</div>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  {milestones.map((m, idx) => (
                    <li key={m._id || idx}>
                      {typeof m === 'string' ? m : m.title || 'No title'}
                      {m.status ? <span className="ml-2 text-xs text-gray-500">({m.status})</span> : null}
                      {m.date ? <span className="ml-2 text-xs text-gray-400">[{new Date(m.date).toLocaleDateString()}]</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailsModal; 
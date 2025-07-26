import React, { useState } from 'react';
import { Eye, Edit, Trash2, Calendar, DollarSign, Package, TrendingUp, MoreVertical, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons = {
  Pending: '⏳',
  Approved: '✅',
  Rejected: '❌',
};

const typeBadge = (type, offerType) => {
  if (offerType === 'Supply') {
    return (
      <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
        <Package className="w-3 h-3" />
        <span>Supply</span>
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium border border-purple-200">
        <TrendingUp className="w-3 h-3" />
        <span>Investment</span>
      </span>
    );
  }
};

const RequestCard = ({ request, onEdit, onDelete, onView }) => {
  const [showMenu, setShowMenu] = useState(false);

  const isSupply = request.offerType === 'Supply';
  const isProduct = isSupply && request.supplyType === 'Product';
  const isInvestment = request.offerType === 'Investment';

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
              {request.title}
            </h3>
            <div className="flex items-center space-x-3">
              {typeBadge(request.type, request.offerType)}
              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
                <span>{statusIcons[request.status]}</span>
                <span>{request.status}</span>
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onView(request);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(request.id, request);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(request.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details for Supply */}
        {isSupply && (
          <div className="mb-4 space-y-1 text-sm text-gray-700">
            <div><span className="font-semibold">Category:</span> {request.category}</div>
            <div><span className="font-semibold">Supply Type:</span> {request.supplyType}</div>
            {isProduct && request.quantity && (
              <div><span className="font-semibold">Quantity:</span> {request.quantity}</div>
            )}
            <div><span className="font-semibold">Deadline:</span> {request.deadline}</div>
            <div><span className="font-semibold">Description:</span> {request.description}</div>
          </div>
        )}
        {/* Details for Investment */}
        {isInvestment && (
          <div className="mb-4 space-y-1 text-sm text-gray-700">
            <div><span className="font-semibold">Category:</span> {request.category}</div>
            <div><span className="font-semibold">Amount:</span> {request.amount}</div>
            <div><span className="font-semibold">Purpose:</span> {request.purpose}</div>
            <div><span className="font-semibold">Summary:</span> {request.summary}</div>
            <div><span className="font-semibold">Return/Equity Details:</span> {request.returnDetails}</div>
          </div>
        )}

        {/* Details */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(request.date).toLocaleDateString()}</span>
            </div>
            {request.amount && !isInvestment && (
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${request.amount.toLocaleString()}</span>
              </div>
            )}
          </div>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            {request.category}
          </span>
        </div>
        <button
          className="px-4 py-2 rounded-lg font-medium transition-all mt-2 bg-[#457B9D] text-white hover:bg-[#1D3557]"
          onClick={() => onView(request)}
        >
          See Offers
        </button>
      </div>
    </div>
  );
};

const RequestList = ({ requests, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('grid');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleView = (request) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-12 text-center">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
        <p className="text-gray-500">Create your first request to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* View Toggle removed, and request count removed as requested */}

        {/* Requests Grid/List */}
        <div className={viewType === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {requests.map((request) => (
            <RequestCard
              key={request._id || request.id}
              request={request}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={handleView}
            />
          ))}
        </div>
      </div>

      {/* Modal for viewing request details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedRequest.title}</h3>
                <div className="flex items-center space-x-3 mb-4">
                  {typeBadge(selectedRequest.type, selectedRequest.offerType)}
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedRequest.status]}`}>
                    <span>{statusIcons[selectedRequest.status]}</span>
                    <span>{selectedRequest.status}</span>
                  </span>
                </div>
              </div>

              {selectedRequest.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>
              )}
              {request.quantity && (
                <div className="flex items-center space-x-1">
                  <Package className="w-4 h-4" />
                  <span>Qty: {request.quantity}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Date Created</h4>
                  <p className="text-gray-600">{new Date(selectedRequest.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Category</h4>
                  <p className="text-gray-600">{selectedRequest.category}</p>
                </div>
                {selectedRequest.amount && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Amount</h4>
                    <p className="text-gray-600">${selectedRequest.amount.toLocaleString()}</p>
                  </div>
                )}
                {selectedRequest.quantity && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Quantity</h4>
                    <p className="text-gray-600">{selectedRequest.quantity}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestList;
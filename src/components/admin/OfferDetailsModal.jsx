import React from 'react';
import { X, Calendar, Clock, DollarSign, FileText, Download, User } from 'lucide-react';
import axios from 'axios';

export default function OfferDetailsModal({ isOpen, onClose, offer, onStatusChange }) {
  if (!isOpen || !offer) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://backendelevante-production.up.railway.app/api/supplier-offers/${offer.id}/attachments/${filename}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download file.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Offer Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Vendor Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Vendor Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vendor Name</p>
                <p className="font-medium text-gray-900">{offer.vendorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendor ID</p>
                <p className="font-medium text-gray-900">#{offer.vendorId}</p>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Request Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Request Title</p>
                <p className="font-medium text-gray-900">{offer.requestTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Request ID</p>
                <p className="font-medium text-gray-900">#{offer.requestId}</p>
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-600">Proposed Price</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{offer.proposedPrice}</p>
              {/* Profit/Commission Section */}
              {offer.proposedPrice && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div></div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700 font-medium">Platform Commission (2%)</p>
                    <p className="text-lg font-bold text-yellow-800">
                      ${ (Number(offer.proposedPrice) * 0.02).toFixed(2) }
                    </p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-medium">Net Amount</p>
                    <p className="text-lg font-bold text-green-800">
                      ${ (Number(offer.proposedPrice) * 0.98).toFixed(2) }
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500 text-center">
                * A 2% platform commission is applied to every successful deal.
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-600">Delivery Time</p>
              </div>
              <p className="text-xl font-semibold text-blue-700">{offer.deliveryTime}</p>
            </div>
          </div>

          {/* Status and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Current Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(offer.status)}`}>
                {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600">Submission Date</p>
              </div>
              <p className="font-medium text-gray-900">
                {new Date(offer.submissionDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Attachments</h3>
            </div>
            {offer.attachments && offer.attachments.length > 0 ? (
              <div className="space-y-2">
                {offer.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{file}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 transition-colors" onClick={() => handleDownload(file)}>
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No attachments provided</p>
            )}
          </div>

          {/* Actions */}
          {offer.status === 'pending' && (
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onStatusChange(offer.id, 'accepted');
                  // توجيه المستخدم تلقائيًا لصفحة الدفع مع البيانات
                  setTimeout(() => {
                    window.location.href = '/payment?amount=' + encodeURIComponent(offer.proposedPrice) + '&otherParty=' + encodeURIComponent(offer.vendorName) + '&userType=Supplier&role=Payer';
                  }, 500);
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Accept Offer
              </button>
              <button
                onClick={() => onStatusChange(offer.id, 'rejected')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Reject Offer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
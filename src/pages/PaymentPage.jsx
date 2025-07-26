import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DollarSign, User, FilePlus, AlertTriangle } from 'lucide-react';

// Use Vite env variable or fallback
const API_BASE = 'http://localhost:5000';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
  const [proofUrl, setProofUrl] = useState('');
  const [uploadingProofId, setUploadingProofId] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeId, setDisputeId] = useState(null);

  // Helper: show toast
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3500);
  };

  // Fetch user balance and deals/orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        // Get user info (balance)
        const userRes = await axios.get(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBalance(userRes.data.user.virtualBalance || 0);
        // Get available deals/orders (simulate with deals for now)
        const dealsRes = await axios.get(`${API_BASE}/api/deals/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDeals(dealsRes.data.data || []);
        // Get withdrawal history
        const wRes = await axios.get(`${API_BASE}/api/withdrawals/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWithdrawals(wRes.data.data || []);
      } catch (err) {
        if (err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          showToast('error', 'Failed to load payment data.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Handle withdrawal request
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!selectedDeal || !amount || !reason) {
      showToast('error', 'Please fill all fields.');
      return;
    }
    if (Number(amount) <= 0 || Number(amount) > balance) {
      showToast('error', 'Invalid amount.');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/withdrawals`, {
        dealId: selectedDeal,
        amount: Number(amount),
        reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('success', 'Withdrawal request submitted!');
      setAmount('');
      setReason('');
      setSelectedDeal('');
      // Refresh withdrawals
      const wRes = await axios.get(`${API_BASE}/api/withdrawals/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawals(wRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        showToast('error', err.response?.data?.message || 'Failed to submit withdrawal.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle proof upload
  const handleUploadProof = async (withdrawalId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!proofUrl) {
      showToast('error', 'Please enter proof URL.');
      return;
    }
    try {
      setUploadingProofId(withdrawalId);
      await axios.post(`${API_BASE}/api/withdrawals/${withdrawalId}/proof`, {
        url: proofUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('success', 'Proof uploaded successfully!');
      setProofUrl('');
      setUploadingProofId(null);
      // Refresh withdrawals
      const wRes = await axios.get(`${API_BASE}/api/withdrawals/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawals(wRes.data.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        showToast('error', err.response?.data?.message || 'Failed to upload proof.');
      }
      setUploadingProofId(null);
    }
  };

  // Handle open dispute
  const handleOpenDispute = async (withdrawalId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!disputeReason) {
      showToast('error', 'Please enter dispute reason.');
      return;
    }
    try {
      await axios.post(`${API_BASE}/api/disputes`, {
        type: 'withdrawal',
        targetId: withdrawalId,
        reason: disputeReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('success', 'Dispute opened successfully!');
      setDisputeReason('');
      setDisputeId(null);
    } catch (err) {
      if (err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        showToast('error', err.response?.data?.message || 'Failed to open dispute.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Withdraw Funds</h2>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900">Available Balance:</span>
          <span className="text-2xl font-bold text-green-700">${balance.toLocaleString()}</span>
        </div>
        <form className="mb-8" onSubmit={handleWithdraw}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Deal</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={selectedDeal}
              onChange={e => setSelectedDeal(e.target.value)}
              required
            >
              <option value="">-- Select a deal --</option>
              {deals.map(deal => (
                <option key={deal._id} value={deal._id}>
                  {deal.relatedBusiness?.name || 'Deal'} - ${deal.amount}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min={1}
              max={balance}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#457B9D] text-white rounded-lg font-semibold text-lg hover:bg-[#1D3557] transition-colors shadow"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Withdraw'}
          </button>
        </form>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Withdrawal History</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deal</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-6">No withdrawals yet.</td>
                </tr>
              ) : (
                withdrawals.map(w => (
                  <tr key={w._id}>
                    <td className="px-4 py-2">{w.dealId}</td>
                    <td className="px-4 py-2 font-bold">${w.amount}</td>
                    <td className="px-4 py-2">{w.status}</td>
                    <td className="px-4 py-2 text-xs">{w.reason}</td>
                    <td className="px-4 py-2 space-x-2">
                      {w.status === 'approved' && (
                        <>
                          <input
                            type="text"
                            placeholder="Proof URL"
                            className="px-2 py-1 border rounded text-xs mb-1"
                            value={uploadingProofId === w._id ? proofUrl : ''}
                            onChange={e => {
                              setProofUrl(e.target.value);
                              setUploadingProofId(w._id);
                            }}
                          />
                          <button
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                            onClick={() => handleUploadProof(w._id)}
                            disabled={uploadingProofId === w._id && !proofUrl}
                          >
                            Upload Proof
                          </button>
                        </>
                      )}
                      <button
                        className="px-2 py-1 bg-yellow-600 text-white rounded text-xs"
                        onClick={() => { setDisputeId(w._id); }}
                      >
                        Open Dispute
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Dispute Modal */}
        {disputeId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full relative">
              <button onClick={() => setDisputeId(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-600" /> Open Dispute</h2>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                placeholder="Enter dispute reason..."
                value={disputeReason}
                onChange={e => setDisputeReason(e.target.value)}
              />
              <button
                className="w-full py-2 bg-yellow-600 text-white rounded-lg font-semibold text-lg hover:bg-yellow-700 transition-colors"
                onClick={() => handleOpenDispute(disputeId)}
              >
                Submit Dispute
              </button>
            </div>
          </div>
        )}
        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-lg animate-fade-in ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
import React, { useEffect, useState } from 'react';
import { DollarSign, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const WALLET_KEY = 'demo_wallet_balance';
const TX_KEY = 'demo_wallet_transactions';

function getInitialBalance() {
  return Number(localStorage.getItem(WALLET_KEY)) || 0;
}
function getInitialTransactions() {
  try {
    return JSON.parse(localStorage.getItem(TX_KEY)) || [];
  } catch {
    return [];
  }
}

const WalletPage = () => {
  const [balance, setBalance] = useState(getInitialBalance());
  const [transactions, setTransactions] = useState(getInitialTransactions());

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(WALLET_KEY, balance);
  }, [balance]);
  useEffect(() => {
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Simulate receiving a payment
  const handleReceive = () => {
    const amount = Math.floor(Math.random() * 500) + 50;
    const tx = {
      id: Date.now(),
      type: 'credit',
      amount,
      from: 'Demo User',
      date: new Date().toISOString(),
      description: 'Test payment received'
    };
    setBalance(b => b + amount);
    setTransactions(txs => [tx, ...txs]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-2">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">My Wallet</h2>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-xl font-semibold text-gray-900">Balance:</span>
          </div>
          <span className="text-2xl font-bold text-green-700">${balance.toLocaleString()}</span>
        </div>
        <button
          className="w-full mb-6 py-2 bg-[#457B9D] text-white rounded-lg font-semibold text-lg hover:bg-[#1D3557] transition-colors shadow"
          onClick={handleReceive}
        >
          Simulate Payment Received
        </button>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From/To</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-6">No transactions yet.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="px-4 py-2">
                      {tx.type === 'credit' ? (
                        <span className="flex items-center gap-1 text-green-700 font-medium"><ArrowDownCircle className="w-4 h-4" /> Credit</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-700 font-medium"><ArrowUpCircle className="w-4 h-4" /> Debit</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-bold">${tx.amount}</td>
                    <td className="px-4 py-2">{tx.from || tx.to || '-'}</td>
                    <td className="px-4 py-2 text-xs">{new Date(tx.date).toLocaleString()}</td>
                    <td className="px-4 py-2 text-xs">{tx.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WalletPage; 
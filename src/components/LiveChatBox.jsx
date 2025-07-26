// src/components/LiveChatBox.jsx
// Extracted live chat box for SupportPage
import React from 'react';
import { X, Send } from 'lucide-react';

const LiveChatBox = ({ isOpen, onClose, messages, newMessage, setNewMessage, handleSendMessage, handleKeyPress }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed bottom-8 right-8 z-50 w-96 max-w-full bg-white rounded-2xl shadow-2xl border border-[#A8DADC] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#A8DADC] bg-[#457B9D] rounded-t-2xl">
        <span className="font-bold text-white">Live Chat Support</span>
        <button onClick={onClose} className="text-white hover:text-[#A8DADC] transition"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 320 }}>
        {messages.map((msg, idx) => (
          <div key={msg._id || msg.id || idx} className={`flex ${msg.sender === 'user' || msg.senderId === (msg.userId || msg.senderId) ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-2 shadow text-sm max-w-[75%] ${msg.sender === 'user' || msg.senderId === (msg.userId || msg.senderId) ? 'bg-[#A8DADC] text-[#1D3557]' : 'bg-[#F1FAEE] text-[#457B9D]'}`}>
              <span>{msg.content || msg.text}</span>
              <div className="text-xs text-gray-400 mt-1 text-right">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : (msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString() : msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-[#A8DADC] bg-[#F1FAEE] rounded-b-2xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 rounded-full border border-[#A8DADC] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button
            onClick={handleSendMessage}
            className="bg-[#457B9D] hover:bg-[#1D3557] text-white rounded-full p-2 transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChatBox;

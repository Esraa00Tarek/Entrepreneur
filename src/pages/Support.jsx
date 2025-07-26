import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Phone, HelpCircle, Clock, Users, Shield } from 'lucide-react';
import LiveChatBox from '../components/LiveChatBox';
import faqsData from '../components/faqsData';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

// SupportPage: Enhanced and refactored
const SupportPage = ({ onMessageSend, setActiveTab }) => {
  // Detect user role
  const userRole = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return userObj.role || 'entrepreneur';
      }
    } catch (e) {}
    return 'entrepreneur';
  }, []);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // جلب ثريد الدعم للمستخدم
  useEffect(() => {
    if (!isChatOpen) return;
    const fetchSupportThread = async () => {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) return;
      try {
        // جلب كل الثريدات للمستخدم
        const res = await axios.get(`${API_BASE}/messages/threads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // ابحث عن ثريد الدعم
        let supportThread = (res.data.data.threads || []).find(t => t.type === 'support');
        setThread(supportThread || null);
        if (supportThread) {
          // جلب الرسائل
          const resMsg = await axios.get(`${API_BASE}/messages/thread/${supportThread._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMessages(resMsg.data.data.messages.reverse());
        } else {
          setMessages([]);
        }
      } catch (err) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSupportThread();
  }, [isChatOpen]);

  // socket.io: استقبال الرسائل الجديدة
  useEffect(() => {
    if (!thread || !isChatOpen) return;
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) return;
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;
    socket.emit('joinThread', { threadId: thread._id });
    socket.on('receiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, [thread, isChatOpen]);

  // إرسال رسالة دعم
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) return;
    try {
      let payload = {
        content: newMessage,
        type: 'support',
      };
      if (thread) payload.threadId = thread._id;
      const res = await axios.post(`${API_BASE}/messages`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => [...prev, res.data.data.message]);
      setNewMessage('');
      // إذا لم يكن هناك ثريد دعم، أعد جلبه بعد أول رسالة
      if (!thread) {
        setTimeout(() => {
          setIsChatOpen(false);
          setIsChatOpen(true);
        }, 500);
      }
    } catch (err) {}
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // FAQs based on userRole from imported data
  const getRoleBasedFAQs = () => faqsData[userRole] || faqsData.entrepreneur;


  const getRoleColor = () => {
    switch (userRole) {
      case 'entrepreneur': return 'text-teal-600';
      case 'investor': return 'text-[#1D3557]';
      case 'supplier': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleBg = () => {
    switch (userRole) {
      case 'entrepreneur': return 'bg-teal-500';
      case 'investor': return 'bg-[#457B9D]';
      case 'supplier': return 'bg-purple-500';
      default: return 'bg-[#457B9D]';
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF8F7] p-6">
      <div className="px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Icon removed as requested */}
          <h1 className="text-5xl font-bold text-[#1D3557] mb-6 leading-tight">
            How can we help you today?
          </h1>
          <p className="text-xl text-[#457B9D] max-w-3xl mx-auto leading-relaxed">
            Our dedicated support team is here to ensure your success on our platform. Whether you're just getting started or need advanced assistance, we've got you covered with comprehensive support resources.
          </p>
        </div>

        {/* Support Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white hover:border-[#A8DADC]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A8DADC] rounded-full mb-4">
              <Clock className="w-8 h-8 text-[#1D3557]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D3557] mb-2">24/7</h3>
            <p className="text-[#457B9D]">Support Available</p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white hover:border-[#A8DADC]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A8DADC] rounded-full mb-4">
              <Users className="w-8 h-8 text-[#1D3557]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D3557] mb-2">50K+</h3>
            <p className="text-[#457B9D]">Happy Users</p>
          </div>
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white hover:border-[#A8DADC]">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A8DADC] rounded-full mb-4">
              <Shield className="w-8 h-8 text-[#1D3557]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1D3557] mb-2">99%</h3>
            <p className="text-[#457B9D]">Issue Resolution</p>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <button
            onClick={() => setIsChatOpen(true)}
            className="group flex items-center justify-center space-x-4 p-8 bg-[#457B9D] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:bg-[#1D3557] border-2 border-[#457B9D] hover:border-[#A8DADC]"
          >
            <MessageSquare className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
            <div className="text-left">
              <div className="text-xl font-bold text-white group-hover:text-[#A8DADC] transition-colors duration-300">Live Chat</div>
              <div className="text-[#A8DADC] group-hover:text-white transition-colors duration-300">Get instant support</div>
            </div>
          </button>

          <a
            href="mailto:support@startup-platform.com"
            className="group flex items-center justify-center space-x-4 p-8 bg-[#457B9D] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:bg-[#1D3557] border-2 border-[#457B9D] hover:border-[#A8DADC]"
          >
            <Mail className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
            <div className="text-left">
              <div className="text-xl font-bold text-white group-hover:text-[#A8DADC] transition-colors duration-300">Email Support</div>
              <div className="text-[#A8DADC] group-hover:text-white transition-colors duration-300">Detailed assistance</div>
            </div>
          </a>

          <a
            href="https://wa.me/201234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center space-x-4 p-8 bg-[#457B9D] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:bg-[#1D3557] border-2 border-[#457B9D] hover:border-[#A8DADC]"
          >
            <Phone className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
            <div className="text-left">
              <div className="text-xl font-bold text-white group-hover:text-[#A8DADC] transition-colors duration-300">WhatsApp</div>
              <div className="text-[#A8DADC] group-hover:text-white transition-colors duration-300">Quick messaging</div>
            </div>
          </a>
        </div>

        {/* Live Chat Box (extracted) */}
        <LiveChatBox
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
        />

        {/* FAQs Section */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-[#A8DADC]">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#A8DADC] rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-[#1D3557]" />
            </div>
            <h2 className="text-3xl font-bold text-[#1D3557] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#457B9D] text-lg max-w-2xl mx-auto">
              Find quick answers to common questions about our platform and services
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {getRoleBasedFAQs().map((faq, index) => (
              <div key={index} className="group border-2 border-[#A8DADC] rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-br from-white to-[#EEF8F7] hover:from-[#EEF8F7] hover:to-[#A8DADC] hover:border-[#457B9D]">
                <h3 className="text-xl font-bold text-[#1D3557] mb-4 group-hover:text-[#457B9D] transition-colors duration-300 leading-tight">
                  {faq.question}
                </h3>
                <p className="text-[#457B9D] leading-relaxed group-hover:text-[#1D3557] transition-colors duration-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Policies Section */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-[#A8DADC] mt-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#457B9D] to-[#A8DADC] rounded-full mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[#1D3557] mb-4">Usage Policies</h2>
            <p className="text-[#457B9D] text-lg max-w-2xl mx-auto">Learn about the terms and policies that ensure you a safe and reliable experience on our platform.</p>
          </div>
          <div className="flex flex-col md:flex-row justify-center gap-8">
              {/* Use dashboard tab navigation if inside dashboard */}
            <Link
                to="#"
                onClick={e => {
                  e.preventDefault();
                  if (typeof setActiveTab === 'function') setActiveTab('terms');
                }}
              className="flex-1 text-center py-6 px-8 rounded-2xl bg-gradient-to-r from-[#A8DADC] to-[#457B9D] text-white font-bold text-xl shadow-lg hover:from-[#457B9D] hover:to-[#A8DADC] transition-all duration-300 border-2 border-[#A8DADC] hover:border-[#457B9D]"
            >
              Terms of Use
            </Link>
            <Link
                to="#"
                onClick={e => {
                  e.preventDefault();
                  if (typeof setActiveTab === 'function') setActiveTab('privacy');
                }}
              className="flex-1 text-center py-6 px-8 rounded-2xl bg-gradient-to-r from-[#A8DADC] to-[#457B9D] text-white font-bold text-xl shadow-lg hover:from-[#457B9D] hover:to-[#A8DADC] transition-all duration-300 border-2 border-[#A8DADC] hover:border-[#457B9D]"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Contact Information Footer (summary only, no animation) */}
        <div className="mt-16 bg-gradient-to-r from-[#457B9D] to-[#1D3557] rounded-2xl p-10 text-center shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-6">
            Your Success is Our Priority
          </h3>
          <p className="text-[#A8DADC] text-lg mb-2 max-w-2xl mx-auto leading-relaxed whitespace-nowrap">
            We’re always happy to support you just reach out through any of the available channels.
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
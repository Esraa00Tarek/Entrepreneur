import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  User,
  Package,
  Users,
  MessageCircle,
  ExternalLink,
  Clock,
  AlertCircle,
  UserCheck,
  Mail
} from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('deal'); // 'deal' or 'inquiry'
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [adminId, setAdminId] = useState(null); // adminId fetched dynamically

  const BASE_URL = 'http://localhost:5000';

  // Read URL parameters
  const chatId = searchParams.get('chatId');
  const tabType = searchParams.get('tab');
  const partnerId = searchParams.get('partner');
  const offerId = searchParams.get('offerId');

  // Set active tab based on URL parameter
  useEffect(() => {
    if (tabType && (tabType === 'deal' || tabType === 'inquiry')) {
      setActiveTab(tabType);
    }
  }, [tabType]);

  // Fetch threads from backend
  useEffect(() => {
    setLoading(true);
    const fetchThreads = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/messages/threads`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data.data?.threads || res.data.threads || []);
        if ((res.data.data?.threads || res.data.threads || []).length > 0 && !selectedConversation) {
          setSelectedConversation((res.data.data?.threads || res.data.threads)[0]);
        }
      } catch (err) {
        // You can display an error message here
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, [location.search]);

  // Fetch adminId dynamically on first load
  useEffect(() => {
    const fetchAdminId = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BASE_URL}/api/users?role=admin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.data && res.data.data.users && res.data.data.users.length > 0) {
          setAdminId(res.data.data.users[0]._id);
        }
      } catch (err) {
        // You can put adminId here temporarily if the fetch fails
        // setAdminId('ADMIN_ID_HERE');
      }
    };
    fetchAdminId();
  }, []);

  // Fetch messages from backend
  const fetchMessages = async (threadId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/messages/thread/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedConversation(conv => ({ ...conv, messages: res.data.data?.messages || res.data.messages || [] }));
    } catch (err) {
      // You can display an error message here
    }
  };

  // Select conversation based on URL parameter
  useEffect(() => {
    if (chatId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.id === chatId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [chatId, conversations]);

  // When partner and offerId are in parameters, find or create conversation
  useEffect(() => {
    if (partnerId && offerId && conversations.length > 0) {
      // Find matching thread
      let conversation = conversations.find(conv =>
        conv.participants?.some(p => p._id === partnerId) && conv.relatedOfferId === offerId
      );
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversation._id || conversation.id);
      } else {
        // Create first message to start conversation
        const token = localStorage.getItem('token');
        axios.post(`${BASE_URL}/api/messages`, {
          receiverId: partnerId,
          relatedOfferId: offerId,
          type: 'offer-negotiation',
          content: 'Hi, I want to discuss this offer.',
        }, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          // Re-fetch threads after creation
          setTimeout(() => {
            window.location.reload();
          }, 500);
        });
      }
    }
  }, [partnerId, offerId, conversations]);

  // Set up socket.io when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !selectedConversation._id) return;
    const token = localStorage.getItem('token');
    const s = io(BASE_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket'],
    });
    setSocket(s);
    s.emit('joinThread', { threadId: selectedConversation._id });
    s.on('receiveMessage', (msg) => {
      setSelectedConversation((conv) => ({ ...conv, messages: [...(conv.messages || []), msg] }));
    });
    return () => s.disconnect();
  }, [selectedConversation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Filter conversations based on active tab and search
  const filteredConversations = conversations.filter(conv => {
    const matchesTab = activeTab === 'deal' ? conv.type === 'deal' : conv.type === 'inquiry';
    const matchesSearch = 
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.relatedProjectName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Mock data for conversations
  const mockConversations = [
    {
      id: 'c1',
      participants: ['entrepreneur1', 'supplier1'],
      type: 'deal',
      relatedProjectId: 'project1',
      relatedProjectName: 'Smart Home IoT Platform',
      user: {
        id: 'supplier1',
        name: 'Ahmed Hassan',
        role: 'supplier',
        avatar: '/placeholder-user.jpg',
        company: 'Tech Solutions Inc.',
        lastSeen: '2 minutes ago'
      },
      messages: [
        {
          id: 'm1',
          senderId: 'supplier1',
          text: 'Hello! I received your inquiry about the IoT devices. I can provide you with the specifications and pricing.',
          timestamp: '2024-01-20T10:30:00Z'
        },
        {
          id: 'm2',
          senderId: 'entrepreneur1',
          text: 'Great! Can you send me the technical specifications and bulk pricing for 100 units?',
          timestamp: '2024-01-20T10:35:00Z'
        },
        {
          id: 'm3',
          senderId: 'supplier1',
          text: 'Of course! Here are the specifications: [Technical specs attached]. For 100 units, the price would be $15,000 with 30-day delivery.',
          timestamp: '2024-01-20T10:40:00Z'
        },
        {
          id: 'm4',
          senderId: 'entrepreneur1',
          text: 'Perfect! I\'ll review the specs and get back to you by tomorrow. Can we discuss payment terms?',
          timestamp: '2024-01-20T10:45:00Z'
        }
      ],
      lastMessage: 'Perfect! I\'ll review the specs and get back to you by tomorrow. Can we discuss payment terms?',
      lastMessageTime: '2024-01-20T10:45:00Z',
      unreadCount: 0
    },
    {
      id: 'c2',
      participants: ['entrepreneur1', 'investor1'],
      type: 'inquiry',
      relatedProjectId: 'project1',
      relatedProjectName: 'Smart Home IoT Platform',
      user: {
        id: 'investor1',
        name: 'Sarah Johnson',
        role: 'investor',
        avatar: '/placeholder-user.jpg',
        company: 'Innovation Ventures',
        lastSeen: '1 hour ago'
      },
      messages: [
        {
          id: 'm1',
          senderId: 'investor1',
          text: 'Hi! I came across your Smart Home IoT Platform project. It looks very promising!',
          timestamp: '2024-01-19T14:20:00Z'
        },
        {
          id: 'm2',
          senderId: 'entrepreneur1',
          text: 'Thank you for your interest! Would you like to schedule a call to discuss the project in detail?',
          timestamp: '2024-01-19T14:25:00Z'
        },
        {
          id: 'm3',
          senderId: 'investor1',
          text: 'Absolutely! I\'m available tomorrow between 2-4 PM. Does that work for you?',
          timestamp: '2024-01-19T14:30:00Z'
        }
      ],
      lastMessage: 'Absolutely! I\'m available tomorrow between 2-4 PM. Does that work for you?',
      lastMessageTime: '2024-01-19T14:30:00Z',
      unreadCount: 1
    },
    {
      id: 'c3',
      participants: ['entrepreneur1', 'supplier2'],
      type: 'deal',
      relatedProjectId: 'project2',
      relatedProjectName: 'Mobile App Development',
      user: {
        id: 'supplier2',
        name: 'Mohammed Ali',
        role: 'supplier',
        avatar: '/placeholder-user.jpg',
        company: 'Design Studio Pro',
        lastSeen: 'Online'
      },
      messages: [
        {
          id: 'm1',
          senderId: 'supplier2',
          text: 'Hi! I\'ve completed the UI/UX design for your mobile app. Here\'s the link to review: [Design Link]',
          timestamp: '2024-01-18T16:15:00Z'
        },
        {
          id: 'm2',
          senderId: 'entrepreneur1',
          text: 'The designs look amazing! I love the modern interface. When can we start development?',
          timestamp: '2024-01-18T16:20:00Z'
        }
      ],
      lastMessage: 'The designs look amazing! I love the modern interface. When can we start development?',
      lastMessageTime: '2024-01-18T16:20:00Z',
      unreadCount: 0
    },
    {
      id: 'c4',
      participants: ['entrepreneur1', 'investor2'],
      type: 'inquiry',
      relatedProjectId: 'project3',
      relatedProjectName: 'E-commerce Platform',
      user: {
        id: 'investor2',
        name: 'David Chen',
        role: 'investor',
        avatar: '/placeholder-user.jpg',
        company: 'Tech Angels Fund',
        lastSeen: '3 hours ago'
      },
      messages: [
        {
          id: 'm1',
          senderId: 'investor2',
          text: 'Hello! I\'m interested in learning more about your e-commerce platform. Do you have a pitch deck available?',
          timestamp: '2024-01-17T09:15:00Z'
        },
        {
          id: 'm2',
          senderId: 'entrepreneur1',
          text: 'Hi David! Yes, I can share our pitch deck. What specific aspects are you most interested in?',
          timestamp: '2024-01-17T09:20:00Z'
        }
      ],
      lastMessage: 'Hi David! Yes, I can share our pitch deck. What specific aspects are you most interested in?',
      lastMessageTime: '2024-01-17T09:20:00Z',
      unreadCount: 0
    }
  ];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Send message (supports new or existing conversation)
  const handleSendMessage = async () => {
    if (!selectedConversation && !adminId) return; // Do not send if adminId is not fetched
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem('token');
      let payload = { content: newMessage };
      if (selectedConversation && (selectedConversation._id || selectedConversation.id)) {
        payload.threadId = selectedConversation._id || selectedConversation.id;
      } else {
        // New conversation with admin
        payload.receiverId = adminId;
        payload.type = 'support';
      }
      await axios.post(`${BASE_URL}/api/messages`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewMessage('');
      // Re-fetch messages
      if (payload.threadId) fetchMessages(payload.threadId);
      // Re-fetch threads
      const res = await axios.get(`${BASE_URL}/api/messages/threads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(res.data.data?.threads || res.data.threads || []);
    } catch (err) {
      // You can display an error message here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#EEF8F7' }}>
      <div className="px-4 md:px-8">
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-0 h-full flex overflow-hidden">
          {/* Left Sidebar - Conversations */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
                <button
                  onClick={() => setActiveTab('deal')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex-1 ${
                    activeTab === 'deal'
                      ? 'bg-white text-[#1D3557] shadow-md'
                      : 'text-[#457B9D] hover:text-[#1D3557]'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm">Deal Chats</span>
                </button>
                <button
                  onClick={() => setActiveTab('initial')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex-1 ${
                    activeTab === 'initial'
                      ? 'bg-white text-[#1D3557] shadow-md'
                      : 'text-[#457B9D] hover:text-[#1D3557]'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Initial Contact</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="p-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-[#457B9D] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <img
                            src={conversation.user.avatar}
                            alt={conversation.user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            conversation.user.lastSeen === 'Online' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold truncate ${
                              selectedConversation?.id === conversation.id ? 'text-white' : 'text-[#1D3557]'
                            }`}>
                              {conversation.user.name}
                            </h3>
                            <span className={`text-xs ${
                              selectedConversation?.id === conversation.id ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              conversation.user.role === 'investor' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {conversation.user.role === 'investor' ? (
                                <Users className="w-3 h-3 mr-1" />
                              ) : (
                                <Package className="w-3 h-3 mr-1" />
                              )}
                              {conversation.user.role === 'investor' ? 'Investor' : 'Supplier'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              conversation.type === 'deal' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {conversation.type === 'deal' ? 'Deal' : 'Inquiry'}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${
                            selectedConversation?.id === conversation.id ? 'text-white/90' : 'text-gray-600'
                          }`}>
                            {conversation.lastMessage}
                          </p>
                          <p className={`text-xs mt-1 ${
                            selectedConversation?.id === conversation.id ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            {conversation.relatedProjectName}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    {activeTab === 'deal' ? (
                      <>
                        <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Deal Chats yet</h3>
                        <p className="text-gray-500 mb-4">Start by making a deal with a supplier or investor.</p>
                      </>
                    ) : (
                      <>
                        <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Initial Contacts yet</h3>
                        <p className="text-gray-500 mb-4">Try reaching out from the Marketplace.</p>
                      </>
                    )}
                    <Link to="/dashboard/entrepreneur?tab=marketplace" className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors duration-300 mx-auto">
  <ExternalLink className="w-4 h-4" />
  <span>Go to Marketplace</span>
</Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Chat View */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedConversation.user.avatar}
                      alt={selectedConversation.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="font-semibold text-[#1D3557]">{selectedConversation.user.name}</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{selectedConversation.user.company}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{selectedConversation.user.lastSeen}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedConversation.type === 'inquiry' && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>Inquiry</span>
                      </div>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'entrepreneur1' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'entrepreneur1'
                          ? 'bg-[#457B9D] text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'entrepreneur1' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows="1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#457B9D] focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-3 bg-[#457B9D] text-white rounded-lg hover:bg-[#1D3557] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty Chat State */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
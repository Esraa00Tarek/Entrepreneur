import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const AdminChatDashboard = () => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // جلب كل المحادثات عند التحميل
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) return;
    setLoadingThreads(true);
    axios
      .get(`${API_BASE}/messages/admin/threads`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setThreads(res.data.data.threads))
      .finally(() => setLoadingThreads(false));
  }, []);

  // جلب رسائل المحادثة عند اختيارها
  useEffect(() => {
    if (!selectedThread) return;
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) return;
    setLoadingMessages(true);
    axios
      .get(`${API_BASE}/messages/thread/${selectedThread._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMessages(res.data.data.messages))
      .finally(() => setLoadingMessages(false));
  }, [selectedThread]);

  // socket.io: انضمام لغرفة المحادثة واستقبال الرسائل الجديدة
  useEffect(() => {
    if (!selectedThread) return;
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) return;

    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.emit("joinThread", { threadId: selectedThread._id });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [selectedThread]);

  // إرسال رسالة
  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token || !selectedThread) return;

    const formData = new FormData();
    formData.append("content", newMessage);
    formData.append("threadId", selectedThread._id);
    attachments.forEach((file) => formData.append("attachments", file));

    try {
      const res = await axios.post(`${API_BASE}/messages`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => [...prev, res.data.data.message]);
      setNewMessage("");
      setAttachments([]);
    } catch (err) {
      // يمكنك إضافة إشعار خطأ هنا
    }
  };

  // حذف رسالة منفردة
  const handleDeleteMessage = async (messageId) => {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) return;
    await axios.delete(`${API_BASE}/messages/admin/message/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  };

  // واجهة المستخدم
  return (
    <div className="flex h-[80vh] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* قائمة المحادثات */}
      <div className="w-1/3 border-r p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">Support Chats</h2>
        {loadingThreads ? (
          <div>Loading...</div>
        ) : (
          threads.map((thread) => {
            // جلب بيانات المستخدم (غير الأدمن)
            const user = (thread.participantsData || []).find((u) => u.role !== "admin");
            return (
              <div
                key={thread._id}
                className={`p-3 mb-2 rounded cursor-pointer ${selectedThread && selectedThread._id === thread._id ? "bg-blue-100" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="flex items-center gap-2">
                  {user?.avatar && (
                    <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                  )}
                  <div>
                    <div className="font-semibold">{user?.name || user?.email || "User"}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 truncate">{thread.lastMessage}</div>
                <div className="text-xs text-gray-400">{thread.lastMessageTime ? new Date(thread.lastMessageTime).toLocaleString() : ""}</div>
              </div>
            );
          })
        )}
      </div>

      {/* نافذة الشات */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <div className="border-b p-4 font-bold flex items-center gap-2">
              {selectedThread.participantsData?.find((u) => u.role !== "admin")?.avatar && (
                <img src={selectedThread.participantsData.find((u) => u.role !== "admin").avatar} alt="avatar" className="w-8 h-8 rounded-full" />
              )}
              <div>
                <div>{selectedThread.participantsData?.find((u) => u.role !== "admin")?.name || "User"}</div>
                <div className="text-xs text-gray-500">{selectedThread.participantsData?.find((u) => u.role !== "admin")?.email}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 500 }}>
              {loadingMessages ? (
                <div>Loading messages...</div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`mb-2 flex ${msg.senderId === selectedThread.participants.find((id) => id !== msg.senderId) ? "justify-start" : "justify-end"}`}
                    >
                      <div className={`rounded-lg px-3 py-2 ${msg.senderId === selectedThread.participants.find((id) => id !== msg.senderId) ? "bg-gray-200" : "bg-blue-200"}`}>
                        <div className="flex items-center gap-2">
                          <div>{msg.content}</div>
                          <button
                            className="text-xs text-red-500 ml-2"
                            onClick={() => handleDeleteMessage(msg._id)}
                            title="Delete message"
                          >
                            Delete
                          </button>
                        </div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {msg.attachments.map((att, i) => (
                              <a
                                key={i}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline"
                              >
                                {att.fileName || "Attachment"}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            <div className="p-3 border-t flex flex-col gap-2">
              <textarea
                className="w-full border rounded p-2"
                rows={2}
                placeholder="Write your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  onChange={(e) => setAttachments(Array.from(e.target.files))}
                  className="block"
                />
                <button
                  className="ml-auto bg-blue-600 text-white px-4 py-1 rounded"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation to view messages</div>
        )}
      </div>
    </div>
  );
};

export default AdminChatDashboard; 
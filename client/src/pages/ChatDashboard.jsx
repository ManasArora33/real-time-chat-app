import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';
import { io } from 'socket.io-client';
import {
  Search,
  Send,
  User as UserIcon,
  LogOut,
  MessageCircle,
  Menu,
  X,
  MoreHorizontal,
  Smile,
  Paperclip,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

// URL for our socket server
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ChatDashboard = () => {
  const { user, logout } = useAuth();
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online user IDs

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Effect: Initialize Socket connection when user is logged in
  */
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Clean up on unmount
    return () => newSocket.close();
  }, []);

  /**
   * Effect: Handle socket online/offline status events
   */
  useEffect(() => {
    if (socket && user) {
      // Emit user_connected to register this user as online
      socket.emit('user_connected', user._id);

      // Listen for initial list of online users
      socket.on('online_users_list', (onlineUserIds) => {
        setOnlineUsers(new Set(onlineUserIds));
      });

      // Listen for users coming online
      socket.on('user_online', (userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      // Listen for users going offline
      socket.on('user_offline', (userId) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      return () => {
        socket.off('online_users_list');
        socket.off('user_online');
        socket.off('user_offline');
      };
    }
  }, [socket, user]);

  /**
   * Effect: Listen for incoming messages from the socket
   */
  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (message) => {
        // If the message belongs to our currently selected chat, add it!
        if (selectedChat && (message.chatId === selectedChat._id || message.chatId?._id === selectedChat._id)) {
          setMessages((prev) => [...prev, message]);
        }

        // Also update the 'chats' list to show the latest message (optional enhancement)

      });

      return () => socket.off('receive_message');
    }
  }, [socket, selectedChat]);

  // Fetch initial data: chats and available users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatsData = await chatService.getChats();
        setChats(chatsData);

        const usersData = await chatService.getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle chat selection and room joining
  useEffect(() => {
    if (selectedChat && socket) {
      // 1. Fetch historical messages
      const fetchMessages = async () => {
        try {
          const msgs = await chatService.getMessages(selectedChat._id);
          setMessages(msgs);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();

      // 2. Join the chat room on the server
      socket.emit('join_chat', selectedChat._id);
    }
  }, [selectedChat, socket]);

  const handleSelectUser = async (targetUser) => {
    try {
      const chat = await chatService.createOrGetChat(targetUser._id);
      setSelectedChat(chat);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

    const messageData = {
      chatId: selectedChat._id,
      senderId: user._id,
      content: newMessage,
    };

    // Emit the message to the server
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  const getChatPartner = (chat) => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find(u => u._id !== user._id);
  };

  /**
   * Helper: Search for messages and jump to first result
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!localSearchQuery.trim() || !selectedChat) return;

    try {
      const results = await chatService.searchMessages(selectedChat._id, localSearchQuery);
      setSearchResults(results);
      if (results.length > 0) {
        setCurrentSearchIndex(0);
        navigateToMatch(results[0]._id);
      } else {
        setCurrentSearchIndex(-1);
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  /**
   * Helper: Scroll to a specific message ID and highlight it
   */
  const navigateToMatch = (messageId) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a temporary highlight class
      element.classList.add('bg-blue-500/30');
      setTimeout(() => {
        element.classList.remove('bg-blue-500/30');
      }, 2000);
    }
  };

  const nextMatch = () => {
    if (currentSearchIndex < searchResults.length - 1) {
      const newIndex = currentSearchIndex + 1;
      setCurrentSearchIndex(newIndex);
      navigateToMatch(searchResults[newIndex]._id);
    }
  };

  const prevMatch = () => {
    if (currentSearchIndex > 0) {
      const newIndex = currentSearchIndex - 1;
      setCurrentSearchIndex(newIndex);
      navigateToMatch(searchResults[newIndex]._id);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 rounded-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* SIDEBAR */}
      <div className={`
        ${isSidebarOpen ? 'w-80' : 'w-0'} md:w-80 
        transition-all duration-300 ease-in-out
        bg-white/5 backdrop-blur-xl border-r border-white/10
        flex flex-col h-full z-40 overflow-hidden whitespace-nowrap
      `}>
        {/* User Info Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-semibold truncate">{user?.username}</h3>
              <p className="text-xs text-slate-400 capitalize">Available</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Direct Messages</div>
          {users
            .filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((u) => (
              <button
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChat?.participants?.some(cu => cu._id === u._id) ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5 text-slate-300'}`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                    <UserIcon size={20} />
                  </div>
                  {/* Online/Offline indicator */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a] ${onlineUsers.has(u._id) ? 'bg-green-500' : 'bg-slate-500'
                      }`}
                    title={onlineUsers.has(u._id) ? 'Online' : 'Offline'}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{u.username}</p>
                  <p className={`text-xs ${onlineUsers.has(u._id) ? 'text-green-400' : 'text-slate-500'}`}>
                    {onlineUsers.has(u._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            ))}
        </div>

        {/* Logout Section */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all font-medium text-sm"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full relative">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-md z-30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <UserIcon size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{getChatPartner(selectedChat)?.username}</h2>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${onlineUsers.has(getChatPartner(selectedChat)?._id) ? 'bg-green-500' : 'bg-slate-500'
                        }`}
                    ></span>
                    <span className={`text-xs ${onlineUsers.has(getChatPartner(selectedChat)?._id) ? 'text-green-400' : 'text-slate-500'
                      }`}>
                      {onlineUsers.has(getChatPartner(selectedChat)?._id) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (isSearchOpen) {
                      setSearchResults([]);
                      setLocalSearchQuery('');
                      setCurrentSearchIndex(-1);
                    }
                  }}
                  className={`p-2 rounded-lg transition-all ${isSearchOpen ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                >
                  <Search size={20} />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><MoreHorizontal size={20} /></button>
              </div>
            </div>

            {/* Search Navigation Bar */}
            {isSearchOpen && (
              <div className="bg-slate-900/60 backdrop-blur-md border-b border-white/10 p-3 flex items-center justify-center animate-in slide-in-from-top duration-300 z-20">
                <form onSubmit={handleSearch} className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-1.5 border border-white/10 focus-within:border-blue-500/50 transition-all">
                  <Search size={16} className="text-slate-500" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search in conversation..."
                    className="bg-transparent border-none focus:ring-0 text-sm w-64"
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        {currentSearchIndex + 1} of {searchResults.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={nextMatch} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                          <ChevronUp size={16} />
                        </button>
                        <button type="button" onClick={prevMatch} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchResults([]);
                      setLocalSearchQuery('');
                      setCurrentSearchIndex(-1);
                    }}
                    className="ml-2 text-slate-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <MessageCircle size={48} className="opacity-20" />
                  <p>Send a message to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.senderId === user._id || msg.senderId?._id === user._id;
                  const isSearchResult = searchResults.some(res => res._id === msg._id);
                  const isCurrentMatch = currentSearchIndex >= 0 && searchResults[currentSearchIndex]?._id === msg._id;

                  return (
                    <div
                      key={msg._id || i}
                      id={`msg-${msg._id}`}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`
                        max-w-[70%] p-4 rounded-2xl shadow-xl transition-all duration-500
                        ${isCurrentMatch ? 'ring-2 ring-blue-400 scale-105 shadow-blue-500/20' : ''}
                        ${isMine
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white/10 backdrop-blur-md text-white border border-white/5 rounded-bl-none'}
                      `}>
                        <p className="text-[15px] leading-relaxed">{msg.content}</p>
                        <span className={`text-[10px] block mt-1.5 opacity-50 ${isMine ? 'text-right' : ''}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-slate-900/40 backdrop-blur-md border-t border-white/10">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-4">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-end gap-2 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                  <button type="button" className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"><Smile size={20} /></button>
                  <textarea
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Write a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white py-2 px-1 resize-none max-h-32 text-sm"
                  />
                  <button type="button" className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"><Paperclip size={20} /></button>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transform active:scale-95 transition-all h-[52px] w-[52px] flex items-center justify-center flex-shrink-0"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a]">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 animate-bounce transition-all">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome to your workspace</h2>
            <p className="text-slate-400 max-w-sm">Select a colleague from the sidebar to start collaborating securely and in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;

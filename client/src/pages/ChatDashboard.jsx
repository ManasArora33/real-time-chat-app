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
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const isSearching = searchTerm.trim().length > 0;
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online user IDs

  // Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

  // Typing Indicator States
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

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

  /**
   * Effect: Listen for typing indicator events
   */
  useEffect(() => {
    if (socket) {
      socket.on('user_typing', (data) => {
        setTypingUser(data.username);
      });

      socket.on('user_stop_typing', () => {
        setTypingUser(null);
      });

      return () => {
        socket.off('user_typing');
        socket.off('user_stop_typing');
      };
    }
  }, [socket]);

  // Fetch initial data: chats and available users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatsData = await chatService.getChats();
        setChats(chatsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  /**
   * Effect: Debounced User Search
   * This pings the server only after the user stops typing for 500ms
   */
  useEffect(() => {
    // If search is empty, just clear the results and stop
    if (!searchTerm.trim()) {
      setGlobalSearchResults([]);
      setIsSearchLoading(false);
      return;
    }

    setIsSearchLoading(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const results = await chatService.getUsers(searchTerm);
        setGlobalSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearchLoading(false);
      }
    }, 500);

    // CLEANUP: This cancels the timer if the user types again before 500ms
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

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

  /**
   * Helper: Select an existing conversation and handle UI state
   */
  const selectConversation = (chat) => {
    setSelectedChat(chat);
    setSearchTerm(''); // Clear search when a chat is selected
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  /**
   * Helper: Find/Create a chat for a specific user, then select it
   */
  const handleSelectUser = async (targetUser) => {
    try {
      const chat = await chatService.createOrGetChat(targetUser._id);
      selectConversation(chat);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socket) return;

    // Immediately stop the typing indicator when message is sent
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('stop_typing', selectedChat._id);
    }

    const messageData = {
      chatId: selectedChat._id,
      senderId: user._id,
      content: newMessage,
    };

    // Emit the message to the server
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  /**
   * Helper: Handle typing events with a debounce timer
   */
  const handleTyping = () => {
    if (!socket || !selectedChat) return;

    // Emit the typing event to the server
    socket.emit('typing', {
      chatId: selectedChat._id,
      username: user.username
    });

    // Clear the existing timeout if user is still typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set a new timeout to stop the typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', selectedChat._id);
    }, 2000);
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

        {/* List Section */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {!isSearching ? (
            <>
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold">Recent Conversations</div>
              {chats.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-xs text-slate-500 whitespace-normal">No chats yet. Search for a friend to start talking!</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const partner = getChatPartner(chat);
                  const isSelected = selectedChat?._id === chat._id;
                  if (!partner) return null;

                  return (
                    <button
                      key={chat._id}
                      onClick={() => selectConversation(chat)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isSelected ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-white/5 text-slate-300'}`}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                          <UserIcon size={20} />
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a] ${onlineUsers.has(partner._id) ? 'bg-green-500' : 'bg-slate-500'}`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{partner.username}</p>
                        <p className={`text-xs ${onlineUsers.has(partner._id) ? 'text-green-400' : 'text-slate-500'}`}>
                          {onlineUsers.has(partner._id) ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          ) : (
            <>
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-blue-500 font-bold flex items-center gap-2">
                Global Discovery {isSearchLoading && <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>}
              </div>
              {globalSearchResults.length === 0 && !isSearchLoading ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-xs text-slate-500">No users found matching "{searchTerm}"</p>
                </div>
              ) : (
                globalSearchResults.map((u) => {
                  const isAlreadyInChat = chats.some(c => c.participants.some(p => p._id === u._id));
                  return (
                    <button
                      key={u._id}
                      onClick={() => handleSelectUser(u)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-slate-300 transition-all border border-transparent hover:border-white/5"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <UserIcon size={20} className="text-slate-500" />
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a] ${onlineUsers.has(u._id) ? 'bg-green-500' : 'bg-slate-500'}`}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm flex items-center gap-2">
                          {u.username}
                          {isAlreadyInChat && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-slate-500">Chatting</span>}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}
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
                  <div className="flex items-center h-5">
                    {typingUser ? (
                      <div className="flex items-center gap-2 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 animate-in fade-in zoom-in duration-300">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:200ms]"></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:400ms]"></span>
                        </div>
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                          Typing
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${onlineUsers.has(getChatPartner(selectedChat)?._id) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-500'
                            }`}
                        ></span>
                        <span className={`text-xs font-medium ${onlineUsers.has(getChatPartner(selectedChat)?._id) ? 'text-green-400' : 'text-slate-500'
                          }`}>
                          {onlineUsers.has(getChatPartner(selectedChat)?._id) ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    )}
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
                  const isMine = msg.senderId === user._id || msg.senderId?._id === user._id
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
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
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

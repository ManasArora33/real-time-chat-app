import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import chatService from '../services/chatService';
import { useAuth } from './AuthContext';

// Create the Context
const ChatContext = createContext();

/**
 * Custom hook to consume the ChatContext easily.
 */
export const useChat = () => useContext(ChatContext);

// URL for our socket server
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * The ChatProvider manages all real-time logic and state for conversations.
 */
export const ChatProvider = ({ children }) => {
  const { user } = useAuth();

  // -- CORE CHAT STATES --
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);

  // -- SEARCH & DISCOVERY STATES --
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [globalSearchResults, setGlobalSearchResults] = useState([]);

  // -- MESSAGE SEARCH STATES (IN-CONVERSATION) --
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);

  /**
   * Effect 1: Initialize Socket connection once on mount.
   */
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Clean up on unmount
    return () => newSocket.close();
  }, []);

  /**
   * Effect 2: Manage Socket Listeners for Presence, Messages, and Typing.
   */
  useEffect(() => {
    if (socket && user) {
      // Register self as online
      socket.emit('user_connected', user._id);

      // Presence Handlers
      socket.on('online_users_list', (onlineUserIds) => {
        setOnlineUsers(new Set(onlineUserIds));
      });

      socket.on('user_online', (userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      socket.on('user_offline', (userId) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });


      // Message Receiver
      socket.on('receive_message', (message) => {
        if (selectedChat && (message.chatId === selectedChat._id || message.chatId?._id === selectedChat._id)) {
          setMessages((prev) => [...prev, message]);

          // Instantly send a read receipt if we are actively viewing this chat
          const senderIdStr = typeof message.senderId === 'object' ? message.senderId._id : message.senderId;
          if (senderIdStr !== user._id) {
            socket.emit('mark_read', {
              chatId: selectedChat._id,
              userId: user._id,
              senderId: senderIdStr,
            });
          }
        }
      });

      // Status: Delivered — update grey ticks in real-time
      socket.on('messages_delivered', ({ deliveredBy }) => {
        setMessages((prev) =>
          prev.map((msg) => {
            const recipientIdStr = typeof msg.recipientId === 'object' ? msg.recipientId._id : msg.recipientId;
            return (msg.status === 'sent' && recipientIdStr === deliveredBy)
              ? { ...msg, status: 'delivered' }
              : msg;
          })
        );
      });

      // Read Receipt: Read — update blue ticks in real-time
      socket.on('messages_read', ({ chatId }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            (msg.chatId === chatId || msg.chatId?._id === chatId) && msg.status !== 'read'
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      });

      // Typing Listeners
      socket.on('user_typing', (data) => {
        setTypingUsers((prev) => ({ ...prev, [data.chatId]: data.username }));
      });
      socket.on('user_stop_typing', (chatId) => {
        setTypingUsers((prev) => {
          const newState = { ...prev };
          delete newState[chatId];
          return newState;
        });
      });

      // Cleanup
      return () => {
        socket.off('online_users_list');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('receive_message');
        socket.off('messages_delivered');
        socket.off('messages_read');
        socket.off('user_typing');
        socket.off('user_stop_typing');
      };
    }
  }, [socket, user, selectedChat]);

  /**
   * Effect 3: Fetch Chat History for the sidebar.
   */
  useEffect(() => {
    if (user) {
      const fetchChatsData = async () => {
        setIsChatsLoading(true);
        try {
          const chatsData = await chatService.getChats();
          setChats(chatsData);
        } catch (err) {
          console.error('Error fetching chats:', err);
        } finally {
          setIsChatsLoading(false);
        }
      };
      fetchChatsData();
    }
  }, [user]);

  /**
   * Effect 4: Handle Room Joining & Initial Message Fetching.
   */
  useEffect(() => {
    if (selectedChat && socket && user) {
      const fetchMessages = async () => {
        setIsMessagesLoading(true);
        try {
          const msgs = await chatService.getMessages(selectedChat._id);
          setMessages(msgs);
        } catch (err) {
          console.error('Error fetching messages:', err);
        } finally {
          setIsMessagesLoading(false);
        }
      };
      fetchMessages();

      socket.emit('join_chat', selectedChat._id);

      // Fire mark_read: tell server to mark all partner's messages as read
      const partner = selectedChat.participants?.find(p => p._id !== user._id);
      if (partner) {
        socket.emit('mark_read', {
          chatId: selectedChat._id,
          userId: user._id,
          senderId: partner._id,
        });
      }
    }
  }, [selectedChat, socket, user]);

  /**
   * Effect 5: Debounced Global User Discovery.
   */
  useEffect(() => {
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
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // -- EXPOSED ACTIONS --

  /**
   * Select a chat and reset UI search states.
   */
  const selectConversation = (chat) => {
    setSelectedChat(chat);
    setSearchTerm('');
  };

  /**
   * Logic: Select a user from global search, create/get chat, and switch view.
   */
  const handleSelectUser = async (targetUser) => {
    try {
      const chat = await chatService.createOrGetChat(targetUser._id);

      // Update chats list if this is a new conversation locally
      setChats((prev) => {
        const exists = prev.find(c => c._id === chat._id);
        if (!exists) return [chat, ...prev];
        return prev;
      });

      setSelectedChat(chat);
      setSearchTerm('');
      setGlobalSearchResults([]);
    } catch (err) {
      console.error("Failed to start chat from search:", err);
    }
  };

  /**
   * Emit a new message through the socket.
   */
  const handleSendMessage = (content) => {
    if (!content.trim() || !selectedChat || !socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('stop_typing', selectedChat._id);
    }

    // Include recipientId so server can auto-deliver if they're online
    const partner = selectedChat.participants?.find(p => p._id !== user._id);
    const messageData = {
      chatId: selectedChat._id,
      senderId: user._id,
      content,
      recipientId: partner?._id,
    };

    socket.emit('send_message', messageData);
  };

  /**
   * Handle the typing pulse with a debounce timer.
   */
  const handleTyping = () => {
    if (!socket || !selectedChat) return;

    socket.emit('typing', {
      chatId: selectedChat._id,
      username: user.username
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', selectedChat._id);
    }, 2000);
  };

  /**
   * Logic: Search for messages and jump to first result
   */
  const handleMessageSearch = async (e) => {
    if (e) e.preventDefault();
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
      element.classList.add('bg-blue-500/30');
      setTimeout(() => element.classList.remove('bg-blue-500/30'), 2000);
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

  const value = {
    chats,
    selectedChat,
    messages,
    onlineUsers,
    typingUsers,
    searchTerm,
    setSearchTerm,
    globalSearchResults,
    isSearchLoading,
    isSearchOpen,
    setIsSearchOpen,
    localSearchQuery,
    setLocalSearchQuery,
    searchResults,
    setSearchResults,
    currentSearchIndex,
    setCurrentSearchIndex,
    handleMessageSearch,
    nextMatch,
    prevMatch,
    selectConversation,
    handleSelectUser,
    handleSendMessage,
    handleTyping,
    socket,
    isChatsLoading,
    isMessagesLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

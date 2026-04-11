import api from './api';

/**
 * The chatService handles all API calls related to chats and messages.
 */
const chatService = {
  /**
   * Fetch all chats for the logged-in user.
   */
  getChats: async () => {
    const response = await api.get('/chat');
    return response.data;
  },

  /**
   * Create or access a 1-to-1 chat with another user.
   * @param {string} userId - The ID of the user to chat with.
   */
  createOrGetChat: async (userId) => {
    const response = await api.post('/chat', { userId });
    return response.data;
  },

  /**
   * Fetch message history for a specific chat room.
   * @param {string} chatId - The ID of the chat.
   */
  getMessages: async (chatId) => {
    const response = await api.get(`/message/${chatId}`);
    return response.data;
  },

  /**
   * Fetch users from the backend.
   * @param {string} searchTerm - Optional search query to filter users.
   */
  getUsers: async (searchTerm = '') => {
    const response = await api.get('/users', {
      params: { search: searchTerm }
    });
    return response.data;
  },

  /**
   * Search for messages within a specific chat room.
   * @param {string} chatId - The ID of the chat.
   * @param {string} query - The search term.
   */
  searchMessages: async (chatId, query) => {
    // We pass query parameters as an object to Axios
    const response = await api.get('/message/search', {
      params: { chatId, query },
    });
    return response.data;
  },
};

export default chatService;

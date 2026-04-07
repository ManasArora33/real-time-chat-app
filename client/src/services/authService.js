import api from './api';

/**
 * The authService handles all authentication-related API calls.
 * We use the 'api' instance from 'api.js' so we don't have to
 * manually write the base URL each time.
 */
const authService = {
  /**
   * Register a new user
   * @param {object} userData - { username, email, password }
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Log in an existing user
   * @param {object} credentials - { email, password }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current logged in user (session verification)
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;

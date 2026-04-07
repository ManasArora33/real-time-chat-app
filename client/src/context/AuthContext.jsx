import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create the Context object
const AuthContext = createContext();

/**
 * Custom hook to easily access auth data from any component.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * The AuthProvider component wraps our entire app.
 * It manages the 'user' state and provides auth functions globally.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Effect: Check for session on initial load.
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user);
      } catch (error) {
        console.log('No active session found.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Helper function to handle login and set user state.
   */
  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  /**
   * Helper function to handle registration and set user state.
   */
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  /**
   * Helper function to handle logout and clear state.
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // The values provided to the rest of the application
  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

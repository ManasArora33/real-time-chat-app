import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import Loader from '../components/ui/Loader';
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
    const checkAuthStatus = async (retryCount = 0) => {
      try {
        const data = await authService.getMe();
        setUser(data.user);
        setLoading(false); // Success, hide loader
      } catch (error) {
        // Render free-tier cold starts may return 502/503 or Network Errors before booting.
        // We ONLY clear the session if the server EXPLICITLY says the token is invalid (401).
        if (error.response?.status === 401 || retryCount >= 12) {
          console.log('No active session found or max retries reached.');
          setUser(null);
          setLoading(false); // Token is invalid, hide loader and show login
        } else {
          // If it's a network error or 50x error (cold start), wait 5s and try again
          console.log(`Server waking up (cold start detected). Retrying... Attempt ${retryCount + 1}/12`);
          setTimeout(() => checkAuthStatus(retryCount + 1), 5000);
        }
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
      {loading ? <Loader fullScreen message="Identifying your session..." /> : children}
    </AuthContext.Provider>
  );
};

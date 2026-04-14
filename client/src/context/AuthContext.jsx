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
        setLoading(false); 
      } catch (error) {
        const status = error.response?.status;
        
        // GRACE PERIOD: During cold start, even a 401 might be a false positive (DB not ready or proxy issues)
        // We retry for the first 3 attempts (approx 15s) even on 401. 
        // We always retry on 502, 503, or Network Errors (no status).
        const shouldRetry = (!status || status >= 500 || (status === 401 && retryCount < 3));

        if (shouldRetry && retryCount < 12) {
          console.log(`Server handshake in progress (status: ${status || 'Network Error'}). Retrying ${retryCount + 1}/12...`);
          setTimeout(() => checkAuthStatus(retryCount + 1), 5000);
        } else {
          console.log('Session invalid or server unreachable after max retries.');
          setUser(null);
          setLoading(false);
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
      {children}
    </AuthContext.Provider>
  );
};

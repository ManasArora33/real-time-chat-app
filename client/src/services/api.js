import axios from 'axios';

// The base URL for our backend API
// The base URL for our backend API, pulled from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * We create a central Axios instance here.
 * This allows us to set defaults (like the base URL) in one place.
 * 
 * 'withCredentials: true' is important because it allows the browser
 * to send and receive cookies with our requests (e.g., for login sessions).
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

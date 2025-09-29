import axios from 'axios';
import { getCookie } from '../utils/cookieUtils';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from cookies first, then localStorage as fallback
    let token = getCookie('token');
    let tokenSource = 'cookie';
    
    if (!token) {
      token = localStorage.getItem('token');
      tokenSource = 'localStorage';
    }
    
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Axios request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Return the full response object to maintain consistency with Redux actions
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('🔐 401 Unauthorized error:', {
        message: error.response?.data?.message,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Check if it's a "user no longer exists" error
      if (error.response?.data?.message === 'The user belonging to this token no longer exists.') {
        console.log('🔐 User no longer exists, clearing auth and redirecting');
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear cookies
        document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        document.cookie = 'user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        return Promise.reject(error);
      }
      
      // Only redirect to login if we're not already on the login page and we have a token
      const token = localStorage.getItem('token');
      if (token && window.location.pathname !== '/login') {
        // Check if the token is actually invalid by trying to parse it
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const currentTime = Date.now() / 1000;
            // Only redirect if token is actually expired
            if (payload.exp && payload.exp < currentTime) {
              console.log('🔐 Token expired, clearing auth and redirecting');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setTimeout(() => {
                window.location.href = '/login';
              }, 100);
            }
          }
        } catch (e) {
          // If token is malformed, remove it and redirect
          console.log('🔐 Token malformed, clearing auth and redirecting');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default api; 
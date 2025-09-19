import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getCookie } from '../../utils/cookieUtils';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if we have a token in cookies or localStorage but Redux state is not updated
    let token = getCookie('token');
    let userData = getCookie('user');
    let tokenSource = 'cookie';
    
    // Fallback to localStorage if not in cookies
    if (!token) {
      token = localStorage.getItem('token');
      tokenSource = 'localStorage';
    }
    if (!userData) {
      userData = localStorage.getItem('user');
    }

    console.log('🔄 AuthInitializer Debug:', {
      tokenSource,
      hasToken: !!token,
      tokenValue: token ? token.substring(0, 20) + '...' : 'null',
      hasUserData: !!userData,
      allCookies: document.cookie,
      localStorageToken: localStorage.getItem('token') ? 'exists' : 'missing',
      localStorageUser: localStorage.getItem('user') ? 'exists' : 'missing'
    });

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('🔄 AuthInitializer: Restoring auth state from', tokenSource);
        dispatch({ type: 'auth/restoreAuthState', payload: { user: parsedUser, token } });
      } catch (error) {
        console.error('Error parsing user data in AuthInitializer:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('❌ AuthInitializer: No token or user data found');
    }
  }, [dispatch]);

  return children;
};

export default AuthInitializer;

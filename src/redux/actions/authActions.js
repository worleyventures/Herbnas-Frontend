import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';
import { setCookie, getCookie, deleteCookie } from '../../utils/cookieUtils';

// Registration Actions
export const initiateRegistration = createAsyncThunk(
  'auth/initiateRegistration',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register/initiate', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const completeRegistration = createAsyncThunk(
  'auth/completeRegistration',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register/complete', verificationData);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Login Actions
export const initiateLogin = createAsyncThunk(
  'auth/initiateLogin',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login/initiate', loginData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const completeLogin = createAsyncThunk(
  'auth/completeLogin',
  async (verificationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login/complete', verificationData);
      
      // Store token and user data in both cookies and localStorage
      setCookie('token', response.data.data.token, 7); // 7 days
      setCookie('user', JSON.stringify(response.data.data.user), 7);
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const passwordLogin = createAsyncThunk(
  'auth/passwordLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🌐 Making login API call to:', '/auth/login/password');
      console.log('🌐 Login credentials:', { identifier: credentials.identifier, password: '***' });
      
      const response = await api.post('/auth/login/password', credentials);
      
      console.log('✅ Login API response:', response.data);
      console.log('🔍 Response structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        hasDataData: !!response.data?.data,
        dataDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
        hasToken: !!response.data?.data?.token,
        hasUser: !!response.data?.data?.user,
        tokenType: typeof response.data?.data?.token,
        userType: typeof response.data?.data?.user
      });
      
      // Check if response has the expected structure
      if (!response.data || !response.data.data || !response.data.data.token || !response.data.data.user) {
        throw new Error('Invalid response structure from login API');
      }
      
      // Store token and user data in both cookies and localStorage
      setCookie('token', response.data.data.token, 7); // 7 days
      setCookie('user', JSON.stringify(response.data.data.user), 7);
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      console.log('💾 Token and user stored in cookies and localStorage');
      
      return response.data.data;
    } catch (err) {
      console.error('❌ Login API error:', err);
      console.error('❌ Error response:', err.response?.data);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Profile Actions
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      
      // Update stored token
      localStorage.setItem('token', response.data.token);
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Address Actions
export const addAddress = createAsyncThunk(
  'auth/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/addresses', addressData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAddresses = createAsyncThunk(
  'auth/getAddresses',
  async (type, { rejectWithValue }) => {
    try {
      const params = type ? { type } : {};
      const response = await api.get('/auth/addresses', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'auth/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/auth/addresses/${addressId}`, addressData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'auth/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/auth/addresses/${addressId}`);
      return { addressId, ...response.data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'auth/setDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/auth/addresses/${addressId}/default`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// OTP Actions
export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-otp', otpData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Avatar Actions
export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (avatarFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await api.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  'auth/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/auth/avatar');
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
); 
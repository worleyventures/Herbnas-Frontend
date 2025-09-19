import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all users
export const getAllUsers = createAsyncThunk(
  'users/getAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add search params
      if (params.search) queryParams.append('search', params.search);
      
      // Add filter params
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.branch) queryParams.append('branch', params.branch);
      
      // Add sort params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`/users?${queryParams.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get user by ID
export const getUserById = createAsyncThunk(
  'users/getUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get users by branch
export const getUsersByBranch = createAsyncThunk(
  'users/getUsersByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users?branch=${branchId}&limit=100`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get my profile
export const getMyProfile = createAsyncThunk(
  'users/getMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update user (admin)
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      return { userId, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get user statistics
export const getUserStats = createAsyncThunk(
  'users/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/admin/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create user (admin)
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Change user password
export const changeUserPassword = createAsyncThunk(
  'users/changeUserPassword',
  async ({ userId, passwordData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/${userId}/password`, passwordData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Toggle user status
export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Assign user to branch
export const assignUserToBranch = createAsyncThunk(
  'users/assignUserToBranch',
  async ({ userId, branchId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/${userId}/assign-branch`, { branchId });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Clear user errors
export const clearUserErrors = createAsyncThunk(
  'users/clearErrors',
  async () => {
    return {};
  }
);

// Clear user success message
export const clearUserSuccess = createAsyncThunk(
  'users/clearSuccess',
  async () => {
    return {};
  }
);


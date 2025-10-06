import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all branches
export const getAllBranches = createAsyncThunk(
  'branches/getAllBranches',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add search params
      if (params.search) queryParams.append('search', params.search);
      
      // Add filter params
      if (params.status) queryParams.append('status', params.status);
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);
      
      // Add sort params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`/branches?${queryParams.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get active branches
export const getActiveBranches = createAsyncThunk(
  'branches/getActiveBranches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/branches/active');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get branch by ID
export const getBranchById = createAsyncThunk(
  'branches/getBranchById',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/branches/${branchId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create branch
export const createBranch = createAsyncThunk(
  'branches/createBranch',
  async (branchData, { rejectWithValue }) => {
    try {
      const response = await api.post('/branches', branchData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update branch
export const updateBranch = createAsyncThunk(
  'branches/updateBranch',
  async ({ branchId, branchData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/branches/${branchId}`, branchData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete branch
export const deleteBranch = createAsyncThunk(
  'branches/deleteBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/branches/${branchId}`);
      return { branchId, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Deactivate branch
export const deactivateBranch = createAsyncThunk(
  'branches/deactivateBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/branches/${branchId}/deactivate`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Restore branch
export const restoreBranch = createAsyncThunk(
  'branches/restoreBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/branches/${branchId}/restore`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get branch statistics
export const getBranchStats = createAsyncThunk(
  'branches/getBranchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/branches/admin/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get branch performance
export const getBranchPerformance = createAsyncThunk(
  'branches/getBranchPerformance',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/branches/${branchId}/performance`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Assign manager to branch
export const assignManagerToBranch = createAsyncThunk(
  'branches/assignManagerToBranch',
  async ({ branchId, managerId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/branches/${branchId}/assign-manager`, { managerId });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get branch users
export const getBranchUsers = createAsyncThunk(
  'branches/getBranchUsers',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/branches/${branchId}/users`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get branch inventory
export const getBranchInventory = createAsyncThunk(
  'branches/getBranchInventory',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/branches/${branchId}/inventory`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Clear branch errors
export const clearBranchErrors = createAsyncThunk(
  'branches/clearErrors',
  async () => {
    return {};
  }
);

// Clear branch success message
export const clearBranchSuccess = createAsyncThunk(
  'branches/clearSuccess',
  async () => {
    return {};
  }
);


import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all health issues
export const getAllHealthIssues = createAsyncThunk(
  'health/getAllHealthIssues',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filters
      if (params.search) queryParams.append('search', params.search);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.gender) queryParams.append('gender', params.gender);
      if (params.maritalStatus) queryParams.append('maritalStatus', params.maritalStatus);
      if (params.minAge) queryParams.append('minAge', params.minAge);
      if (params.maxAge) queryParams.append('maxAge', params.maxAge);
      if (params.createdBy) queryParams.append('createdBy', params.createdBy);
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`/health-issues?${queryParams.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get active health issues
export const getActiveHealthIssues = createAsyncThunk(
  'health/getActiveHealthIssues',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.gender) queryParams.append('gender', params.gender);
      if (params.maritalStatus) queryParams.append('maritalStatus', params.maritalStatus);
      if (params.age) queryParams.append('age', params.age);
      
      const response = await api.get(`/health-issues/active?${queryParams.toString()}`);
      console.log('getActiveHealthIssues API response:', response.data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get health issue by ID
export const getHealthIssueById = createAsyncThunk(
  'health/getHealthIssueById',
  async (healthIssueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/health-issues/${healthIssueId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create health issue
export const createHealthIssue = createAsyncThunk(
  'health/createHealthIssue',
  async (healthIssueData, { rejectWithValue }) => {
    try {
      const response = await api.post('/health-issues', healthIssueData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update health issue
export const updateHealthIssue = createAsyncThunk(
  'health/updateHealthIssue',
  async ({ healthIssueId, healthIssueData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/health-issues/${healthIssueId}`, healthIssueData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete health issue
export const deleteHealthIssue = createAsyncThunk(
  'health/deleteHealthIssue',
  async (healthIssueId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/health-issues/${healthIssueId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Restore health issue
export const restoreHealthIssue = createAsyncThunk(
  'health/restoreHealthIssue',
  async (healthIssueId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/health-issues/${healthIssueId}/restore`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get health issue stats
export const getHealthIssueStats = createAsyncThunk(
  'health/getHealthIssueStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/health-issues/admin/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Product suggestion actions
export const addProductSuggestion = createAsyncThunk(
  'health/addProductSuggestion',
  async ({ healthIssueId, productId, suggestionReason, priority }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/health-issues/${healthIssueId}/suggestions`, {
        productId,
        suggestionReason,
        priority
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const removeProductSuggestion = createAsyncThunk(
  'health/removeProductSuggestion',
  async ({ healthIssueId, productId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/health-issues/${healthIssueId}/suggestions/${productId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getSuggestedProducts = createAsyncThunk(
  'health/getSuggestedProducts',
  async (healthIssueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/health-issues/${healthIssueId}/suggestions`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getProductsForSuggestion = createAsyncThunk(
  'health/getProductsForSuggestion',
  async ({ healthIssueId, search }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      
      const response = await api.get(`/health-issues/${healthIssueId}/products?${queryParams.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Bulk update health issues
export const bulkUpdateHealthIssues = createAsyncThunk(
  'health/bulkUpdateHealthIssues',
  async ({ healthIssueIds, updates }, { rejectWithValue }) => {
    try {
      const response = await api.post('/health-issues/admin/bulk-update', {
        healthIssueIds,
        updates
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Export health issues
export const exportHealthIssues = createAsyncThunk(
  'health/exportHealthIssues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/health-issues/admin/export');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);


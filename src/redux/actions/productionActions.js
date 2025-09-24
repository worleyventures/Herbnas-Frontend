import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all productions
export const getAllProductions = createAsyncThunk(
  'productions/getAllProductions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filter params
      if (params.search) queryParams.append('search', params.search);
      if (params.productionStatus) queryParams.append('productionStatus', params.productionStatus);
      if (params.QCstatus) queryParams.append('QCstatus', params.QCstatus);
      if (params.productId) queryParams.append('productId', params.productId);
      
      // Add sort params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/productions?${queryParams.toString()}`);
      console.log('Production API Response:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch productions');
    }
  }
);

// Get production by ID
export const getProductionById = createAsyncThunk(
  'productions/getProductionById',
  async (productionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/productions/${productionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch production');
    }
  }
);

// Create production
export const createProduction = createAsyncThunk(
  'productions/createProduction',
  async (productionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/productions', productionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create production');
    }
  }
);

// Update production
export const updateProduction = createAsyncThunk(
  'productions/updateProduction',
  async ({ productionId, productionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/productions/${productionId}`, productionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update production');
    }
  }
);

// Delete production
export const deleteProduction = createAsyncThunk(
  'productions/deleteProduction',
  async (productionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/productions/${productionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete production');
    }
  }
);

// Get production statistics
export const getProductionStats = createAsyncThunk(
  'productions/getProductionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/productions/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch production statistics');
    }
  }
);

// Get productions by status
export const getProductionsByStatus = createAsyncThunk(
  'productions/getProductionsByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await api.get(`/productions?productionStatus=${status}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch productions by status');
    }
  }
);

// Get productions by QC status
export const getProductionsByQCStatus = createAsyncThunk(
  'productions/getProductionsByQCStatus',
  async (QCstatus, { rejectWithValue }) => {
    try {
      const response = await api.get(`/productions?QCstatus=${QCstatus}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch productions by QC status');
    }
  }
);

// Update production status
export const updateProductionStatus = createAsyncThunk(
  'productions/updateProductionStatus',
  async ({ productionId, productionStatus }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/productions/${productionId}`, { productionStatus });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update production status');
    }
  }
);

// Update QC status
export const updateQCStatus = createAsyncThunk(
  'productions/updateQCStatus',
  async ({ productionId, QCstatus, QCNotes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/productions/${productionId}`, { QCstatus, QCNotes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update QC status');
    }
  }
);

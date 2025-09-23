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

// Get products by stage (for production dashboard)
export const getProductsByStage = createAsyncThunk(
  'productions/getProductsByStage',
  async (stage, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products?productionStage=${stage}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products by stage');
    }
  }
);

// Update production stage
export const updateProductionStage = createAsyncThunk(
  'productions/updateProductionStage',
  async ({ productId, stage }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${productId}/stage`, { productionStage: stage });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update production stage');
    }
  }
);

// Move to inventory
export const moveToInventory = createAsyncThunk(
  'productions/moveToInventory',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/products/${productId}/move-to-inventory`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move product to inventory');
    }
  }
);

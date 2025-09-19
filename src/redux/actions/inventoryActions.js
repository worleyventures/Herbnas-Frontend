import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all inventory
export const getAllInventory = createAsyncThunk(
  'inventory/getAllInventory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add search params
      if (params.search) queryParams.append('search', params.search);
      
      // Add filter params
      if (params.branch) queryParams.append('branch', params.branch);
      if (params.product) queryParams.append('product', params.product);
      if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
      
      // Add sort params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`/inventory?${queryParams.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get inventory by product
export const getInventoryByProduct = createAsyncThunk(
  'inventory/getInventoryByProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/product/${productId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get inventory by branch
export const getInventoryByBranch = createAsyncThunk(
  'inventory/getInventoryByBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/branch/${branchId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create or update inventory
export const createOrUpdateInventory = createAsyncThunk(
  'inventory/createOrUpdateInventory',
  async (inventoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory', inventoryData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update inventory stock
export const updateInventoryStock = createAsyncThunk(
  'inventory/updateInventoryStock',
  async ({ id, stockData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/inventory/${id}/stock`, stockData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete inventory
export const deleteInventory = createAsyncThunk(
  'inventory/deleteInventory',
  async (inventoryId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/inventory/${inventoryId}`);
      return { inventoryId, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get inventory statistics
export const getInventoryStats = createAsyncThunk(
  'inventory/getInventoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Clear inventory errors
export const clearInventoryErrors = createAsyncThunk(
  'inventory/clearErrors',
  async () => {
    return {};
  }
);

// Clear inventory success message
export const clearInventorySuccess = createAsyncThunk(
  'inventory/clearSuccess',
  async () => {
    return {};
  }
);

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all products
export const getAllProducts = createAsyncThunk(
  'products/getAllProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.incentiveType) queryParams.append('incentiveType', params.incentiveType);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
      if (params.minWeight) queryParams.append('minWeight', params.minWeight);
      if (params.maxWeight) queryParams.append('maxWeight', params.maxWeight);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/products?${queryParams.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get active products
export const getActiveProducts = createAsyncThunk(
  'products/getActiveProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/active');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get product by ID
export const getProductById = createAsyncThunk(
  'products/getProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get product stats
export const getProductStats = createAsyncThunk(
  'products/getProductStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update production stage
export const updateProductionStage = createAsyncThunk(
  'products/updateProductionStage',
  async ({ productId, stage, notes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${productId}/stage`, { stage, notes });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get products by stage
export const getProductsByStage = createAsyncThunk(
  'products/getProductsByStage',
  async ({ stage, params = {} }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`/products/stage/${stage}?${queryParams.toString()}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get production statistics
export const getProductionStats = createAsyncThunk(
  'products/getProductionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/production/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Move completed product to inventory
export const moveToInventory = createAsyncThunk(
  'products/moveToInventory',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/products/${productId}/move-to-inventory`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all raw materials
export const getAllRawMaterials = createAsyncThunk(
  'inventory/getAllRawMaterials',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filter params
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.supplierId) queryParams.append('supplierId', params.supplierId);
      if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      
      // Add sort params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/inventory/raw-materials?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch raw materials');
    }
  }
);

// Get raw material by ID
export const getRawMaterialById = createAsyncThunk(
  'inventory/getRawMaterialById',
  async (rawMaterialId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/raw-materials/${rawMaterialId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch raw material');
    }
  }
);

// Create raw material
export const createRawMaterial = createAsyncThunk(
  'inventory/createRawMaterial',
  async (rawMaterialData, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory/raw-materials', rawMaterialData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create raw material');
    }
  }
);

// Update raw material
export const updateRawMaterial = createAsyncThunk(
  'inventory/updateRawMaterial',
  async ({ rawMaterialId, rawMaterialData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/inventory/raw-materials/${rawMaterialId}`, rawMaterialData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update raw material');
    }
  }
);

// Delete raw material
export const deleteRawMaterial = createAsyncThunk(
  'inventory/deleteRawMaterial',
  async (rawMaterialId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/inventory/raw-materials/${rawMaterialId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete raw material');
    }
  }
);

// Get all finished goods
export const getAllFinishedGoods = createAsyncThunk(
  'inventory/getAllFinishedGoods',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filter params
      if (params.search) queryParams.append('search', params.search);
      if (params.productId) queryParams.append('productId', params.productId);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      
      // Add sort params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/inventory/finished-goods?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch finished goods');
    }
  }
);

// Get finished goods by ID
export const getFinishedGoodsById = createAsyncThunk(
  'inventory/getFinishedGoodsById',
  async (finishedGoodsId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/finished-goods/${finishedGoodsId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch finished goods');
    }
  }
);

// Update finished goods stock
export const updateFinishedGoodsStock = createAsyncThunk(
  'inventory/updateFinishedGoodsStock',
  async ({ finishedGoodsId, stockData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/inventory/finished-goods/${finishedGoodsId}/stock`, stockData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update finished goods stock');
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
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory statistics');
    }
  }
);

// Create or update inventory (wrapper function)
export const createOrUpdateInventory = createAsyncThunk(
  'inventory/createOrUpdateInventory',
  async (inventoryData, { rejectWithValue, dispatch }) => {
    try {
      if (inventoryData._id) {
        // Update existing inventory
        const result = await dispatch(updateRawMaterial({ 
          rawMaterialId: inventoryData._id, 
          rawMaterialData: inventoryData 
        }));
        return result.payload;
      } else {
        // Create new inventory
        const result = await dispatch(createRawMaterial(inventoryData));
        return result.payload;
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save inventory');
    }
  }
);

// Legacy functions for backward compatibility
export const getAllInventory = getAllFinishedGoods;
export const getInventoryById = getFinishedGoodsById;
export const updateInventoryStock = updateFinishedGoodsStock;
export const deleteInventory = () => {
  throw new Error('deleteInventory is not implemented - use deleteRawMaterial for raw materials');
};
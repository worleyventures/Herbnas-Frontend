import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

// Get all sent goods with filtering and pagination
export const getAllSentGoods = createAsyncThunk(
  'sentGoods/getAllSentGoods',
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = 'all',
        branchId = '',
        startDate = '',
        endDate = '',
        sortBy = 'sentAt',
        sortOrder = 'desc'
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      if (search) queryParams.append('search', search);
      if (status && status !== 'all') queryParams.append('status', status);
      if (branchId) queryParams.append('branchId', branchId);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await axiosInstance.get(`/sent-goods?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sent goods');
    }
  }
);

// Get sent goods by ID
export const getSentGoodsById = createAsyncThunk(
  'sentGoods/getSentGoodsById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/sent-goods/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sent goods details');
    }
  }
);

// Create new sent goods
export const createSentGoods = createAsyncThunk(
  'sentGoods/createSentGoods',
  async (sentGoodsData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/sent-goods', sentGoodsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send goods');
    }
  }
);

// Update sent goods status
export const updateSentGoodsStatus = createAsyncThunk(
  'sentGoods/updateSentGoodsStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/sent-goods/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

// Delete sent goods
export const deleteSentGoods = createAsyncThunk(
  'sentGoods/deleteSentGoods',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/sent-goods/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete sent goods');
    }
  }
);

// Get sent goods statistics
export const getSentGoodsStats = createAsyncThunk(
  'sentGoods/getSentGoodsStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate = '', endDate = '' } = params;
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      const response = await axiosInstance.get(`/sent-goods/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

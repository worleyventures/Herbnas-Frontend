import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

// Get all goods requests with filtering and pagination
export const getAllGoodsRequests = createAsyncThunk(
  'goodsRequests/getAllGoodsRequests',
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
        sortBy = 'requestedDate',
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

      const response = await axiosInstance.get(`/goods/goods-requests?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getAllGoodsRequests error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch goods requests');
    }
  }
);

// Get goods request by ID
export const getGoodsRequestById = createAsyncThunk(
  'goodsRequests/getGoodsRequestById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/goods/goods-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ getGoodsRequestById error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch goods request');
    }
  }
);

// Create new goods request
export const createGoodsRequest = createAsyncThunk(
  'goodsRequests/createGoodsRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/goods/goods-requests', requestData);
      return response.data;
    } catch (error) {
      console.error('❌ createGoodsRequest error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create goods request');
    }
  }
);

// Update goods request status
export const updateGoodsRequestStatus = createAsyncThunk(
  'goodsRequests/updateGoodsRequestStatus',
  async ({ id, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/goods/goods-requests/${id}/status`, {
        status,
        rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('❌ updateGoodsRequestStatus error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update goods request status');
    }
  }
);

// Delete goods request
export const deleteGoodsRequest = createAsyncThunk(
  'goodsRequests/deleteGoodsRequest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/goods/goods-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteGoodsRequest error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete goods request');
    }
  }
);


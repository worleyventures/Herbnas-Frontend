import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all orders with filtering and pagination
export const getAllOrders = createAsyncThunk(
  'orders/getAllOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = 'all',
        paymentStatus = 'all',
        branchId = '',
        customerId = '',
        startDate = '',
        endDate = '',
        sortBy = 'orderDate',
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
      if (paymentStatus && paymentStatus !== 'all') queryParams.append('paymentStatus', paymentStatus);
      if (branchId) queryParams.append('branchId', branchId);
      if (customerId) queryParams.append('customerId', customerId);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const response = await api.get(`/orders?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  'orders/getOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

// Create new order
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

// Update order
export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order');
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status, notes }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

// Update payment information (part of order update)
export const updateOrderPayment = createAsyncThunk(
  'orders/updateOrderPayment',
  async ({ id, paymentStatus, paymentMethod, paymentNotes, transactionId, paymentDate }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${id}`, {
        paymentStatus,
        paymentMethod,
        paymentNotes,
        transactionId,
        paymentDate
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment information');
    }
  }
);

// Delete order
export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return { id, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete order');
    }
  }
);

// Get order statistics
export const getOrderStats = createAsyncThunk(
  'orders/getOrderStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { startDate = '', endDate = '', branchId = '' } = params;
      
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (branchId) queryParams.append('branchId', branchId);
      
      const response = await api.get(`/orders/stats?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order statistics');
    }
  }
);


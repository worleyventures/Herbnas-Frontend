import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all payment verifications
export const getAllPaymentVerifications = createAsyncThunk(
  'paymentVerifications/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-verifications', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment verifications');
    }
  }
);

// Get payment verification by ID
export const getPaymentVerificationById = createAsyncThunk(
  'paymentVerifications/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payment-verifications/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment verification');
    }
  }
);

// Approve payment verification
export const approvePaymentVerification = createAsyncThunk(
  'paymentVerifications/approve',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payment-verifications/${id}/approve`, { notes });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve payment verification');
    }
  }
);

// Reject payment verification
export const rejectPaymentVerification = createAsyncThunk(
  'paymentVerifications/reject',
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payment-verifications/${id}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject payment verification');
    }
  }
);

// Get pending verification count
export const getPendingVerificationCount = createAsyncThunk(
  'paymentVerifications/getPendingCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-verifications/pending/count');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending count');
    }
  }
);

// Get payment verification statistics
export const getPaymentVerificationStats = createAsyncThunk(
  'paymentVerifications/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-verifications/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch verification stats');
    }
  }
);


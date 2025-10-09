import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all payrolls
export const getAllPayrolls = createAsyncThunk(
  'payrolls/getAllPayrolls',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { page, limit, search, branchId, year, month, status, paymentStatus } = filters;
      const response = await api.get('/payrolls', {
        params: {
          page,
          limit,
          search,
          branchId,
          year,
          month,
          status,
          paymentStatus
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payrolls');
    }
  }
);

// Get payroll by ID
export const getPayrollById = createAsyncThunk(
  'payrolls/getPayrollById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payrolls/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll');
    }
  }
);

// Create new payroll
export const createPayroll = createAsyncThunk(
  'payrolls/createPayroll',
  async (payrollData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payrolls', payrollData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payroll');
    }
  }
);

// Update payroll
export const updatePayroll = createAsyncThunk(
  'payrolls/updatePayroll',
  async ({ id, payrollData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payrolls/${id}`, payrollData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payroll');
    }
  }
);

// Delete payroll
export const deletePayroll = createAsyncThunk(
  'payrolls/deletePayroll',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/payrolls/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payroll');
    }
  }
);

// Approve payroll
export const approvePayroll = createAsyncThunk(
  'payrolls/approvePayroll',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payrolls/${id}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve payroll');
    }
  }
);

// Reject payroll
export const rejectPayroll = createAsyncThunk(
  'payrolls/rejectPayroll',
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payrolls/${id}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject payroll');
    }
  }
);

// Get payroll statistics
export const getPayrollStats = createAsyncThunk(
  'payrolls/getPayrollStats',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { branchId, year, month } = filters;
      const response = await api.get('/payrolls/stats', {
        params: { branchId, year, month }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll statistics');
    }
  }
);

// Process payroll payments
export const processPayrollPayments = createAsyncThunk(
  'payrolls/processPayrollPayments',
  async ({ payrollIds, paymentDate, paymentMethod }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payrolls/process-payments', {
        payrollIds,
        paymentDate,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payroll payments');
    }
  }
);

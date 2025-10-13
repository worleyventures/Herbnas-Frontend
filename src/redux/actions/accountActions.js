import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all accounts with filtering and pagination
export const getAllAccounts = createAsyncThunk(
  'accounts/getAllAccounts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
    }
  }
);

// Get account by ID
export const getAccountById = createAsyncThunk(
  'accounts/getAccountById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch account');
    }
  }
);

// Create new account entry
export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await api.post('/accounts', accountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create account entry');
    }
  }
);

// Update account entry
export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, accountData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/accounts/${id}`, accountData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update account entry');
    }
  }
);

// Delete account entry
export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete account entry');
    }
  }
);

// Get account statistics
export const getAccountStats = createAsyncThunk(
  'accounts/getAccountStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts/stats', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch account statistics');
    }
  }
);

// Get account summary
export const getAccountSummary = createAsyncThunk(
  'accounts/getAccountSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts/summary', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch account summary');
    }
  }
);



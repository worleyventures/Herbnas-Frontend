import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all accounts with filtering and pagination
export const getAllAccounts = createAsyncThunk(
  'accounts/getAllAccounts',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('[getAllAccounts] Request params:', params);
      const response = await api.get('/accounts', { params });
      console.log('[getAllAccounts] Response received:', {
        success: response.data?.success,
        accountsCount: response.data?.data?.accounts?.length || 0,
        totalItems: response.data?.data?.pagination?.totalItems || 0,
        accounts: response.data?.data?.accounts,
        pagination: response.data?.data?.pagination
      });
      
      // Log first account details if any exist
      if (response.data?.data?.accounts?.length > 0) {
        console.log('[getAllAccounts] First account sample:', {
          accountId: response.data.data.accounts[0].accountId,
          transactionDate: response.data.data.accounts[0].transactionDate,
          orderId: response.data.data.accounts[0].orderId,
          amount: response.data.data.accounts[0].amount,
          status: response.data.data.accounts[0].status
        });
      }
      return response.data;
    } catch (error) {
      console.error('[getAllAccounts] Error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
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

// Create sales account entry from order
export const createSalesAccount = createAsyncThunk(
  'accounts/createSalesAccount',
  async (salesData, { rejectWithValue }) => {
    try {
      const response = await api.post('/accounts/sales', salesData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create sales account entry');
    }
  }
);

// Create raw material purchase account entry
export const createRawMaterialPurchaseAccount = createAsyncThunk(
  'accounts/createRawMaterialPurchaseAccount',
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await api.post('/accounts/purchase/raw-materials', purchaseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create raw material purchase account entry');
    }
  }
);

// Create branch item purchase account entry
export const createBranchItemPurchaseAccount = createAsyncThunk(
  'accounts/createBranchItemPurchaseAccount',
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await api.post('/accounts/purchase/branch-items', purchaseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create branch item purchase account entry');
    }
  }
);

// Get branch summary for super admin
export const getBranchSummary = createAsyncThunk(
  'accounts/getBranchSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts/branch-summary', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branch summary');
    }
  }
);

// Get Head Office supplier expenses
export const getHeadOfficeSupplierExpenses = createAsyncThunk(
  'accounts/getHeadOfficeSupplierExpenses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts/head-office/supplier-expenses', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch Head Office supplier expenses');
    }
  }
);

export const backfillUnrecordedRawMaterials = createAsyncThunk(
  'accounts/backfillUnrecordedRawMaterials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/accounts/head-office/backfill-unrecorded');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create account entries');
    }
  }
);

// Get comprehensive financial reports
export const getFinancialReports = createAsyncThunk(
  'accounts/getFinancialReports',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/accounts/reports/financial', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial reports');
    }
  }
);

// Get account by raw material ID
export const getAccountByRawMaterialId = createAsyncThunk(
  'accounts/getAccountByRawMaterialId',
  async (rawMaterialId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/accounts/raw-material/${rawMaterialId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch account entry');
    }
  }
);

// Update account payment status
export const updateAccountPaymentStatus = createAsyncThunk(
  'accounts/updateAccountPaymentStatus',
  async ({ accountId, paymentStatus, paymentSource, bankAccountIndex }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/accounts/${accountId}/payment-status`, {
        paymentStatus,
        paymentSource,
        bankAccountIndex
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment status');
    }
  }
);

// Get unique vendors from accounts
export const getUniqueVendors = createAsyncThunk(
  'accounts/getUniqueVendors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page, limit } = params;
      const queryParams = new URLSearchParams();
      if (page !== undefined) queryParams.append('page', page);
      if (limit !== undefined) queryParams.append('limit', limit);
      
      const response = await api.get(`/accounts/vendors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vendors');
    }
  }
);

// Get unique customers from accounts
export const getUniqueCustomers = createAsyncThunk(
  'accounts/getUniqueCustomers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page, limit } = params;
      const queryParams = new URLSearchParams();
      if (page !== undefined) queryParams.append('page', page);
      if (limit !== undefined) queryParams.append('limit', limit);
      
      const response = await api.get(`/accounts/customers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all leads with filtering and pagination
export const getAllLeads = createAsyncThunk(
  'leads/getAllLeads',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add search params
      if (params.search) queryParams.append('search', params.search);
      
      // Add filter params
      if (params.leadStatus) queryParams.append('leadStatus', params.leadStatus);
      if (params.gender) queryParams.append('gender', params.gender);
      if (params.maritalStatus) queryParams.append('maritalStatus', params.maritalStatus);
      if (params.minAge) queryParams.append('minAge', params.minAge);
      if (params.maxAge) queryParams.append('maxAge', params.maxAge);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);
      if (params.dispatchedFrom) queryParams.append('dispatchedFrom', params.dispatchedFrom);
      if (params.createdBy) queryParams.append('createdBy', params.createdBy);
      if (params.products && Array.isArray(params.products)) {
        params.products.forEach(product => queryParams.append('products', product));
      }
      
      // Add sort params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      const response = await api.get(`/leads?${queryParams.toString()}`);
      
      // Handle 204 No Content response (empty collection)
      if (response.status === 204 || !response.data) {
        return {
          data: {
            leads: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalLeads: 0,
              hasNextPage: false,
              hasPrevPage: false
            }
          }
        };
      }
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get single lead by ID
export const getLeadById = createAsyncThunk(
  'leads/getLeadById',
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leads/${leadId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Create new lead
export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await api.post('/leads', leadData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update lead
export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ leadId, leadData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leads/${leadId}`, leadData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delete lead
export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (leadId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/leads/${leadId}`);
      return { leadId, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update lead status
export const updateLeadStatus = createAsyncThunk(
  'leads/updateLeadStatus',
  async ({ leadId, leadStatus }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/leads/${leadId}/status`, { leadStatus });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Bulk update leads
export const bulkUpdateLeads = createAsyncThunk(
  'leads/bulkUpdateLeads',
  async ({ leadIds, updates }, { rejectWithValue }) => {
    try {
      const response = await api.post('/leads/admin/bulk-update', { leadIds, updates });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Get lead statistics
export const getLeadStats = createAsyncThunk(
  'leads/getLeadStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leads/admin/stats');
      
      // Handle 204 No Content response (empty collection)
      if (response.status === 204 || !response.data) {
        return {
          data: {
            overview: {
              totalLeads: 0,
              recentLeads: 0
            },
            leadsByStatus: [],
            leadsByGender: [],
            leadsByMaritalStatus: [],
            ageStats: {
              avgAge: 0,
              minAge: 0,
              maxAge: 0
            },
            topCities: [],
            topStates: [],
            leadsPerMonth: [],
            topCreators: []
          }
        };
      }
      
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Export leads
export const exportLeads = createAsyncThunk(
  'leads/exportLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leads/admin/export');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Clear lead errors
export const clearLeadErrors = createAsyncThunk(
  'leads/clearErrors',
  async () => {
    return {};
  }
);

// Clear lead success message
export const clearLeadSuccess = createAsyncThunk(
  'leads/clearSuccess',
  async () => {
    return {};
  }
);

// Set selected lead
export const setSelectedLead = createAsyncThunk(
  'leads/setSelectedLead',
  async (lead) => {
    return lead;
  }
);

// Clear selected lead
export const clearSelectedLead = createAsyncThunk(
  'leads/clearSelectedLead',
  async () => {
    return null;
  }
);

// Set lead filters
export const setLeadFilters = createAsyncThunk(
  'leads/setFilters',
  async (filters) => {
    return filters;
  }
);

// Clear lead filters
export const clearLeadFilters = createAsyncThunk(
  'leads/clearFilters',
  async () => {
    return {
      search: '',
      leadStatus: '',
      gender: '',
      maritalStatus: '',
      minAge: '',
      maxAge: '',
      startDate: '',
      endDate: '',
      city: '',
      state: '',
      dispatchedFrom: '',
      createdBy: '',
      products: [],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
  }
);

// Set pagination
export const setLeadPagination = createAsyncThunk(
  'leads/setPagination',
  async ({ page, limit }) => {
    return { page, limit };
  }
);

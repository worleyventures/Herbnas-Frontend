import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all courier partners
export const getAllCourierPartners = createAsyncThunk(
  'courierPartners/getAllCourierPartners',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { isActive } = params;
      const queryParams = new URLSearchParams();
      if (isActive !== undefined) queryParams.append('isActive', isActive);
      
      const response = await api.get(`/courier-partners?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courier partners');
    }
  }
);

// Get courier partner by ID
export const getCourierPartnerById = createAsyncThunk(
  'courierPartners/getCourierPartnerById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courier-partners/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courier partner');
    }
  }
);

// Create courier partner
export const createCourierPartner = createAsyncThunk(
  'courierPartners/createCourierPartner',
  async (courierData, { rejectWithValue }) => {
    try {
      const response = await api.post('/courier-partners', courierData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create courier partner');
    }
  }
);

// Update courier partner
export const updateCourierPartner = createAsyncThunk(
  'courierPartners/updateCourierPartner',
  async ({ id, courierData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/courier-partners/${id}`, courierData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update courier partner');
    }
  }
);

// Delete courier partner
export const deleteCourierPartner = createAsyncThunk(
  'courierPartners/deleteCourierPartner',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/courier-partners/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete courier partner');
    }
  }
);




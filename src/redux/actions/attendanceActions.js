import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Employee self-service actions
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (data, { rejectWithValue }) => {
    try {
      console.log('🔍 checkIn action called with data:', data);
      console.log('🔍 Making API call to /attendance/checkin');
      const response = await api.post('/attendance/checkin', data);
      console.log('🔍 API response:', response.data);
      return response.data;
    } catch (err) {
      console.error('🔍 checkIn API error:', err);
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/checkout', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const startBreak = createAsyncThunk(
  'attendance/startBreak',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/break/start', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const endBreak = createAsyncThunk(
  'attendance/endBreak',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/break/end', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getTodayAttendance = createAsyncThunk(
  'attendance/getTodayAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/today');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getMyAttendance = createAsyncThunk(
  'attendance/getMyAttendance',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/my-attendance', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Supervisor approval actions
export const getPendingApprovals = createAsyncThunk(
  'attendance/getPendingApprovals',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/pending-approvals', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const approveAttendance = createAsyncThunk(
  'attendance/approveAttendance',
  async ({ attendanceId, action, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/attendance/${attendanceId}/approve`, {
        action,
        rejectionReason
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Admin actions (existing)
export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getAttendanceById = createAsyncThunk(
  'attendance/getAttendanceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attendance/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createAttendance = createAsyncThunk(
  'attendance/createAttendance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/attendance/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteAttendance = createAsyncThunk(
  'attendance/deleteAttendance',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/attendance/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getAttendanceStats = createAsyncThunk(
  'attendance/getAttendanceStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/stats', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const uploadAttendanceExcel = createAsyncThunk(
  'attendance/uploadAttendanceExcel',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
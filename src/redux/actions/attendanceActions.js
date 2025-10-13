import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/axiosInstance';

// Get all attendance records
export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/attendance?${queryParams}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch attendance records');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch attendance records'
      );
    }
  }
);

// Get attendance by ID
export const getAttendanceById = createAsyncThunk(
  'attendance/getAttendanceById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attendance/${id}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch attendance record');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch attendance record'
      );
    }
  }
);

// Create attendance record
export const createAttendance = createAsyncThunk(
  'attendance/createAttendance',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attendance', attendanceData);
      
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to create attendance record');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to create attendance record'
      );
    }
  }
);

// Update attendance record
export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/attendance/${id}`, attendanceData);
      
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to update attendance record');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to update attendance record'
      );
    }
  }
);

// Delete attendance record
export const deleteAttendance = createAsyncThunk(
  'attendance/deleteAttendance',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/attendance/${id}`);
      
      if (response.data.success) {
        return id;
      } else {
        return rejectWithValue(response.data.message || 'Failed to delete attendance record');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete attendance record'
      );
    }
  }
);

// Get attendance stats
export const getAttendanceStats = createAsyncThunk(
  'attendance/getAttendanceStats',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/attendance/stats?${queryParams}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch attendance stats');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch attendance stats'
      );
    }
  }
);

// Upload attendance from Excel
export const uploadAttendanceExcel = createAsyncThunk(
  'attendance/uploadAttendanceExcel',
  async ({ file, month }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', month);
      
      const response = await api.post('/attendance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to upload attendance file');
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload attendance file'
      );
    }
  }
);

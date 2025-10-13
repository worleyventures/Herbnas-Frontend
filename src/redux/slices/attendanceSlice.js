import { createSlice } from '@reduxjs/toolkit';
import {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  uploadAttendanceExcel
} from '../actions/attendanceActions';

const initialState = {
  attendance: [],
  currentAttendance: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  }
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    clearCurrentAttendance: (state) => {
      state.currentAttendance = null;
    },
    setAttendanceFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAttendanceFilters: (state) => {
      state.filters = {
        searchTerm: '',
        branchFilter: 'all',
        employeeFilter: 'all',
        startDate: '',
        endDate: '',
        statusFilter: 'all'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Attendance
      .addCase(getAllAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload.data.attendance || [];
        state.pagination = action.payload.data.pagination || state.pagination;
        state.error = null;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Attendance By ID
      .addCase(getAttendanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload.data.attendance;
        state.error = null;
      })
      .addCase(getAttendanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Attendance
      .addCase(createAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance.unshift(action.payload.data.attendance);
        state.error = null;
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Attendance
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAttendance = action.payload.data.attendance;
        const index = state.attendance.findIndex(a => a._id === updatedAttendance._id);
        if (index !== -1) {
          state.attendance[index] = updatedAttendance;
        }
        if (state.currentAttendance && state.currentAttendance._id === updatedAttendance._id) {
          state.currentAttendance = updatedAttendance;
        }
        state.error = null;
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = state.attendance.filter(a => a._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Attendance Stats
      .addCase(getAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data.summary || [];
        state.error = null;
      })
      .addCase(getAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Attendance Excel
      .addCase(uploadAttendanceExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAttendanceExcel.fulfilled, (state, action) => {
        state.loading = false;
        // Refresh attendance data after successful upload
        // The parent component will handle calling getAllAttendance
        state.error = null;
      })
      .addCase(uploadAttendanceExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearAttendanceError, 
  clearCurrentAttendance, 
  setAttendanceFilters, 
  clearAttendanceFilters 
} = attendanceSlice.actions;

// Selectors
export const selectAttendance = (state) => state.attendance.attendance;
export const selectCurrentAttendance = (state) => state.attendance.currentAttendance;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectAttendanceStats = (state) => state.attendance.stats;
export const selectAttendancePagination = (state) => state.attendance.pagination;

export default attendanceSlice.reducer;

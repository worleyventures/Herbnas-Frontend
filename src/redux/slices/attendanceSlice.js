import { createSlice } from '@reduxjs/toolkit';
import {
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getTodayAttendance,
  getMyAttendance,
  getPendingApprovals,
  approveAttendance,
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
  uploadAttendanceExcel
} from '../actions/attendanceActions';

const initialState = {
  // Employee self-service state
  todayAttendance: null,
  myAttendance: [],
  myAttendancePagination: null,
  
  // Supervisor approval state
  pendingApprovals: [],
  pendingApprovalsPagination: null,
  
  // Admin state
  allAttendance: [],
  allAttendancePagination: null,
  currentAttendance: null,
  attendanceStats: null,
  
  // UI state
  loading: false,
  error: null,
  success: false,
  message: null,
  
  // Attendance modal state
  attendanceModalOpen: false,
  attendanceAction: null, // 'checkin', 'checkout', 'break'
  breakInProgress: false
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    openAttendanceModal: (state, action) => {
      state.attendanceModalOpen = true;
      state.attendanceAction = action.payload;
    },
    closeAttendanceModal: (state) => {
      state.attendanceModalOpen = false;
      state.attendanceAction = null;
    },
    setBreakInProgress: (state, action) => {
      state.breakInProgress = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check-in
      .addCase(checkIn.pending, (state) => {
        console.log('🔍 checkIn.pending - setting loading to true');
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        console.log('🔍 checkIn.fulfilled - success!', action.payload);
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.todayAttendance = action.payload.data.attendance;
        state.attendanceModalOpen = false;
      })
      .addCase(checkIn.rejected, (state, action) => {
        console.log('🔍 checkIn.rejected - error:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check-out
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.todayAttendance = action.payload.data.attendance;
        state.attendanceModalOpen = false;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Start break
      .addCase(startBreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startBreak.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.todayAttendance = action.payload.data.attendance;
        state.breakInProgress = true;
        state.attendanceModalOpen = false;
      })
      .addCase(startBreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // End break
      .addCase(endBreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(endBreak.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.todayAttendance = action.payload.data.attendance;
        state.breakInProgress = false;
        state.attendanceModalOpen = false;
      })
      .addCase(endBreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get today's attendance
      .addCase(getTodayAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.todayAttendance = action.payload.data.attendance;
        // Set break in progress status
        if (state.todayAttendance && state.todayAttendance.breakTime?.start?.time && !state.todayAttendance.breakTime?.end?.time) {
          state.breakInProgress = true;
        } else {
          state.breakInProgress = false;
        }
      })
      .addCase(getTodayAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get my attendance
      .addCase(getMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.myAttendance = action.payload.data.attendance;
        state.myAttendancePagination = action.payload.data.pagination;
      })
      .addCase(getMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get pending approvals
      .addCase(getPendingApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApprovals = action.payload.data.attendance;
        state.pendingApprovalsPagination = action.payload.data.pagination;
      })
      .addCase(getPendingApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Approve attendance
      .addCase(approveAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        // Update the attendance in pending approvals
        const index = state.pendingApprovals.findIndex(
          item => item._id === action.payload.data.attendance._id
        );
        if (index !== -1) {
          state.pendingApprovals[index] = action.payload.data.attendance;
        }
      })
      .addCase(approveAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get all attendance (admin)
      .addCase(getAllAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.allAttendance = action.payload.data.attendance;
        state.allAttendancePagination = action.payload.data.pagination;
      })
      .addCase(getAllAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get attendance by ID
      .addCase(getAttendanceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAttendance = action.payload.data.attendance;
      })
      .addCase(getAttendanceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create attendance
      .addCase(createAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.allAttendance.unshift(action.payload.data.attendance);
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update attendance
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        const index = state.allAttendance.findIndex(
          item => item._id === action.payload.data.attendance._id
        );
        if (index !== -1) {
          state.allAttendance[index] = action.payload.data.attendance;
        }
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.allAttendance = state.allAttendance.filter(
          item => item._id !== action.payload.data.attendance._id
        );
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get attendance stats
      .addCase(getAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceStats = action.payload.data;
      })
      .addCase(getAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Upload attendance Excel
      .addCase(uploadAttendanceExcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAttendanceExcel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(uploadAttendanceExcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearError,
  clearSuccess,
  openAttendanceModal,
  closeAttendanceModal,
  setBreakInProgress
} = attendanceSlice.actions;

// Selectors
export const selectAttendance = (state) => state.attendance.allAttendance;
export const selectAttendanceLoading = (state) => state.attendance.loading;
export const selectAttendanceStats = (state) => state.attendance.attendanceStats;
export const selectAttendancePagination = (state) => state.attendance.allAttendancePagination;
export const selectTodayAttendance = (state) => state.attendance.todayAttendance;
export const selectMyAttendance = (state) => state.attendance.myAttendance;
export const selectMyAttendancePagination = (state) => state.attendance.myAttendancePagination;
export const selectPendingApprovals = (state) => state.attendance.pendingApprovals;
export const selectPendingApprovalsPagination = (state) => state.attendance.pendingApprovalsPagination;
export const selectCurrentAttendance = (state) => state.attendance.currentAttendance;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectAttendanceSuccess = (state) => state.attendance.success;
export const selectAttendanceMessage = (state) => state.attendance.message;
export const selectBreakInProgress = (state) => state.attendance.breakInProgress;

export default attendanceSlice.reducer;
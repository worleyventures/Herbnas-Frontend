import { createSlice } from '@reduxjs/toolkit';
import {
  getAllPaymentVerifications,
  getPaymentVerificationById,
  approvePaymentVerification,
  rejectPaymentVerification,
  getPendingVerificationCount,
  getPaymentVerificationStats
} from '../actions/paymentVerificationActions';

const initialState = {
  verifications: [],
  currentVerification: null,
  pendingCount: 0,
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  },
  statsLoading: false,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  }
};

const paymentVerificationSlice = createSlice({
  name: 'paymentVerifications',
  initialState,
  reducers: {
    clearVerifications: (state) => {
      state.verifications = [];
      state.currentVerification = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Get all payment verifications
    builder
      .addCase(getAllPaymentVerifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPaymentVerifications.fulfilled, (state, action) => {
        state.loading = false;
        state.verifications = action.payload?.data?.verifications || [];
        state.pagination = action.payload?.data?.pagination || state.pagination;
      })
      .addCase(getAllPaymentVerifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get payment verification by ID
      .addCase(getPaymentVerificationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentVerificationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVerification = action.payload?.data?.verification || null;
      })
      .addCase(getPaymentVerificationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve payment verification
      .addCase(approvePaymentVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePaymentVerification.fulfilled, (state, action) => {
        state.loading = false;
        // Update verification in list
        const verification = action.payload?.data?.verification;
        if (verification) {
          const index = state.verifications.findIndex(v => v._id === verification._id);
          if (index !== -1) {
            state.verifications[index] = verification;
          }
        }
        // Decrease pending count
        if (state.pendingCount > 0) {
          state.pendingCount--;
        }
      })
      .addCase(approvePaymentVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject payment verification
      .addCase(rejectPaymentVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPaymentVerification.fulfilled, (state, action) => {
        state.loading = false;
        // Update verification in list
        const verification = action.payload?.data?.verification;
        if (verification) {
          const index = state.verifications.findIndex(v => v._id === verification._id);
          if (index !== -1) {
            state.verifications[index] = verification;
          }
        }
        // Decrease pending count
        if (state.pendingCount > 0) {
          state.pendingCount--;
        }
      })
      .addCase(rejectPaymentVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get pending verification count
      .addCase(getPendingVerificationCount.pending, (state) => {
        // Don't set loading for count
      })
      .addCase(getPendingVerificationCount.fulfilled, (state, action) => {
        state.pendingCount = action.payload?.data?.count || 0;
      })
      .addCase(getPendingVerificationCount.rejected, (state) => {
        // Don't set error for count
      })
      // Get payment verification statistics
      .addCase(getPaymentVerificationStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getPaymentVerificationStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload?.data || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        };
      })
      .addCase(getPaymentVerificationStats.rejected, (state) => {
        state.statsLoading = false;
      });
  }
});

export const { clearVerifications, clearError } = paymentVerificationSlice.actions;

// Selectors
export const selectPaymentVerifications = (state) => state.paymentVerifications.verifications;
export const selectCurrentVerification = (state) => state.paymentVerifications.currentVerification;
export const selectPendingVerificationCount = (state) => state.paymentVerifications.pendingCount;
export const selectPaymentVerificationLoading = (state) => state.paymentVerifications.loading;
export const selectPaymentVerificationError = (state) => state.paymentVerifications.error;
export const selectPaymentVerificationPagination = (state) => state.paymentVerifications.pagination;
export const selectPaymentVerificationStats = (state) => state.paymentVerifications.stats;
export const selectPaymentVerificationStatsLoading = (state) => state.paymentVerifications.statsLoading;

export default paymentVerificationSlice.reducer;


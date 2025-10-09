import { createSlice } from '@reduxjs/toolkit';
import {
  getAllPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
  approvePayroll,
  rejectPayroll,
  getPayrollStats,
  processPayrollPayments
} from '../actions/payrollActions';

const initialState = {
  payrolls: [],
  currentPayroll: null,
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

const payrollSlice = createSlice({
  name: 'payrolls',
  initialState,
  reducers: {
    clearPayrollError: (state) => {
      state.error = null;
    },
    clearCurrentPayroll: (state) => {
      state.currentPayroll = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Payrolls
      .addCase(getAllPayrolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPayrolls.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload.data.payrolls;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(getAllPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Payroll By ID
      .addCase(getPayrollById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayrollById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayroll = action.payload.data.payroll;
        state.error = null;
      })
      .addCase(getPayrollById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Payroll
      .addCase(createPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls.unshift(action.payload.data.payroll);
        state.error = null;
      })
      .addCase(createPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Payroll
      .addCase(updatePayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPayroll = action.payload.data.payroll;
        const index = state.payrolls.findIndex(p => p._id === updatedPayroll._id);
        if (index !== -1) {
          state.payrolls[index] = updatedPayroll;
        }
        if (state.currentPayroll && state.currentPayroll._id === updatedPayroll._id) {
          state.currentPayroll = updatedPayroll;
        }
        state.error = null;
      })
      .addCase(updatePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Payroll
      .addCase(deletePayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = state.payrolls.filter(p => p._id !== action.payload);
        state.error = null;
      })
      .addCase(deletePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Payroll
      .addCase(approvePayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePayroll.fulfilled, (state, action) => {
        state.loading = false;
        const approvedPayroll = action.payload.data.payroll;
        const index = state.payrolls.findIndex(p => p._id === approvedPayroll._id);
        if (index !== -1) {
          state.payrolls[index] = approvedPayroll;
        }
        if (state.currentPayroll && state.currentPayroll._id === approvedPayroll._id) {
          state.currentPayroll = approvedPayroll;
        }
        state.error = null;
      })
      .addCase(approvePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reject Payroll
      .addCase(rejectPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPayroll.fulfilled, (state, action) => {
        state.loading = false;
        const rejectedPayroll = action.payload.data.payroll;
        const index = state.payrolls.findIndex(p => p._id === rejectedPayroll._id);
        if (index !== -1) {
          state.payrolls[index] = rejectedPayroll;
        }
        if (state.currentPayroll && state.currentPayroll._id === rejectedPayroll._id) {
          state.currentPayroll = rejectedPayroll;
        }
        state.error = null;
      })
      .addCase(rejectPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Payroll Stats
      .addCase(getPayrollStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPayrollStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data.summary;
        state.error = null;
      })
      .addCase(getPayrollStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process Payroll Payments
      .addCase(processPayrollPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayrollPayments.fulfilled, (state, action) => {
        state.loading = false;
        // Update payrolls that were processed
        const processedIds = action.meta.arg.payrollIds;
        state.payrolls = state.payrolls.map(payroll => {
          if (processedIds.includes(payroll._id)) {
            return {
              ...payroll,
              status: 'processed',
              payment: {
                ...payroll.payment,
                status: 'processed',
                paymentDate: action.meta.arg.paymentDate || new Date().toISOString()
              }
            };
          }
          return payroll;
        });
        state.error = null;
      })
      .addCase(processPayrollPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPayrollError, clearCurrentPayroll } = payrollSlice.actions;

// Selectors
export const selectPayrolls = (state) => state.payrolls.payrolls;
export const selectCurrentPayroll = (state) => state.payrolls.currentPayroll;
export const selectPayrollLoading = (state) => state.payrolls.loading;
export const selectPayrollError = (state) => state.payrolls.error;
export const selectPayrollStats = (state) => state.payrolls.stats;
export const selectPayrollPagination = (state) => state.payrolls.pagination;

export default payrollSlice.reducer;

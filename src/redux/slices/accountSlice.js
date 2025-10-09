import { createSlice } from '@reduxjs/toolkit';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountStats,
  getAccountSummary
} from '../actions/accountActions';

const initialState = {
  accounts: [],
  currentAccount: null,
  stats: null,
  summary: null,
  loading: false,
  statsLoading: false,
  summaryLoading: false,
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

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearAccountError: (state) => {
      state.error = null;
    },
    clearCurrentAccount: (state) => {
      state.currentAccount = null;
    },
    clearAccountStats: (state) => {
      state.stats = null;
    },
    clearAccountSummary: (state) => {
      state.summary = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all accounts
      .addCase(getAllAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.data.accounts;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(getAllAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get account by ID
      .addCase(getAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccount = action.payload.data.account;
        state.error = null;
      })
      .addCase(getAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create account
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.unshift(action.payload.data.account);
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update account
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAccount = action.payload.data.account;
        const index = state.accounts.findIndex(account => account._id === updatedAccount._id);
        if (index !== -1) {
          state.accounts[index] = updatedAccount;
        }
        if (state.currentAccount && state.currentAccount._id === updatedAccount._id) {
          state.currentAccount = updatedAccount;
        }
        state.error = null;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.meta.arg;
        state.accounts = state.accounts.filter(account => account._id !== deletedId);
        if (state.currentAccount && state.currentAccount._id === deletedId) {
          state.currentAccount = null;
        }
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get account stats
      .addCase(getAccountStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(getAccountStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(getAccountStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // Get account summary
      .addCase(getAccountSummary.pending, (state) => {
        state.summaryLoading = true;
        state.error = null;
      })
      .addCase(getAccountSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload.data;
        state.error = null;
      })
      .addCase(getAccountSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearAccountError,
  clearCurrentAccount,
  clearAccountStats,
  clearAccountSummary
} = accountSlice.actions;

// Selectors
export const selectAccounts = (state) => state.accounts.accounts;
export const selectCurrentAccount = (state) => state.accounts.currentAccount;
export const selectAccountLoading = (state) => state.accounts.loading;
export const selectAccountError = (state) => state.accounts.error;
export const selectAccountStats = (state) => state.accounts.stats;
export const selectAccountStatsLoading = (state) => state.accounts.statsLoading;
export const selectAccountSummary = (state) => state.accounts.summary;
export const selectAccountSummaryLoading = (state) => state.accounts.summaryLoading;
export const selectAccountPagination = (state) => state.accounts.pagination;

export default accountSlice.reducer;

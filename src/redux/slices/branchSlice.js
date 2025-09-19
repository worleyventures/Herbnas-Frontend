import { createSlice } from '@reduxjs/toolkit';
import {
  getAllBranches,
  getActiveBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStats
} from '../actions/branchActions';

const initialState = {
  branches: [],
  loading: false,
  error: null,
  stats: null,
  statsLoading: false,
  statsError: null,
};

const branchSlice = createSlice({
  name: 'branches',
  initialState,
  reducers: {
    // Set branches
    setBranches: (state, action) => {
      state.branches = action.payload;
    },
    
    // Add new branch
    addBranch: (state, action) => {
      state.branches.unshift(action.payload);
    },
    
    // Update branch in state
    updateBranchInState: (state, action) => {
      const index = state.branches.findIndex(branch => branch._id === action.payload._id);
      if (index !== -1) {
        state.branches[index] = action.payload;
      }
    },
    
    // Remove branch
    removeBranch: (state, action) => {
      state.branches = state.branches.filter(branch => branch._id !== action.payload);
    },
    
    // Set branch stats
    setBranchStats: (state, action) => {
      state.stats = action.payload;
    },
    
    // Set loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.statsError = null;
    },
    
    // Clear all errors
    clearBranchErrors: (state) => {
      state.error = null;
      state.statsError = null;
    },
    
    // Clear success
    clearBranchSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all branches
      .addCase(getAllBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.data.branches || action.payload.data;
        state.error = null;
      })
      .addCase(getAllBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.branches = [];
      })
      
      // Get active branches
      .addCase(getActiveBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload.data.branches || action.payload.data;
        state.error = null;
      })
      .addCase(getActiveBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.branches = [];
      })
      
      // Create branch
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.unshift(action.payload.data.branch || action.payload.data);
        state.error = null;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update branch
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBranch = action.payload.data.branch || action.payload.data;
        const index = state.branches.findIndex(branch => branch._id === updatedBranch._id);
        if (index !== -1) {
          state.branches[index] = updatedBranch;
        }
        state.error = null;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete branch
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(branch => branch._id !== action.payload.branchId);
        state.error = null;
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get branch stats
      .addCase(getBranchStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getBranchStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data || action.payload;
        state.statsError = null;
      })
      .addCase(getBranchStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  }
});

export const {
  setBranches,
  addBranch,
  updateBranchInState,
  removeBranch,
  setBranchStats,
  setLoading,
  setError,
  clearError,
  clearBranchErrors,
  clearBranchSuccess,
} = branchSlice.actions;

// Selectors
export const selectBranches = (state) => state.branches.branches;
export const selectBranchLoading = (state) => state.branches.loading;
export const selectBranchError = (state) => state.branches.error;
export const selectBranchStats = (state) => state.branches.stats;
export const selectBranchStatsLoading = (state) => state.branches.statsLoading;
export const selectBranchStatsError = (state) => state.branches.statsError;

export default branchSlice.reducer;

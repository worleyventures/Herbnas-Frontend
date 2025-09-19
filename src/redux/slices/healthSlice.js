import { createSlice } from '@reduxjs/toolkit';
import {
  getAllHealthIssues,
  getActiveHealthIssues,
  getHealthIssueById,
  createHealthIssue,
  updateHealthIssue,
  deleteHealthIssue,
  restoreHealthIssue,
  getHealthIssueStats,
  bulkUpdateHealthIssues,
  exportHealthIssues,
  addProductSuggestion,
  removeProductSuggestion,
  getSuggestedProducts,
  getProductsForSuggestion
} from '../actions/healthActions';

const initialState = {
  healthIssues: [],
  activeHealthIssues: [],
  loading: false,
  error: null,
  stats: null,
  statsLoading: false,
  statsError: null,
  createLoading: false,
  createError: null,
  createSuccess: null,
  updateLoading: false,
  updateError: null,
  updateSuccess: null,
  deleteLoading: false,
  deleteError: null,
  deleteSuccess: null,
  // Product suggestion states
  suggestedProducts: [],
  availableProducts: [],
  suggestionLoading: false,
  suggestionError: null,
  suggestionSuccess: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalHealthIssues: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    setHealthIssues: (state, action) => {
      state.healthIssues = action.payload;
    },
    addHealthIssue: (state, action) => {
      state.healthIssues.push(action.payload);
    },
    updateHealthIssueInState: (state, action) => {
      const index = state.healthIssues.findIndex(healthIssue => healthIssue._id === action.payload._id);
      if (index !== -1) {
        state.healthIssues[index] = action.payload;
      }
    },
    removeHealthIssue: (state, action) => {
      state.healthIssues = state.healthIssues.filter(healthIssue => healthIssue._id !== action.payload);
    },
    setHealthIssueStats: (state, action) => {
      state.stats = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.createSuccess = null;
      state.updateSuccess = null;
      state.deleteSuccess = null;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    clearSuggestedProducts: (state) => {
      state.suggestedProducts = [];
      state.availableProducts = [];
      state.suggestionError = null;
      state.suggestionSuccess = null;
    }
  },
  extraReducers: (builder) => {
    // Get all health issues
    builder
      .addCase(getAllHealthIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllHealthIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.healthIssues = action.payload.data?.healthIssues || action.payload.healthIssues || [];
        state.pagination = action.payload.data?.pagination || action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(getAllHealthIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get active health issues
    builder
      .addCase(getActiveHealthIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveHealthIssues.fulfilled, (state, action) => {
        console.log('getActiveHealthIssues.fulfilled - action.payload:', action.payload);
        state.loading = false;
        state.activeHealthIssues = action.payload.data?.healthIssues || action.payload.healthIssues || [];
        console.log('getActiveHealthIssues.fulfilled - state.activeHealthIssues:', state.activeHealthIssues);
        state.error = null;
      })
      .addCase(getActiveHealthIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get health issue by ID
    builder
      .addCase(getHealthIssueById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHealthIssueById.fulfilled, (state, action) => {
        state.loading = false;
        const healthIssue = action.payload.data?.healthIssue || action.payload.healthIssue;
        const index = state.healthIssues.findIndex(h => h._id === healthIssue._id);
        if (index !== -1) {
          state.healthIssues[index] = healthIssue;
        } else {
          state.healthIssues.push(healthIssue);
        }
        state.error = null;
      })
      .addCase(getHealthIssueById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create health issue
    builder
      .addCase(createHealthIssue.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createHealthIssue.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = action.payload.message || 'Health issue created successfully';
        const healthIssue = action.payload.data?.healthIssue || action.payload.healthIssue;
        state.healthIssues.push(healthIssue);
        state.createError = null;
      })
      .addCase(createHealthIssue.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
        state.createSuccess = null;
      });

    // Update health issue
    builder
      .addCase(updateHealthIssue.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateHealthIssue.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message || 'Health issue updated successfully';
        const healthIssue = action.payload.data?.healthIssue || action.payload.healthIssue;
        const index = state.healthIssues.findIndex(h => h._id === healthIssue._id);
        if (index !== -1) {
          state.healthIssues[index] = healthIssue;
        }
        state.updateError = null;
      })
      .addCase(updateHealthIssue.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = null;
      });

    // Delete health issue
    builder
      .addCase(deleteHealthIssue.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteHealthIssue.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = action.payload.message || 'Health issue deleted successfully';
        // Note: We don't remove from state as it's a soft delete (isActive: false)
        state.deleteError = null;
      })
      .addCase(deleteHealthIssue.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.deleteSuccess = null;
      });

    // Restore health issue
    builder
      .addCase(restoreHealthIssue.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(restoreHealthIssue.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message || 'Health issue restored successfully';
        const healthIssue = action.payload.data?.healthIssue || action.payload.healthIssue;
        const index = state.healthIssues.findIndex(h => h._id === healthIssue._id);
        if (index !== -1) {
          state.healthIssues[index] = healthIssue;
        }
        state.updateError = null;
      })
      .addCase(restoreHealthIssue.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = null;
      });

    // Get health issue stats
    builder
      .addCase(getHealthIssueStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getHealthIssueStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data || action.payload;
        state.statsError = null;
      })
      .addCase(getHealthIssueStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });

    // Bulk update health issues
    builder
      .addCase(bulkUpdateHealthIssues.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(bulkUpdateHealthIssues.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message || 'Health issues updated successfully';
        state.updateError = null;
      })
      .addCase(bulkUpdateHealthIssues.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = null;
      });

    // Export health issues
    builder
      .addCase(exportHealthIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportHealthIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(exportHealthIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Product suggestion reducers
    builder
      .addCase(addProductSuggestion.pending, (state) => {
        state.suggestionLoading = true;
        state.suggestionError = null;
        state.suggestionSuccess = null;
      })
      .addCase(addProductSuggestion.fulfilled, (state, action) => {
        state.suggestionLoading = false;
        state.suggestionSuccess = action.payload.message || 'Product suggestion added successfully';
        // Update the health issue in the list with new suggestions
        const healthIssue = action.payload.data.healthIssue;
        const index = state.healthIssues.findIndex(h => h._id === healthIssue._id);
        if (index !== -1) {
          state.healthIssues[index] = healthIssue;
        }
        state.suggestionError = null;
      })
      .addCase(addProductSuggestion.rejected, (state, action) => {
        state.suggestionLoading = false;
        state.suggestionError = action.payload;
        state.suggestionSuccess = null;
      });

    builder
      .addCase(removeProductSuggestion.pending, (state) => {
        state.suggestionLoading = true;
        state.suggestionError = null;
        state.suggestionSuccess = null;
      })
      .addCase(removeProductSuggestion.fulfilled, (state, action) => {
        state.suggestionLoading = false;
        state.suggestionSuccess = action.payload.message || 'Product suggestion removed successfully';
        // Update the health issue in the list with updated suggestions
        const healthIssue = action.payload.data.healthIssue;
        const index = state.healthIssues.findIndex(h => h._id === healthIssue._id);
        if (index !== -1) {
          state.healthIssues[index] = healthIssue;
        }
        state.suggestionError = null;
      })
      .addCase(removeProductSuggestion.rejected, (state, action) => {
        state.suggestionLoading = false;
        state.suggestionError = action.payload;
        state.suggestionSuccess = null;
      });

    builder
      .addCase(getSuggestedProducts.pending, (state) => {
        state.suggestionLoading = true;
        state.suggestionError = null;
      })
      .addCase(getSuggestedProducts.fulfilled, (state, action) => {
        state.suggestionLoading = false;
        state.suggestedProducts = action.payload.data.suggestedProducts || [];
        state.suggestionError = null;
      })
      .addCase(getSuggestedProducts.rejected, (state, action) => {
        state.suggestionLoading = false;
        state.suggestionError = action.payload;
      });

    builder
      .addCase(getProductsForSuggestion.pending, (state) => {
        state.suggestionLoading = true;
        state.suggestionError = null;
      })
      .addCase(getProductsForSuggestion.fulfilled, (state, action) => {
        state.suggestionLoading = false;
        state.availableProducts = action.payload.data.products || [];
        state.suggestionError = null;
      })
      .addCase(getProductsForSuggestion.rejected, (state, action) => {
        state.suggestionLoading = false;
        state.suggestionError = action.payload;
      });
  }
});

export const {
  setHealthIssues,
  addHealthIssue,
  updateHealthIssueInState,
  removeHealthIssue,
  setHealthIssueStats,
  setLoading,
  setError,
  clearError,
  clearSuccess,
  setPagination,
  clearSuggestedProducts
} = healthSlice.actions;

// Selectors
export const selectHealthIssues = (state) => state.health.healthIssues;
export const selectActiveHealthIssues = (state) => state.health.activeHealthIssues;
export const selectHealthLoading = (state) => state.health.loading;
export const selectHealthError = (state) => state.health.error;
export const selectHealthStats = (state) => state.health.stats;
export const selectHealthStatsLoading = (state) => state.health.statsLoading;
export const selectHealthStatsError = (state) => state.health.statsError;
export const selectHealthPagination = (state) => state.health.pagination;
// Product suggestion selectors
export const selectSuggestedProducts = (state) => state.health.suggestedProducts;
export const selectAvailableProducts = (state) => state.health.availableProducts;
export const selectSuggestionLoading = (state) => state.health.suggestionLoading;
export const selectSuggestionError = (state) => state.health.suggestionError;
export const selectSuggestionSuccess = (state) => state.health.suggestionSuccess;

export default healthSlice.reducer;


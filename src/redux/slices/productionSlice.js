import { createSlice } from '@reduxjs/toolkit';
import {
  getAllProductions,
  getProductionById,
  createProduction,
  updateProduction,
  deleteProduction,
  getProductionStats,
  getProductsByStage,
  updateProductionStage,
  moveToInventory
} from '../actions/productionActions';

const initialState = {
  productions: [],
  productsByStage: [],
  currentProduction: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProductions: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

const productionSlice = createSlice({
  name: 'productions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduction: (state) => {
      state.currentProduction = null;
    },
    clearProductions: (state) => {
      state.productions = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all productions
      .addCase(getAllProductions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProductions.fulfilled, (state, action) => {
        state.loading = false;
        state.productions = action.payload.data.productions || [];
        state.pagination = action.payload.data.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(getAllProductions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.productions = [];
        state.pagination = initialState.pagination;
      })

      // Get production by ID
      .addCase(getProductionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduction = action.payload.data.production;
        state.error = null;
      })
      .addCase(getProductionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentProduction = null;
      })

      // Get products by stage
      .addCase(getProductsByStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductsByStage.fulfilled, (state, action) => {
        state.loading = false;
        state.productsByStage = action.payload.data.products || [];
        state.error = null;
      })
      .addCase(getProductsByStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.productsByStage = [];
      })

      // Create production
      .addCase(createProduction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduction.fulfilled, (state, action) => {
        state.loading = false;
        state.productions.unshift(action.payload.data.production);
        state.error = null;
      })
      .addCase(createProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update production
      .addCase(updateProduction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduction.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduction = action.payload.data.production;
        const index = state.productions.findIndex(p => p._id === updatedProduction._id);
        if (index !== -1) {
          state.productions[index] = updatedProduction;
        }
        if (state.currentProduction && state.currentProduction._id === updatedProduction._id) {
          state.currentProduction = updatedProduction;
        }
        state.error = null;
      })
      .addCase(updateProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete production
      .addCase(deleteProduction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduction.fulfilled, (state, action) => {
        state.loading = false;
        const productionId = action.meta.arg;
        state.productions = state.productions.filter(p => p._id !== productionId);
        if (state.currentProduction && state.currentProduction._id === productionId) {
          state.currentProduction = null;
        }
        state.error = null;
      })
      .addCase(deleteProduction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get production statistics
      .addCase(getProductionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(getProductionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = null;
      })

      // Update production stage
      .addCase(updateProductionStage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductionStage.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.data.product;
        const index = state.productsByStage.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          state.productsByStage[index] = updatedProduct;
        }
        state.error = null;
      })
      .addCase(updateProductionStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Move to inventory
      .addCase(moveToInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveToInventory.fulfilled, (state, action) => {
        state.loading = false;
        const productId = action.meta.arg;
        state.productsByStage = state.productsByStage.filter(p => p._id !== productId);
        state.error = null;
      })
      .addCase(moveToInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentProduction, clearProductions } = productionSlice.actions;
export default productionSlice.reducer;

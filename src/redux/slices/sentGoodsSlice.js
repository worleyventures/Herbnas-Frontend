import { createSlice } from '@reduxjs/toolkit';
import {
  getAllSentGoods,
  getSentGoodsById,
  createSentGoods,
  updateSentGoodsStatus,
  deleteSentGoods,
  getSentGoodsStats,
  getReceivedGoods
} from '../actions/sentGoodsActions';

const initialState = {
  sentGoods: [],
  currentSentGoods: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalSentGoods: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    status: 'all',
    branchId: '',
    startDate: '',
    endDate: '',
    sortBy: 'sentAt',
    sortOrder: 'desc'
  }
};

const sentGoodsSlice = createSlice({
  name: 'sentGoods',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSentGoods: (state) => {
      state.currentSentGoods = null;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all sent goods
      .addCase(getAllSentGoods.pending, (state) => {
        console.log('⏳ getAllSentGoods.pending - setting loading to true');
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSentGoods.fulfilled, (state, action) => {
        console.log('✅ getAllSentGoods.fulfilled - payload:', action.payload);
        console.log('✅ Storing sentGoods:', action.payload.data.sentGoods);
        console.log('✅ Before update - state.sentGoods:', state.sentGoods);
        state.loading = false;
        state.sentGoods = action.payload.data.sentGoods;
        state.pagination = action.payload.data.pagination;
        state.error = null;
        console.log('✅ After update - state.sentGoods:', state.sentGoods);
      })
      .addCase(getAllSentGoods.rejected, (state, action) => {
        console.log('❌ getAllSentGoods.rejected - error:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // Get sent goods by ID
      .addCase(getSentGoodsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSentGoodsById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSentGoods = action.payload.data.sentGoods;
        state.error = null;
      })
      .addCase(getSentGoodsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create sent goods
      .addCase(createSentGoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSentGoods.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new sent goods to the beginning of the list
        state.sentGoods.unshift(action.payload.data.sentGoods);
        state.error = null;
      })
      .addCase(createSentGoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update sent goods status
      .addCase(updateSentGoodsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSentGoodsStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSentGoods = action.payload.data.sentGoods;
        
        // Update in the sent goods list
        const index = state.sentGoods.findIndex(sg => sg._id === updatedSentGoods._id);
        if (index !== -1) {
          state.sentGoods[index] = updatedSentGoods;
        }
        
        // Update current sent goods if it's the same one
        if (state.currentSentGoods && state.currentSentGoods._id === updatedSentGoods._id) {
          state.currentSentGoods = updatedSentGoods;
        }
        
        state.error = null;
      })
      .addCase(updateSentGoodsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete sent goods
      .addCase(deleteSentGoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSentGoods.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from the sent goods list
        state.sentGoods = state.sentGoods.filter(sg => sg._id !== action.meta.arg);
        state.error = null;
      })
      .addCase(deleteSentGoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get sent goods statistics
      .addCase(getSentGoodsStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSentGoodsStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data.stats;
        state.error = null;
      })
      .addCase(getSentGoodsStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get received goods (same as sent goods but different perspective)
      .addCase(getReceivedGoods.pending, (state) => {
        console.log('⏳ getReceivedGoods.pending - setting loading to true');
        state.loading = true;
        state.error = null;
      })
      .addCase(getReceivedGoods.fulfilled, (state, action) => {
        console.log('✅ getReceivedGoods.fulfilled - payload:', action.payload);
        console.log('✅ Storing received goods:', action.payload.data.sentGoods);
        console.log('✅ Before update - state.sentGoods:', state.sentGoods);
        console.log('✅ Before update - state.sentGoods length:', state.sentGoods.length);
        state.loading = false;
        state.sentGoods = action.payload.data.sentGoods;
        state.pagination = action.payload.data.pagination;
        state.error = null;
        console.log('✅ After update - state.sentGoods:', state.sentGoods);
        console.log('✅ After update - state.sentGoods length:', state.sentGoods.length);
      })
      .addCase(getReceivedGoods.rejected, (state, action) => {
        console.log('❌ getReceivedGoods.rejected - error:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentSentGoods, updateFilters, resetFilters } = sentGoodsSlice.actions;

// Selectors
export const selectSentGoods = (state) => state.sentGoods.sentGoods;
export const selectSentGoodsLoading = (state) => state.sentGoods.loading;
export const selectSentGoodsError = (state) => state.sentGoods.error;
export const selectSentGoodsStats = (state) => state.sentGoods.stats;
export const selectSentGoodsPagination = (state) => state.sentGoods.pagination;
export const selectCurrentSentGoods = (state) => state.sentGoods.currentSentGoods;
export const selectSentGoodsFilters = (state) => state.sentGoods.filters;

export default sentGoodsSlice.reducer;


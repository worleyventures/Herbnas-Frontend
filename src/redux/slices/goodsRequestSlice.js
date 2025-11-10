import { createSlice } from '@reduxjs/toolkit';
import {
  getAllGoodsRequests,
  getGoodsRequestById,
  createGoodsRequest,
  updateGoodsRequestStatus,
  markGoodsRequestAsReceived,
  deleteGoodsRequest
} from '../actions/goodsRequestActions';

const initialState = {
  goodsRequests: [],
  currentGoodsRequest: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalRequests: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  filters: {
    search: '',
    status: 'all',
    branchId: '',
    startDate: '',
    endDate: '',
    sortBy: 'requestedDate',
    sortOrder: 'desc'
  }
};

const goodsRequestSlice = createSlice({
  name: 'goodsRequests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGoodsRequest: (state) => {
      state.currentGoodsRequest = null;
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
      // Get all goods requests
      .addCase(getAllGoodsRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllGoodsRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.goodsRequests = action.payload.data.goodsRequests;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(getAllGoodsRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get goods request by ID
      .addCase(getGoodsRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoodsRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGoodsRequest = action.payload.data.goodsRequest;
        state.error = null;
      })
      .addCase(getGoodsRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create goods request
      .addCase(createGoodsRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoodsRequest.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new request to the beginning of the list
        state.goodsRequests.unshift(action.payload.data.goodsRequest);
        state.error = null;
      })
      .addCase(createGoodsRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update goods request status
      .addCase(updateGoodsRequestStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoodsRequestStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRequest = action.payload.data.goodsRequest;
        
        // Update in the requests list
        const index = state.goodsRequests.findIndex(req => req._id === updatedRequest._id);
        if (index !== -1) {
          state.goodsRequests[index] = updatedRequest;
        }
        
        // Update current request if it's the same one
        if (state.currentGoodsRequest && state.currentGoodsRequest._id === updatedRequest._id) {
          state.currentGoodsRequest = updatedRequest;
        }
        
        state.error = null;
      })
      .addCase(updateGoodsRequestStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark goods request as received
      .addCase(markGoodsRequestAsReceived.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markGoodsRequestAsReceived.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRequest = action.payload.data.goodsRequest;
        
        // Update in the requests list
        const index = state.goodsRequests.findIndex(req => req._id === updatedRequest._id);
        if (index !== -1) {
          state.goodsRequests[index] = updatedRequest;
        }
        
        // Update current request if it's the same one
        if (state.currentGoodsRequest && state.currentGoodsRequest._id === updatedRequest._id) {
          state.currentGoodsRequest = updatedRequest;
        }
        
        state.error = null;
      })
      .addCase(markGoodsRequestAsReceived.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete goods request
      .addCase(deleteGoodsRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoodsRequest.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from the requests list
        state.goodsRequests = state.goodsRequests.filter(req => req._id !== action.meta.arg);
        state.error = null;
      })
      .addCase(deleteGoodsRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentGoodsRequest, updateFilters, resetFilters } = goodsRequestSlice.actions;

// Selectors
export const selectGoodsRequests = (state) => state.goodsRequests.goodsRequests;
export const selectGoodsRequestsLoading = (state) => state.goodsRequests.loading;
export const selectGoodsRequestsError = (state) => state.goodsRequests.error;
export const selectGoodsRequestsPagination = (state) => state.goodsRequests.pagination;
export const selectCurrentGoodsRequest = (state) => state.goodsRequests.currentGoodsRequest;
export const selectGoodsRequestsFilters = (state) => state.goodsRequests.filters;

export default goodsRequestSlice.reducer;


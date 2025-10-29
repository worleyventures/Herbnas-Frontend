import { createSlice } from '@reduxjs/toolkit';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getActiveProducts,
  getProductStats
} from '../actions/productActions';

const initialState = {
  products: [],
  currentProduct: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearProducts: (state) => {
      state.products = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all products
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data.products || [];
        state.pagination = action.payload.data.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.products = [];
        state.pagination = initialState.pagination;
      })

      // Get product by ID
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.data.product;
        state.error = null;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentProduct = null;
      })

      // Get active products
      .addCase(getActiveProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveProducts.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload;
        // Handle various response structures
        if (responseData?.data?.products && Array.isArray(responseData.data.products)) {
          state.products = responseData.data.products;
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          state.products = responseData.data;
        } else if (Array.isArray(responseData?.products)) {
          state.products = responseData.products;
        } else if (Array.isArray(responseData)) {
          state.products = responseData;
        } else {
          console.warn('Unexpected products response structure:', responseData);
          state.products = [];
        }
        state.error = null;
      })
      .addCase(getActiveProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.products = [];
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload.data.product);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.data.product;
        const index = state.products.findIndex(p => p._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
        if (state.currentProduct && state.currentProduct._id === updatedProduct._id) {
          state.currentProduct = updatedProduct;
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        const productId = action.meta.arg;
        state.products = state.products.filter(p => p._id !== productId);
        if (state.currentProduct && state.currentProduct._id === productId) {
          state.currentProduct = null;
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get product statistics
      .addCase(getProductStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
        state.error = null;
      })
      .addCase(getProductStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = null;
      });
  }
});

export const { clearError, clearCurrentProduct, clearProducts } = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectCurrentProduct = (state) => state.products.currentProduct;
export const selectProductLoading = (state) => state.products.loading;
export const selectProductError = (state) => state.products.error;
export const selectProductStats = (state) => state.products.stats;
export const selectProductPagination = (state) => state.products.pagination;

export default productSlice.reducer;
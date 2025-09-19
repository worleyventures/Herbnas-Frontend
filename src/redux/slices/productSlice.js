import { createSlice } from '@reduxjs/toolkit';
import {
  getAllProducts,
  getActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
} from '../actions/productActions';

const initialState = {
  products: [],
  activeProducts: [],
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
  deleteSuccess: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    updateProductInState: (state, action) => {
      const index = state.products.findIndex(product => product._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct: (state, action) => {
      state.products = state.products.filter(product => product._id !== action.payload);
    },
    setProductStats: (state, action) => {
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
    }
  },
  extraReducers: (builder) => {
    // Get all products
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data?.products || action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get active products
    builder
      .addCase(getActiveProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.activeProducts = action.payload.data?.products || action.payload.data || action.payload;
        state.error = null;
      })
      .addCase(getActiveProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get product by ID
    builder
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        const product = action.payload.data || action.payload;
        const index = state.products.findIndex(p => p._id === product._id);
        if (index !== -1) {
          state.products[index] = product;
        } else {
          state.products.push(product);
        }
        state.error = null;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create product
    builder
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = action.payload.message || 'Product created successfully';
        const product = action.payload.data || action.payload;
        state.products.push(product);
        state.createError = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
        state.createSuccess = null;
      });

    // Update product
    builder
      .addCase(updateProduct.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message || 'Product updated successfully';
        const product = action.payload.data || action.payload;
        const index = state.products.findIndex(p => p._id === product._id);
        if (index !== -1) {
          state.products[index] = product;
        }
        state.updateError = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = null;
      });

    // Delete product
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = action.payload.message || 'Product deleted successfully';
        state.products = state.products.filter(product => product._id !== action.payload.id);
        state.deleteError = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.deleteSuccess = null;
      });

    // Get product stats
    builder
      .addCase(getProductStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getProductStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data || action.payload;
        state.statsError = null;
      })
      .addCase(getProductStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  }
});

export const {
  setProducts,
  addProduct,
  updateProductInState,
  removeProduct,
  setProductStats,
  setLoading,
  setError,
  clearError,
  clearSuccess
} = productSlice.actions;

// Selectors
export const selectProducts = (state) => state.products.products;
export const selectActiveProducts = (state) => state.products.activeProducts;
export const selectProductLoading = (state) => state.products.loading;
export const selectProductError = (state) => state.products.error;
export const selectProductStats = (state) => state.products.stats;
export const selectProductStatsLoading = (state) => state.products.statsLoading;
export const selectProductStatsError = (state) => state.products.statsError;

export default productSlice.reducer;






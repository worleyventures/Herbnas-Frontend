import { createSlice } from '@reduxjs/toolkit';
import {
  getAllInventory,
  getInventoryByProduct,
  getInventoryByBranch,
  createOrUpdateInventory,
  updateInventoryStock,
  deleteInventory,
  getInventoryStats
} from '../actions/inventoryActions';

const initialState = {
  inventory: [],
  productInventory: [],
  branchInventory: [],
  loading: false,
  error: null,
  stats: null,
  statsLoading: false,
  statsError: null,
  pagination: null,
  success: null
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Set inventory
    setInventory: (state, action) => {
      state.inventory = action.payload;
    },
    
    // Add new inventory
    addInventory: (state, action) => {
      state.inventory.unshift(action.payload);
    },
    
    // Update inventory in state
    updateInventoryInState: (state, action) => {
      const index = state.inventory.findIndex(item => item._id === action.payload._id);
      if (index !== -1) {
        state.inventory[index] = action.payload;
      }
    },
    
    // Remove inventory
    removeInventory: (state, action) => {
      state.inventory = state.inventory.filter(item => item._id !== action.payload);
    },
    
    // Set inventory stats
    setInventoryStats: (state, action) => {
      state.stats = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.statsError = null;
    },
    
    // Clear success
    clearSuccess: (state) => {
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all inventory
      .addCase(getAllInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.data.inventory || action.payload.data;
        state.pagination = action.payload.data.pagination || null;
        state.error = null;
      })
      .addCase(getAllInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.inventory = [];
      })
      
      // Get inventory by product
      .addCase(getInventoryByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryByProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.productInventory = action.payload.data.inventory || action.payload.data;
        state.error = null;
      })
      .addCase(getInventoryByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.productInventory = [];
      })
      
      // Get inventory by branch
      .addCase(getInventoryByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branchInventory = action.payload.data.inventory || action.payload.data;
        state.error = null;
      })
      .addCase(getInventoryByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.branchInventory = [];
      })
      
      // Create or update inventory
      .addCase(createOrUpdateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdateInventory.fulfilled, (state, action) => {
        state.loading = false;
        const inventory = action.payload.data.inventory || action.payload.data;
        const index = state.inventory.findIndex(item => item._id === inventory._id);
        if (index !== -1) {
          state.inventory[index] = inventory;
        } else {
          state.inventory.unshift(inventory);
        }
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(createOrUpdateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update inventory stock
      .addCase(updateInventoryStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventoryStock.fulfilled, (state, action) => {
        state.loading = false;
        const inventory = action.payload.data.inventory || action.payload.data;
        const index = state.inventory.findIndex(item => item._id === inventory._id);
        if (index !== -1) {
          state.inventory[index] = inventory;
        }
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(updateInventoryStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete inventory
      .addCase(deleteInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = state.inventory.filter(item => item._id !== action.payload.inventoryId);
        state.success = action.payload.message;
        state.error = null;
      })
      .addCase(deleteInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get inventory stats
      .addCase(getInventoryStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getInventoryStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data || action.payload;
        state.statsError = null;
      })
      .addCase(getInventoryStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  }
});

export const {
  setInventory,
  addInventory,
  updateInventoryInState,
  removeInventory,
  setInventoryStats,
  clearError,
  clearSuccess
} = inventorySlice.actions;

export default inventorySlice.reducer;

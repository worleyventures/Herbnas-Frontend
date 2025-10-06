import { createSlice } from '@reduxjs/toolkit';
import {
  getAllRawMaterials,
  getRawMaterialById,
  getUniqueSuppliers,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getAllFinishedGoods,
  getFinishedGoodsById,
  updateFinishedGoodsStock,
  getInventoryStats,
  createOrUpdateInventory
} from '../actions/inventoryActions';

const initialState = {
  rawMaterials: [],
  currentRawMaterial: null,
  suppliers: [],
  finishedGoods: [],
  currentFinishedGoods: null,
  stats: null,
  loading: false,
  updateLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRawMaterial: (state) => {
      state.currentRawMaterial = null;
    },
    clearRawMaterials: (state) => {
      state.rawMaterials = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all raw materials
      .addCase(getAllRawMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRawMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.rawMaterials = action.payload.data.rawMaterials || [];
        state.pagination = action.payload.data.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(getAllRawMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.rawMaterials = [];
        state.pagination = initialState.pagination;
      })

      // Get raw material by ID
      .addCase(getRawMaterialById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRawMaterialById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRawMaterial = action.payload.data.rawMaterial;
        state.error = null;
      })
      .addCase(getRawMaterialById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentRawMaterial = null;
      })

      // Get unique suppliers
      .addCase(getUniqueSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUniqueSuppliers.fulfilled, (state, action) => {
        state.loading = false;
        state.suppliers = action.payload.data.suppliers || [];
        state.error = null;
      })
      .addCase(getUniqueSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.suppliers = [];
      })

      // Create raw material
      .addCase(createRawMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRawMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.rawMaterials.unshift(action.payload.data.rawMaterial);
        state.error = null;
      })
      .addCase(createRawMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update raw material
      .addCase(updateRawMaterial.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateRawMaterial.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedRawMaterial = action.payload.data.rawMaterials;
        const index = state.rawMaterials.findIndex(rm => rm._id === updatedRawMaterial._id);
        if (index !== -1) {
          state.rawMaterials[index] = updatedRawMaterial;
        }
        if (state.currentRawMaterial && state.currentRawMaterial._id === updatedRawMaterial._id) {
          state.currentRawMaterial = updatedRawMaterial;
        }
        state.error = null;
      })
      .addCase(updateRawMaterial.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete raw material
      .addCase(deleteRawMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRawMaterial.fulfilled, (state, action) => {
        state.loading = false;
        const rawMaterialId = action.meta.arg;
        state.rawMaterials = state.rawMaterials.filter(rm => rm._id !== rawMaterialId);
        if (state.currentRawMaterial && state.currentRawMaterial._id === rawMaterialId) {
          state.currentRawMaterial = null;
        }
        state.error = null;
      })
      .addCase(deleteRawMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all finished goods
      .addCase(getAllFinishedGoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllFinishedGoods.fulfilled, (state, action) => {
        state.loading = false;
        state.finishedGoods = action.payload.data.finishedGoods || [];
        state.pagination = action.payload.data.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(getAllFinishedGoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.finishedGoods = [];
        state.pagination = initialState.pagination;
      })

      // Get finished goods by ID
      .addCase(getFinishedGoodsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFinishedGoodsById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFinishedGoods = action.payload.data.finishedGoods;
        state.error = null;
      })
      .addCase(getFinishedGoodsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentFinishedGoods = null;
      })

      // Update finished goods stock
      .addCase(updateFinishedGoodsStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFinishedGoodsStock.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFinishedGoods = action.payload.data.finishedGoods;
        const index = state.finishedGoods.findIndex(fg => fg._id === updatedFinishedGoods._id);
        if (index !== -1) {
          state.finishedGoods[index] = updatedFinishedGoods;
        }
        if (state.currentFinishedGoods && state.currentFinishedGoods._id === updatedFinishedGoods._id) {
          state.currentFinishedGoods = updatedFinishedGoods;
        }
        state.error = null;
      })
      .addCase(updateFinishedGoodsStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get inventory stats
      .addCase(getInventoryStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data.stats;
        state.error = null;
      })
      .addCase(getInventoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.stats = null;
      })

      // Create or update inventory
      .addCase(createOrUpdateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrUpdateInventory.fulfilled, (state, action) => {
        state.loading = false;
        // The actual update will be handled by the individual create/update cases
        state.error = null;
      })
      .addCase(createOrUpdateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentRawMaterial, clearRawMaterials } = inventorySlice.actions;
export default inventorySlice.reducer;
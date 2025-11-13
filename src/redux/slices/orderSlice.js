import { createSlice } from '@reduxjs/toolkit';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
  getOrderStats,
  checkOrderIdExists
} from '../actions/orderActions';

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  stats: null,
  statsLoading: false,
  statsError: null,
  orderIdCheck: {
    exists: false,
    checking: false,
    error: null
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Set orders
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    
    // Add new order
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
    
    // Update order in state
    updateOrderInState: (state, action) => {
      const updatedOrder = action.payload;
      console.log('updateOrderInState called with:', updatedOrder);
      console.log('Current orders count:', state.orders.length);
      
      const index = state.orders.findIndex(order => {
        const orderId = order._id?.toString() || order._id;
        const payloadId = updatedOrder._id?.toString() || updatedOrder._id;
        return orderId === payloadId;
      });
      
      if (index !== -1) {
        console.log('Found order at index:', index, 'Order ID:', updatedOrder._id);
        // Use Immer's draft state to ensure immutability
        state.orders[index] = { ...updatedOrder };
        console.log('Order updated in state');
      } else {
        // If order not found, add it (might be on a different page)
        console.warn('Order not found in current orders array, adding it:', updatedOrder._id);
        state.orders.push(updatedOrder);
      }
    },
    
    // Remove order
    removeOrder: (state, action) => {
      state.orders = state.orders.filter(order => order._id !== action.payload);
    },
    
    // Set current order
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    
    // Clear current order
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    
    // Set order stats
    setOrderStats: (state, action) => {
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
    clearOrderErrors: (state) => {
      state.error = null;
      state.statsError = null;
    },
    
    // Clear Order ID check
    clearOrderIdCheck: (state) => {
      state.orderIdCheck = {
        exists: false,
        checking: false,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        const newOrders = action.payload.data.orders || [];
        
        // Merge with existing orders to preserve any updates that might not be in the new list
        // Update existing orders if they're in the new list, otherwise keep them
        const updatedOrderIds = new Set(newOrders.map(o => (o._id || o.id)?.toString()));
        
        // Keep orders that aren't in the new list (might be on different page)
        const ordersToKeep = state.orders.filter(o => {
          const orderId = (o._id || o.id)?.toString();
          return !updatedOrderIds.has(orderId);
        });
        
        // Combine kept orders with new orders
        state.orders = [...ordersToKeep, ...newOrders];
        state.pagination = action.payload.data.pagination || state.pagination;
        state.error = null;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.orders = [];
      })
      
      // Get order by ID
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data.order;
        state.error = null;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentOrder = null;
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload.data.order);
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data.order;
        const index = state.orders.findIndex(order => {
          const orderId = order._id?.toString() || order._id;
          const updatedId = updatedOrder._id?.toString() || updatedOrder._id;
          return orderId === updatedId;
        });
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        } else {
          // If order not found, add it (might be on a different page)
          state.orders.push(updatedOrder);
        }
        if (state.currentOrder) {
          const currentId = state.currentOrder._id?.toString() || state.currentOrder._id;
          const updatedId = updatedOrder._id?.toString() || updatedOrder._id;
          if (currentId === updatedId) {
            state.currentOrder = updatedOrder;
          }
        }
        state.error = null;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data.order;
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        state.error = null;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update order payment
      .addCase(updateOrderPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderPayment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data.order;
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        state.error = null;
      })
      .addCase(updateOrderPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order._id !== action.payload.id);
        if (state.currentOrder && state.currentOrder._id === action.payload.id) {
          state.currentOrder = null;
        }
        state.error = null;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get order stats
      .addCase(getOrderStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getOrderStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
        state.statsError = null;
      })
      .addCase(getOrderStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
        state.stats = null;
      })
      
      // Check Order ID exists
      .addCase(checkOrderIdExists.pending, (state) => {
        state.orderIdCheck.checking = true;
        state.orderIdCheck.error = null;
      })
      .addCase(checkOrderIdExists.fulfilled, (state, action) => {
        state.orderIdCheck.checking = false;
        state.orderIdCheck.exists = action.payload.exists;
        state.orderIdCheck.error = null;
      })
      .addCase(checkOrderIdExists.rejected, (state, action) => {
        state.orderIdCheck.checking = false;
        state.orderIdCheck.error = action.payload;
        state.orderIdCheck.exists = false;
      });
  }
});

export const {
  setOrders,
  addOrder,
  updateOrderInState,
  removeOrder,
  setCurrentOrder,
  clearCurrentOrder,
  setOrderStats,
  setLoading,
  setError,
  clearError,
  clearOrderErrors,
  clearOrderIdCheck
} = orderSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderLoading = (state) => state.orders.loading;
export const selectOrderError = (state) => state.orders.error;
export const selectOrderStats = (state) => state.orders.stats;
export const selectOrderStatsLoading = (state) => state.orders.statsLoading;
export const selectOrderStatsError = (state) => state.orders.statsError;
export const selectOrderPagination = (state) => state.orders.pagination;
export const selectOrderIdCheck = (state) => state.orders.orderIdCheck;

export default orderSlice.reducer;
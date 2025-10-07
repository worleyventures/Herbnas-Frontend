import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';
import leadReducer from './slices/leadSlice';
import branchReducer from './slices/branchSlice';
import productReducer from './slices/productSlice';
import productionReducer from './slices/productionSlice';
import healthReducer from './slices/healthSlice';
import inventoryReducer from './slices/inventorySlice';
import sentGoodsReducer from './slices/sentGoodsSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ui: uiReducer,
    leads: leadReducer,
    branches: branchReducer,
    products: productReducer,
    productions: productionReducer,
    health: healthReducer,
    inventory: inventoryReducer,
    sentGoods: sentGoodsReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
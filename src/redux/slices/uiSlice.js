import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  modals: {
    login: false,
    register: false,
    cart: false,
    product: false,
    checkout: false,
    address: false,
    review: false,
  },
  
  // Sidebar states
  sidebars: {
    mobileMenu: false,
    filters: false,
    cart: false,
  },
  
  // Notifications
  notifications: [],
  
  // Loading states
  loading: {
    global: false,
    page: false,
  },
  
  // Theme
  theme: 'light', // 'light' | 'dark'
  
  // Language
  language: 'en',
  
  // Currency
  currency: 'USD',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggle modal
    toggleModal: (state, action) => {
      const { modal, isOpen } = action.payload;
      if (state.modals.hasOwnProperty(modal)) {
        state.modals[modal] = isOpen !== undefined ? isOpen : !state.modals[modal];
      }
    },
    
    // Close all modals
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Toggle sidebar
    toggleSidebar: (state, action) => {
      const { sidebar, isOpen } = action.payload;
      if (state.sidebars.hasOwnProperty(sidebar)) {
        state.sidebars[sidebar] = isOpen !== undefined ? isOpen : !state.sidebars[sidebar];
      }
    },
    
    // Close all sidebars
    closeAllSidebars: (state) => {
      Object.keys(state.sidebars).forEach(key => {
        state.sidebars[key] = false;
      });
    },
    
    // Add notification
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    
    // Remove notification
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Set global loading
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    // Set page loading
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    
    // Toggle theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Set theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Set language
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    
    // Set currency
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
  },
});

export const {
  toggleModal,
  closeAllModals,
  toggleSidebar,
  closeAllSidebars,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setPageLoading,
  toggleTheme,
  setTheme,
  setLanguage,
  setCurrency,
} = uiSlice.actions;

export default uiSlice.reducer; 
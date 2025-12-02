import { createSlice } from '@reduxjs/toolkit';
import {
  getAllUsers,
  getUserById,
  getUsersByBranch,
  getMyProfile,
  updateProfile,
  updateUser,
  deleteUser,
  createUser,
  getUserStats,
  assignUserToBranch
} from '../actions/userActions';

const initialState = {
  users: [],
  branchUsers: [],
  currentUser: null,
  loading: false,
  error: null,
  userLoading: false,
  userError: null,
  branchUsersLoading: false,
  branchUsersError: null,
  stats: null,
  statsLoading: false,
  statsError: null,
  pagination: null,
  allUsers: [], // Store all users for stats
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set users
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    
    // Add new user
    addUser: (state, action) => {
      state.users.unshift(action.payload);
    },
    
    // Update user in state
    updateUserInState: (state, action) => {
      const index = state.users.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      if (state.currentUser && state.currentUser._id === action.payload._id) {
        state.currentUser = action.payload;
      }
    },
    
    // Remove user
    removeUser: (state, action) => {
      state.users = state.users.filter(user => user._id !== action.payload);
      if (state.currentUser && state.currentUser._id === action.payload) {
        state.currentUser = null;
      }
    },
    
    // Set current user
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    
    // Clear current user
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    
    // Set user stats
    setUserStats: (state, action) => {
      state.stats = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.userError = null;
      state.statsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        const users = action.payload.data.users || action.payload.data;
        state.users = users;
        
        // If this is a request for all users (no filters), store in allUsers
        const payload = action.payload.data || action.payload;
        if (payload.pagination && payload.pagination.totalUsers > 0) {
          // This is a paginated request, check if it's for all users
          const isAllUsersRequest = !action.meta.arg?.search && 
                                   !action.meta.arg?.role && 
                                   !action.meta.arg?.branch && 
                                   !action.meta.arg?.status;
          if (isAllUsersRequest) {
            state.allUsers = users;
          }
        }
        
        state.pagination = payload.pagination || null;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.users = [];
      })
      
      // Get user by ID
      .addCase(getUserById.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.userLoading = false;
        const user = action.payload.data?.user || action.payload.data || action.payload;
        const index = state.users.findIndex(u => u._id === user._id);
        if (index !== -1) {
          state.users[index] = user;
        } else {
          state.users.push(user);
        }
        state.userError = null;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      
      // Get my profile
      .addCase(getMyProfile.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.userLoading = false;
        state.currentUser = action.payload.data.user || action.payload.data;
        state.userError = null;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.userLoading = false;
        state.currentUser = action.payload.data.user || action.payload.data;
        state.userError = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.userLoading = false;
        const updatedUser = action.payload.data.user || action.payload.data;
        // Update in users array
        const index = state.users.findIndex(user => user._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        // Update in allUsers array
        const allUsersIndex = state.allUsers.findIndex(user => user._id === updatedUser._id);
        if (allUsersIndex !== -1) {
          state.allUsers[allUsersIndex] = updatedUser;
        }
        // Update currentUser if it's the same user
        if (state.currentUser && state.currentUser._id === updatedUser._id) {
          state.currentUser = updatedUser;
        }
        state.userError = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      
      // Assign user to branch
      .addCase(assignUserToBranch.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(assignUserToBranch.fulfilled, (state, action) => {
        state.userLoading = false;
        const updatedUser = action.payload.data?.user || action.payload.data;
        if (updatedUser) {
          // Update in users array
          const index = state.users.findIndex(user => user._id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
          // Update in allUsers array
          const allUsersIndex = state.allUsers.findIndex(user => user._id === updatedUser._id);
          if (allUsersIndex !== -1) {
            state.allUsers[allUsersIndex] = updatedUser;
          }
          // Update currentUser if it's the same user
          if (state.currentUser && state.currentUser._id === updatedUser._id) {
            state.currentUser = updatedUser;
          }
        }
        state.userError = null;
      })
      .addCase(assignUserToBranch.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      
      // Get user stats
      .addCase(getUserStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data || action.payload;
        state.statsError = null;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Get users by branch
      .addCase(getUsersByBranch.pending, (state) => {
        state.branchUsersLoading = true;
        state.branchUsersError = null;
      })
      .addCase(getUsersByBranch.fulfilled, (state, action) => {
        state.branchUsersLoading = false;
        state.branchUsers = action.payload.data.users || action.payload.data;
        state.branchUsersError = null;
      })
      .addCase(getUsersByBranch.rejected, (state, action) => {
        state.branchUsersLoading = false;
        state.branchUsersError = action.payload;
        state.branchUsers = [];
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.userLoading = false;
        const newUser = action.payload.data.user || action.payload.data;
        state.users.unshift(newUser);
        state.userError = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.userLoading = false;
        const userId = action.payload.userId;
        state.users = state.users.filter(user => user._id !== userId);
        state.userError = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      });
  }
});

export const {
  setUsers,
  addUser,
  updateUserInState,
  removeUser,
  setCurrentUser,
  clearCurrentUser,
  setUserStats,
  clearError,
} = userSlice.actions;

// Selectors
export const selectUsers = (state) => state.user.users;
export const selectAllUsers = (state) => state.user.allUsers;
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectUserStats = (state) => state.user.stats;
export const selectUserStatsLoading = (state) => state.user.statsLoading;
export const selectUserStatsError = (state) => state.user.statsError;
export const selectBranchUsers = (state) => state.user.branchUsers;
export const selectBranchUsersLoading = (state) => state.user.branchUsersLoading;
export const selectBranchUsersError = (state) => state.user.branchUsersError;

export default userSlice.reducer; 
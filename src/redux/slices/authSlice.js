import { createSlice } from '@reduxjs/toolkit';
import { getCookie } from '../../utils/cookieUtils';
import {
  initiateRegistration,
  completeRegistration,
  initiateLogin,
  completeLogin,
  passwordLogin,
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  resendOTP,
  uploadAvatar,
  deleteAvatar,
} from '../actions/authActions';

// Get initial user from cookies or localStorage
const getInitialUser = () => {
  try {
    // Try cookies first
    let user = getCookie('user');
    if (user && user !== 'undefined' && user !== 'null') {
      return JSON.parse(user);
    }
    
    // Fallback to localStorage
    user = localStorage.getItem('user');
    if (user && user !== 'undefined' && user !== 'null') {
      return JSON.parse(user);
    }
    return null;
  } catch (error) {
    console.error('Error parsing user from cookies/localStorage:', error);
    return null;
  }
};

// Get initial token from cookies or localStorage
const getInitialToken = () => {
  try {
    // Try cookies first
    let token = getCookie('token');
    if (token && token !== 'undefined' && token !== 'null') {
      return token;
    }
    
    // Fallback to localStorage
    token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting token from cookies/localStorage:', error);
    return null;
  }
};

const initialUser = getInitialUser();
const initialToken = getInitialToken();
const initialAuth = !!(initialToken && initialUser);

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: initialAuth,
  loading: false,
  error: null,
  
  // Registration state
  registrationStep: null, // 'initiate' | 'complete'
  verificationToken: null,
  verificationType: null, // 'email' | 'phone'
  
  // Login state
  loginStep: null, // 'initiate' | 'complete'
  loginUserId: null,
  
  // Addresses
  addresses: [],
  addressesLoading: false,
  addressesError: null,
  
  // OTP state
  otpLoading: false,
  otpError: null,
  
  // Profile state
  profileLoading: false,
  profileError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.otpError = null;
      state.profileError = null;
      state.addressesError = null;
    },
    
    // Clear registration state
    clearRegistrationState: (state) => {
      state.registrationStep = null;
      state.verificationToken = null;
      state.verificationType = null;
    },
    
    // Clear login state
    clearLoginState: (state) => {
      state.loginStep = null;
      state.loginUserId = null;
    },
    
    // Set verification data
    setVerificationData: (state, action) => {
      const { verificationToken, verificationType } = action.payload;
      state.verificationToken = verificationToken;
      state.verificationType = verificationType;
    },
    
    // Set login data
    setLoginData: (state, action) => {
      const { verificationToken, verificationType, userId } = action.payload;
      state.verificationToken = verificationToken;
      state.verificationType = verificationType;
      state.loginUserId = userId;
    },
    
    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.addresses = [];
      state.registrationStep = null;
      state.loginStep = null;
      state.verificationToken = null;
      state.verificationType = null;
      state.loginUserId = null;
      
      // Clear localStorage and cookies
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear cookies
        document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
        document.cookie = 'user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      } catch (error) {
        console.error('Error clearing localStorage and cookies:', error);
      }
    },
    
    // Restore auth state from localStorage
    restoreAuthState: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Registration
    builder
      .addCase(initiateRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationStep = 'initiate';
      })
      .addCase(initiateRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationToken = action.payload.data.verificationToken;
        state.verificationType = action.payload.data.verificationType;
      })
      .addCase(initiateRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationStep = null;
      })
      
      .addCase(completeRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationStep = 'complete';
      })
      .addCase(completeRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.registrationStep = null;
        state.verificationToken = null;
        state.verificationType = null;
        
        // Store in localStorage
        try {
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        } catch (error) {
          console.error('Error storing data in localStorage:', error);
        }
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationStep = null;
      });
    
    // Login
    builder
      .addCase(initiateLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginStep = 'initiate';
      })
      .addCase(initiateLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationToken = action.payload.data.verificationToken;
        state.verificationType = action.payload.data.verificationType;
        state.loginUserId = action.payload.data.userId;
      })
      .addCase(initiateLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.loginStep = null;
      })
      
      .addCase(completeLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginStep = 'complete';
      })
      .addCase(completeLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loginStep = null;
        state.verificationToken = null;
        state.verificationType = null;
        state.loginUserId = null;
        
        // Store in localStorage
        try {
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        } catch (error) {
          console.error('Error storing data in localStorage:', error);
        }
      })
      .addCase(completeLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.loginStep = null;
      })
      
      .addCase(passwordLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(passwordLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        
        // Store in localStorage
        try {
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        } catch (error) {
          console.error('Error storing data in localStorage:', error);
        }
      })
      .addCase(passwordLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Profile
    builder
      .addCase(getProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload.user;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      
      .addCase(updateProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      
      .addCase(changePassword.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.token = action.payload.token;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      });
    
    // Addresses
    builder
      .addCase(addAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.user = action.payload.user;
        state.addresses = action.payload.user.addresses;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      
      .addCase(getAddresses.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.addresses = action.payload.addresses;
      })
      .addCase(getAddresses.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      
      .addCase(updateAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.user = action.payload.user;
        state.addresses = action.payload.user.addresses;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      
      .addCase(deleteAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.user = action.payload.user;
        state.addresses = action.payload.user.addresses;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      })
      
      .addCase(setDefaultAddress.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addressesLoading = false;
        state.user = action.payload.user;
        state.addresses = action.payload.user.addresses;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload;
      });
    
    // OTP
    builder
      .addCase(resendOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(resendOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.verificationToken = action.payload.data.verificationToken;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      });
    
    // Avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload.user;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      
      .addCase(deleteAvatar.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(deleteAvatar.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload.user;
      })
      .addCase(deleteAvatar.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearRegistrationState, 
  clearLoginState, 
  setVerificationData, 
  setLoginData,
  logout
} = authSlice.actions;

export default authSlice.reducer; 
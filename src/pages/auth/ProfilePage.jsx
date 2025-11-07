import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiUser, HiEnvelope, HiPhone, HiPencilSquare, HiCheckCircle, HiXMark, HiKey, HiEye, HiEyeSlash, HiPhoto } from 'react-icons/hi2';
import { Button, Input } from '../../components/common';
import { getProfile, updateProfile, changePassword, uploadAvatar, deleteAvatar } from '../../redux/actions/authActions';
import { addNotification } from '../../redux/slices/uiSlice';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth || {});

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    // Load user profile if not already loaded
    if (!user || !user.firstName) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name cannot be more than 50 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name cannot be more than 50 characters';
    }

    // Phone is optional, but if provided, must be valid
    if (formData.phone.trim()) {
      // Match backend validation: /^\+?[1-9]\d{1,14}$/
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      const cleanedPhone = formData.phone.trim().replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.phone = 'Please enter a valid phone number (e.g., +1234567890 or 1234567890)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      };

      // Only include phone if it's provided and valid
      if (formData.phone.trim()) {
        // Clean phone number (remove spaces, dashes, parentheses)
        const cleanedPhone = formData.phone.trim().replace(/[\s\-\(\)]/g, '');
        profileData.phone = cleanedPhone;
      }

      const result = await dispatch(updateProfile(profileData)).unwrap();
      
      // Refresh user profile to get updated data from backend
      await dispatch(getProfile());
      
      dispatch(addNotification({
        type: 'success',
        message: 'Profile updated successfully!'
      }));

      setIsEditing(false);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile. Please try again.';
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const validatePassword = () => {
    let newErrors = {};

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else {
      // Check password length
      if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      } else if (passwordData.newPassword.length > 128) {
        newErrors.newPassword = 'Password cannot exceed 128 characters';
      } else {
        // Check password requirements (matching backend validation)
        const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
        const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
        const hasNumbers = /\d/.test(passwordData.newPassword);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
          newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        } else if (passwordData.currentPassword && passwordData.currentPassword === passwordData.newPassword) {
          newErrors.newPassword = 'New password must be different from current password';
        }
      }
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({}); // Clear previous errors

    try {
      const result = await dispatch(changePassword({
        currentPassword: passwordData.currentPassword.trim(),
        newPassword: passwordData.newPassword.trim()
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Password changed successfully!'
      }));

      // Clear form data
      setPasswordData({
        currentPassword: '',
        newPassword: ''
      });
      setPasswordErrors({});
      setShowPasswords({
        current: false,
        new: false
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || error || 'Failed to change password. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('current password') || errorMessage.toLowerCase().includes('incorrect')) {
        setPasswordErrors({
          currentPassword: 'Current password is incorrect'
        });
      } else if (errorMessage.toLowerCase().includes('same') || errorMessage.toLowerCase().includes('different')) {
        setPasswordErrors({
          newPassword: 'New password must be different from current password'
        });
      }
      
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please select an image file'
      }));
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(addNotification({
        type: 'error',
        message: 'Image size must be less than 5MB'
      }));
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file) => {
    setIsUploadingAvatar(true);

    try {
      const result = await dispatch(uploadAvatar(file)).unwrap();
      
      // Refresh user profile
      await dispatch(getProfile());
      
      dispatch(addNotification({
        type: 'success',
        message: 'Profile photo uploaded successfully!'
      }));

      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      const errorMessage = typeof error === 'string' ? error : (error?.message || 'Failed to upload photo. Please try again.');
      dispatch(addNotification({
        type: 'error',
        message: errorMessage
      }));
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatarClick = () => {
    if (!user?.avatar?.url) return;
    setShowRemoveModal(true);
  };

  const handleRemoveAvatar = async () => {
    setShowRemoveModal(false);
    setIsDeletingAvatar(true);

    try {
      await dispatch(deleteAvatar()).unwrap();
      
      // Refresh user profile
      await dispatch(getProfile());
      
      dispatch(addNotification({
        type: 'success',
        message: 'Profile photo removed successfully!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to remove photo. Please try again.'
      }));
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#558b2f]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Go back"
            >
              <HiArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and edit your personal information
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md hover:from-[#558b2f] hover:to-[#4a7c2a] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:ring-offset-2"
            >
              <HiPencilSquare className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Picture & Password */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Picture Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-white p-4 flex items-center justify-center">
                <div className="relative w-full">
                  {avatarPreview ? (
                    <img
                      className="w-full aspect-square rounded-lg object-cover border-2 border-gray-200 shadow-lg bg-white"
                      src={avatarPreview}
                      alt="Preview"
                    />
                  ) : user?.avatar?.url ? (
                    <img
                      className="w-full aspect-square rounded-lg object-cover border-2 border-gray-200 shadow-lg bg-white"
                      src={user.avatar.url}
                      alt={user.fullName || user.firstName}
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center">
                      <HiUser className="h-24 w-24 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="avatar-upload"
                  disabled={isUploadingAvatar || isDeletingAvatar}
                />
                <div className="flex items-center justify-center gap-2">
                  <label
                    htmlFor="avatar-upload"
                    className={`w-24 px-3 py-1.5 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white text-sm font-medium rounded-lg hover:from-[#558b2f] hover:to-[#4a7c2a] transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isUploadingAvatar || isDeletingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                        <span className="text-xs">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <HiPhoto className="h-3.5 w-3.5" />
                        <span className="text-xs">Upload</span>
                      </>
                    )}
                  </label>
                  {user?.avatar?.url && (
                    <button
                      onClick={handleRemoveAvatarClick}
                      disabled={isDeletingAvatar}
                      className="w-24 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-1.5 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <HiXMark className="h-3.5 w-3.5" />
                      <span className="text-xs">Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Max size: 5MB. Supported: JPG, PNG, GIF
                </p>
              </div>
            </div>

            {/* Password Management Card - Only for Super Admin */}
            {user?.role === 'super_admin' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <HiKey className="h-5 w-5 mr-2 text-[#558b2f]" />
                  Password Management
                </h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Old Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#8bc34a] focus:ring-2 focus:ring-[#8bc34a] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-600">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#8bc34a] focus:ring-2 focus:ring-[#8bc34a] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                    {!passwordErrors.newPassword && passwordData.newPassword && (
                      <div className="text-xs text-gray-500 mt-1">
                        <p>Password must contain:</p>
                        <ul className="list-disc list-inside space-y-0.5 mt-1">
                          <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                            At least one uppercase letter
                          </li>
                          <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                            At least one lowercase letter
                          </li>
                          <li className={/\d/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                            At least one number
                          </li>
                          <li className={passwordData.newPassword.length >= 6 ? 'text-green-600' : ''}>
                            At least 6 characters
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full px-3 py-1.5 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white text-sm font-medium rounded-lg hover:from-[#558b2f] hover:to-[#4a7c2a] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right Column - Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          value={user?.employeeId || 'N/A'}
                          disabled
                          autoComplete="off"
                          className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed uppercase"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter your first name"
                            disabled={!isEditing}
                            autoComplete="given-name"
                            className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all ${
                              errors.firstName 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                : isEditing
                                ? 'border-gray-300 focus:border-[#8bc34a] focus:ring-[#8bc34a]'
                                : 'border-gray-200 bg-gray-50'
                            } ${!isEditing ? 'cursor-not-allowed' : 'focus:ring-2'}`}
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiEnvelope className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            autoComplete="email"
                            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-amber-600 mt-1">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number <span className="text-gray-400 text-xs">(optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiPhone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number (e.g., +1234567890)"
                            disabled={!isEditing}
                            autoComplete="tel"
                            className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all ${
                              errors.phone 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                : isEditing
                                ? 'border-gray-300 focus:border-[#8bc34a] focus:ring-[#8bc34a]'
                                : 'border-gray-200 bg-gray-50'
                            } ${!isEditing ? 'cursor-not-allowed' : 'focus:ring-2'}`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-sm text-red-600">{errors.phone}</p>
                        )}
                        {!errors.phone && isEditing && (
                          <p className="text-xs text-gray-500">Format: +1234567890 or 1234567890</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Email Verified
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            user?.emailVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user?.emailVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Verified
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            user?.phoneVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user?.phoneVerified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <HiUser className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter your last name"
                            disabled={!isEditing}
                            autoComplete="family-name"
                            className={`block w-full pl-10 pr-4 py-2.5 border rounded-lg transition-all ${
                              errors.lastName 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                : isEditing
                                ? 'border-gray-300 focus:border-[#8bc34a] focus:ring-[#8bc34a]'
                                : 'border-gray-200 bg-gray-50'
                            } ${!isEditing ? 'cursor-not-allowed' : 'focus:ring-2'}`}
                          />
                        </div>
                        {errors.lastName && (
                          <p className="text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <input
                          type="text"
                          value={user?.role?.replace('_', ' ') || 'User'}
                          disabled
                          autoComplete="off"
                          className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed capitalize"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Display Name Publicly as
                        </label>
                        <input
                          type="text"
                          value={user?.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || 'User')}
                          disabled
                          autoComplete="name"
                          className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                        />
                      </div>

                      {user?.branch && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Branch
                          </label>
                          <input
                            type="text"
                            value={user.branch.branchName || user.branch}
                            disabled
                            autoComplete="off"
                            className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Account Status
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            user?.isActive !== false
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user?.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {user?.lastLoginAt && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Last Login
                          </label>
                          <input
                            type="text"
                            value={new Date(user.lastLoginAt).toLocaleString()}
                            disabled
                            autoComplete="off"
                            className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                          />
                        </div>
                      )}

                      {user?.createdAt && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Member Since
                          </label>
                          <input
                            type="text"
                            value={new Date(user.createdAt).toLocaleDateString()}
                            disabled
                            autoComplete="off"
                            className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg text-gray-600 cursor-not-allowed"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        <span className="text-red-500">*</span> Required fields
                      </p>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={isSubmitting}
                          className="px-4 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md hover:from-[#558b2f] hover:to-[#4a7c2a] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <HiCheckCircle className="h-3.5 w-3.5" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Avatar Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
              onClick={() => setShowRemoveModal(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md text-left shadow-2xl transition-all w-full max-w-md">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Remove Profile Photo
                  </h3>
                  <button
                    onClick={() => setShowRemoveModal(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 rounded-md p-1"
                  >
                    <HiXMark className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 sm:p-6">
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to remove your profile photo? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowRemoveModal(false)}
                    disabled={isDeletingAvatar}
                    className="px-4 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={isDeletingAvatar}
                    className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
                  >
                    {isDeletingAvatar ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                        <span>Removing...</span>
                      </>
                    ) : (
                      <span>Remove Photo</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;


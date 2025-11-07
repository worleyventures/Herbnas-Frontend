import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiUser, HiEnvelope, HiPhone, HiPencilSquare, HiCheckCircle, HiXMark, HiKey, HiEye, HiEyeSlash, HiPhoto } from 'react-icons/hi2';
import { Button, Input } from '../../components/common';
import { getProfile, updateProfile, changePassword } from '../../redux/actions/authActions';
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
      // If we're not editing, ensure form matches current user data
      if (!isEditing) {
        // This ensures form is in sync with user data
      }
    }
  }, [user, isEditing]);

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
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
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

    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Password changed successfully!'
      }));

      setPasswordData({
        currentPassword: '',
        newPassword: ''
      });
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to change password. Please try again.'
      }));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
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
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Go back"
            >
              <HiArrowLeft className="h-5 w-5" />
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
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:from-[#558b2f] hover:to-[#4a7c2a] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:ring-offset-2"
            >
              <HiPencilSquare className="h-4 w-4" />
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
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 flex items-center justify-center">
                <div className="relative">
                  {user?.avatar?.url ? (
                    <>
                      <img
                        className="w-40 h-40 rounded-lg object-cover border-4 border-white shadow-lg"
                        src={user.avatar.url}
                        alt={user.fullName || user.firstName}
                      />
                      <button
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        onClick={() => {/* Handle remove photo */}}
                      >
                        <HiXMark className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="w-40 h-40 rounded-lg bg-white border-4 border-white shadow-lg flex items-center justify-center">
                      <HiUser className="h-20 w-20 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <button className="w-full px-4 py-2.5 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white font-medium rounded-lg hover:from-[#558b2f] hover:to-[#4a7c2a] transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md">
                  <HiPhoto className="h-4 w-4" />
                  <span>Upload Photo</span>
                </button>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <HiEyeSlash className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white font-medium rounded-lg hover:from-[#558b2f] hover:to-[#4a7c2a] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white font-medium rounded-lg shadow-sm hover:shadow-md hover:from-[#558b2f] hover:to-[#4a7c2a] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <HiCheckCircle className="h-4 w-4" />
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
    </div>
  );
};

export default ProfilePage;


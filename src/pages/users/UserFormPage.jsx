import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiUser, HiEnvelope, HiPhone, HiKey, HiBuildingOffice2, HiExclamationTriangle, HiCheckCircle, HiEye, HiEyeSlash, HiXMark } from 'react-icons/hi2';
import { Button, Input, Select } from '../../components/common';
import { createUser, updateUser, getUserById, changeUserPassword, getAllUsers } from '../../redux/actions/userActions';
import { getAllBranches } from '../../redux/actions/branchActions';
import { clearError } from '../../redux/slices/userSlice';
import { addNotification } from '../../redux/slices/uiSlice';

const UserFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const selectedUser = location.state?.user || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const userId = params.id;

  const {
    loading: userLoading,
    error: userError,
    users
  } = useSelector(state => state.user || {});

  const {
    branches
  } = useSelector(state => state.branches || {});

  const reduxUser = mode === 'edit' && userId ?
    users.find(user => user._id === userId) : null;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    isActive: true,
    allowWebLogin: true,
    branch: ''
  });


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    // Load branches
    dispatch(getAllBranches());

    // Load user data for editing
    if (mode === 'edit' && userId && !reduxUser) {
      dispatch(getUserById(userId));
    }
  }, [mode, userId, reduxUser, dispatch]);

  useEffect(() => {
    const userData = selectedUser || reduxUser;
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password: '',
        confirmPassword: '',
        role: userData.role || '',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        allowWebLogin: userData.allowWebLogin !== undefined ? userData.allowWebLogin : true,
        branch: userData.branch?._id || userData.branch || ''
      });
    } else if (mode === 'create') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: '',
        isActive: true,
        allowWebLogin: true,
        branch: ''
      });
    }
  }, [selectedUser, reduxUser, mode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.branch) newErrors.branch = 'Branch is required';
    
    // Password validation for create mode or edit mode
    if (mode === 'create') {
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm Password is required';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    } else if (mode === 'edit' && (formData.password || formData.confirmPassword)) {
      if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      isActive: formData.isActive,
      allowWebLogin: formData.allowWebLogin,
      branch: formData.branch
    };

    if (mode === 'create') {
      userData.password = formData.password;
    }

    try {
      if (mode === 'create') {
        await dispatch(createUser(userData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'User Created',
          message: 'User has been created successfully.',
          duration: 3000
        }));
        // Refresh users list after creation
        await dispatch(getAllUsers({ page: 1, limit: 1000 }));
      } else {
        // If password is provided, update password separately
        if (formData.password.trim()) {
          await dispatch(changeUserPassword({ 
            userId, 
            passwordData: { newPassword: formData.password } 
          })).unwrap();
        }
        await dispatch(updateUser({ userId, userData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'User Updated',
          message: 'User has been updated successfully.',
          duration: 3000
        }));
        // Refresh users list after update
        await dispatch(getAllUsers({ page: 1, limit: 1000 }));
      }
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Failed to save user. Please try again.',
        duration: 5000
      }));
    }
  };

  const handleBack = () => {
    navigate('/users');
  };

  const pageTitle = mode === 'create' ? 'Create New User' : `Edit User: ${formData.firstName} ${formData.lastName}`;

  const roleOptions = [
    { value: '', label: 'Select a role...' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' }
  ];

  const branchOptions = [
    { value: '', label: 'Select a branch...' },
    ...branches.map(branch => ({
      value: branch._id,
      label: branch.branchName
    }))
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Create New User' : `Edit User: ${formData.firstName} ${formData.lastName}`}
                </h1>
                <p className="text-sm text-gray-500">
                  {mode === 'create' ? 'Add new user to the system' : 'Update user information and settings'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-3">
            <div className="p-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <HiUser className="h-5 w-5 mr-2 text-blue-500" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g., John"
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g., Doe"
                  error={errors.lastName}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., john.doe@example.com"
                  error={errors.email}
                  required
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., +1234567890"
                  error={errors.phone}
                  required
                />
              </div>
            </div>

            {mode === 'edit' && (
              <div className="bg-white p-3">
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <HiKey className="h-5 w-5 mr-2 text-blue-500" /> Security Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <HiEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <HiEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mode === 'create' && (
              <div className="bg-white p-3">
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <HiKey className="h-5 w-5 mr-2 text-blue-500" /> Security Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <HiEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm password"
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <HiEyeSlash className="h-5 w-5 text-gray-400" />
                        ) : (
                          <HiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <HiBuildingOffice2 className="h-5 w-5 mr-2 text-blue-500" /> Work Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  options={roleOptions}
                  error={errors.role}
                  required
                />
                <Select
                  label="Branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  options={branchOptions}
                  error={errors.branch}
                  required
                />
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active User
                  </label>
                </div>
                {formData.role === 'sales_executive' && (
                  <div className="flex items-center">
                    <input
                      id="allowWebLogin"
                      name="allowWebLogin"
                      type="checkbox"
                      checked={formData.allowWebLogin}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allowWebLogin" className="ml-2 block text-sm text-gray-900">
                      Allow Web App Login
                    </label>
                  </div>
                )}
              </div>
            </div>

            {userError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex items-center">
                  <HiExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Error: {userError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="bg-white p-3">
              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <HiXMark className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={userLoading}
                  className="flex items-center gap-2"
                >
                  <HiCheckCircle className="h-4 w-4" />
                  {mode === 'create' ? 'Create User' : 'Update User'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormPage;

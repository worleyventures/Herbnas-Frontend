import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiBuildingOffice2, HiMapPin, HiCog6Tooth, HiExclamationTriangle, HiCheckCircle } from 'react-icons/hi2';
import { Button, Input, Select } from '../../components/common';
import { createBranch, updateBranch, getBranchById } from '../../redux/actions/branchActions';
import { clearError, clearBranchSuccess } from '../../redux/slices/branchSlice';

const BranchFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  
  // Get branch data from location state or params
  const selectedBranch = location.state?.branch || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const branchId = params.id;
  
  // Get loading states, success states, and branch data from Redux
  const { 
    loading: branchLoading,
    error: branchError,
    branches
  } = useSelector(state => state.branches || {});
  
  // Find the branch by ID if we're editing
  const reduxBranch = mode === 'edit' && branchId ? 
    branches.find(branch => branch._id === branchId) : null;
  
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    branchAddress: '',
    incentiveType: 0,
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Load branch data if editing and we have an ID
  useEffect(() => {
    if (mode === 'edit' && branchId && !selectedBranch) {
      dispatch(getBranchById(branchId));
    }
  }, [dispatch, mode, branchId, selectedBranch]);

  // Initialize form data
  useEffect(() => {
    const branchData = selectedBranch || reduxBranch;
    if (branchData) {
      setFormData({
        branchName: branchData.branchName || '',
        branchCode: branchData.branchCode || '',
        branchAddress: branchData.branchAddress || '',
        incentiveType: branchData.incentiveType || 0,
        isActive: branchData.isActive !== undefined ? branchData.isActive : true
      });
    } else if (mode === 'create') {
      setFormData({
        branchName: '',
        branchCode: '',
        branchAddress: '',
        incentiveType: 0,
        isActive: true
      });
    }
  }, [selectedBranch, reduxBranch, mode]);

  // Handle success states - navigate away from form
  // Note: Success handling will be done in the form submission

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }
    
    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'Branch code is required';
    }
    
    if (!formData.branchAddress.trim()) {
      newErrors.branchAddress = 'Branch address is required';
    }
    
    if (formData.incentiveType < 0) {
      newErrors.incentiveType = 'Incentive type must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const branchData = {
      ...formData,
      incentiveType: parseFloat(formData.incentiveType)
    };

    try {
      if (mode === 'create') {
        await dispatch(createBranch(branchData)).unwrap();
      } else {
        await dispatch(updateBranch({ branchId, branchData })).unwrap();
      }
      // Navigate back on success
      navigate('/branches');
    } catch (error) {
      // Error will be handled by Redux state
      console.error('Error saving branch:', error);
    }
  };

  const handleBack = () => {
    navigate('/branches');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <HiArrowLeft className="h-4 w-4 mr-2" />
                Back to Branches
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {mode === 'create' ? 'Create Branch' : 'Edit Branch'}
                </h1>
                <p className="text-sm text-gray-500">
                  {mode === 'create' ? 'Add a new branch to the system' : 'Update branch information'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiBuildingOffice2 className="h-5 w-5 mr-2 text-[#22c55e]" />
                Branch Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Branch Name *"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Enter branch name"
                  error={errors.branchName}
                  required
                />
                
                <Input
                  label="Branch Code *"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  placeholder="Enter branch code"
                  error={errors.branchCode}
                  required
                />
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Address *
                  </label>
                  <textarea
                    name="branchAddress"
                    value={formData.branchAddress}
                    onChange={handleInputChange}
                    placeholder="Enter branch address"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent ${
                      errors.branchAddress ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.branchAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.branchAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiCog6Tooth className="h-5 w-5 mr-2 text-[#22c55e]" />
                Branch Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Incentive Type"
                  name="incentiveType"
                  type="number"
                  value={formData.incentiveType}
                  onChange={handleInputChange}
                  placeholder="0"
                  error={errors.incentiveType}
                  min="0"
                  step="0.01"
                />
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#22c55e] focus:ring-[#22c55e] border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active Branch
                  </label>
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {branchError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <HiExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Error: {branchError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                size="xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="xs"
                loading={branchLoading}
                className="flex items-center"
              >
                <HiCheckCircle className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Branch' : 'Update Branch'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BranchFormPage;

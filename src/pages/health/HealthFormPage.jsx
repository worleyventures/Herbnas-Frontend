import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiHeart, HiUser, HiCalendar, HiExclamationTriangle, HiCheckCircle, HiPlus, HiXCircle, HiTag, HiXMark } from 'react-icons/hi2';
import { Button, Input, Select } from '../../components/common';
import { createHealthIssue, updateHealthIssue, getHealthIssueById, getAllHealthIssues } from '../../redux/actions/healthActions';
import { clearError, clearSuccess } from '../../redux/slices/healthSlice';

const HealthFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  
  // Get health issue data from location state or params
  const selectedHealthIssue = location.state?.healthIssue || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const healthIssueId = params.id;
  const isEdit = mode === 'edit';
  
  // Get loading states, success states, and health issue data from Redux
  const { 
    createLoading, 
    updateLoading, 
    selectedHealthIssue: reduxHealthIssue, 
    loading: healthIssueLoading,
    createSuccess,
    updateSuccess,
    createError,
    updateError
  } = useSelector(state => state.health || {});
  
  const [formData, setFormData] = useState({
    healthIssue: '',
    gender: 'both',
    maritalStatus: 'both',
    fromAge: '',
    toAge: ''
  });

  const [errors, setErrors] = useState({});

  // Load health issue data if editing and we have an ID
  useEffect(() => {
    if (mode === 'edit' && healthIssueId && !selectedHealthIssue) {
      dispatch(getHealthIssueById(healthIssueId));
    }
  }, [dispatch, mode, healthIssueId, selectedHealthIssue]);

  // Initialize form data
  useEffect(() => {
    const healthIssueData = selectedHealthIssue || reduxHealthIssue;
    if (healthIssueData) {
      setFormData({
        healthIssue: String(healthIssueData.healthIssue || ''),
        gender: healthIssueData.gender || 'both',
        maritalStatus: healthIssueData.maritalStatus || 'both',
        fromAge: String(healthIssueData.fromAge || ''),
        toAge: String(healthIssueData.toAge || '')
      });
    } else if (mode === 'create') {
      setFormData({
        healthIssue: '',
        gender: 'both',
        maritalStatus: 'both',
        fromAge: '',
        toAge: ''
      });
    }
  }, [selectedHealthIssue, reduxHealthIssue, mode]);

  // Handle success states - navigate away from form
  useEffect(() => {
    if (createSuccess) {
      dispatch(clearSuccess());
      // Refresh health issues list after creation
      dispatch(getAllHealthIssues({ page: 1, limit: 1000 }));
      navigate('/health-issues');
    }
  }, [createSuccess, navigate, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      dispatch(clearSuccess());
      // Refresh health issues list after update
      dispatch(getAllHealthIssues({ page: 1, limit: 1000 }));
      navigate('/health-issues');
    }
  }, [updateSuccess, navigate, dispatch]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.healthIssue.trim()) {
      newErrors.healthIssue = 'Health issue is required';
    }
    
    if (formData.fromAge && formData.toAge) {
      const fromAge = parseInt(formData.fromAge);
      const toAge = parseInt(formData.toAge);
      
      if (fromAge > toAge) {
        newErrors.toAge = 'To age must be greater than from age';
      }
    }
    
    if (formData.fromAge && (parseInt(formData.fromAge) < 0 || parseInt(formData.fromAge) > 120)) {
      newErrors.fromAge = 'From age must be between 0 and 120';
    }
    
    if (formData.toAge && (parseInt(formData.toAge) < 0 || parseInt(formData.toAge) > 120)) {
      newErrors.toAge = 'To age must be between 0 and 120';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const healthIssueData = {
      ...formData,
      fromAge: formData.fromAge ? parseInt(formData.fromAge) : null,
      toAge: formData.toAge ? parseInt(formData.toAge) : null
    };

    if (mode === 'create') {
      dispatch(createHealthIssue(healthIssueData));
    } else {
      dispatch(updateHealthIssue({ healthIssueId, healthIssueData }));
    }
  };

  const handleBack = () => {
    navigate('/health-issues');
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <HiHeart className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Edit Health Issue' : 'Add Health Issue'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEdit ? 'Update health issue details' : 'Add new health issue to the system'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/health')}
                variant="outline"
                size="sm"
                icon={HiXMark}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className=" rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiHeart className="h-5 w-5 mr-2 text-[#22c55e]" />
                Health Issue Information
              </h3>
              
              <div className="space-y-4">
                <Input
                  label="Health Issue *"
                  name="healthIssue"
                  value={formData.healthIssue}
                  onChange={handleInputChange}
                  placeholder="Enter health issue name"
                  error={errors.healthIssue}
                  required
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      options={[
                        { value: 'both', label: 'Both' },
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' }
                      ]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marital Status
                    </label>
                    <Select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      options={[
                        { value: 'both', label: 'Both' },
                        { value: 'single', label: 'Single' },
                        { value: 'married', label: 'Married' },
                        { value: 'divorced', label: 'Divorced' },
                        { value: 'widowed', label: 'Widowed' }
                      ]}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="From Age"
                    name="fromAge"
                    type="number"
                    value={formData.fromAge}
                    onChange={handleInputChange}
                    placeholder="0"
                    error={errors.fromAge}
                    min="0"
                    max="120"
                  />
                  
                  <Input
                    label="To Age"
                    name="toAge"
                    type="number"
                    value={formData.toAge}
                    onChange={handleInputChange}
                    placeholder="100"
                    error={errors.toAge}
                    min="0"
                    max="120"
                  />
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {(createError || updateError) && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <HiExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      {createError && `Error creating health issue: ${createError}`}
                      {updateError && `Error updating health issue: ${updateError}`}
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
                loading={createLoading || updateLoading}
                className="flex items-center"
              >
                <HiCheckCircle className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Health Issue' : 'Update Health Issue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthFormPage;


import React, { useState, useEffect } from 'react';
import { HiXMark, HiBuildingOffice2, HiMapPin, HiCog6Tooth } from 'react-icons/hi2';
import { Modal, Button, Input, Select } from '../../common';

const BranchForm = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Branch Form",
  submitText = "Submit",
  initialData = null,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    branchAddress: '',
    incentiveType: 0,
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          branchName: initialData.branchName || '',
          branchCode: initialData.branchCode || '',
          branchAddress: initialData.branchAddress || '',
          incentiveType: initialData.incentiveType || 0,
          isActive: initialData.isActive !== undefined ? initialData.isActive : true
        });
      } else {
        setFormData({
          branchName: '',
          branchCode: '',
          branchAddress: '',
          incentiveType: 0,
          isActive: true
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Handle special cases for specific fields
    if (name === 'isActive') {
      // Convert string values to boolean for isActive field
      processedValue = value === 'true' || value === true;
    } else if (type === 'checkbox') {
      processedValue = checked;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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

    if (formData.incentiveType < 0 || formData.incentiveType > 100) {
      newErrors.incentiveType = 'Incentive type must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert incentiveType to number before submitting
      const submitData = {
        ...formData,
        incentiveType: parseFloat(formData.incentiveType)
      };
      console.log('Branch form data being submitted:', submitData);
      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    setFormData({
      branchName: '',
      branchCode: '',
      branchAddress: '',
      incentiveType: 0,
      isActive: true
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branch Name */}
        <div>
          <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-2">
            Branch Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiBuildingOffice2 className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              id="branchName"
              name="branchName"
              value={formData.branchName}
              onChange={handleInputChange}
              placeholder="Enter branch name"
              className={`pl-10 ${errors.branchName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={loading}
            />
          </div>
          {errors.branchName && (
            <p className="mt-1 text-sm text-red-600">{errors.branchName}</p>
          )}
        </div>

        {/* Branch Code */}
        <div>
          <label htmlFor="branchCode" className="block text-sm font-medium text-gray-700 mb-2">
            Branch Code *
          </label>
          <Input
            type="text"
            id="branchCode"
            name="branchCode"
            value={formData.branchCode}
            onChange={handleInputChange}
            placeholder="Enter branch code (e.g., MUM001)"
            className={errors.branchCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
            disabled={loading}
          />
          {errors.branchCode && (
            <p className="mt-1 text-sm text-red-600">{errors.branchCode}</p>
          )}
        </div>

        {/* Branch Address */}
        <div>
          <label htmlFor="branchAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Branch Address *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMapPin className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="branchAddress"
              name="branchAddress"
              value={formData.branchAddress}
              onChange={handleInputChange}
              placeholder="Enter complete branch address"
              rows={3}
              className={`pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] ${
                errors.branchAddress ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              disabled={loading}
            />
          </div>
          {errors.branchAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.branchAddress}</p>
          )}
        </div>

        {/* Incentive Type */}
        <div>
          <label htmlFor="incentiveType" className="block text-sm font-medium text-gray-700 mb-2">
            Incentive Type (%) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiCog6Tooth className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="number"
              id="incentiveType"
              name="incentiveType"
              value={formData.incentiveType}
              onChange={handleInputChange}
              placeholder="Enter incentive percentage (0-100)"
              min="0"
              max="100"
              className={`pl-10 ${errors.incentiveType ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={loading}
            />
          </div>
          {errors.incentiveType && (
            <p className="mt-1 text-sm text-red-600">{errors.incentiveType}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Select
            id="isActive"
            name="isActive"
            value={formData.isActive.toString()}
            onChange={handleInputChange}
            disabled={loading}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white hover:border-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BranchForm;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiXMark,
  HiDocumentText,
  HiCurrencyDollar,
  HiCube,
  HiCog6Tooth,
  HiCheckCircle
} from 'react-icons/hi2';
import { Button, Input, Select } from '../../common';
import { createProduct } from '../../../redux/actions/productActions';

const AddProduction = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    productName: '',
    batchNumber: '',
    price: '',
    weight: '',
    quantity: '',
    description: '',
    productionStage: 'F1',
    productionStatus: 'not_in_production'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Batch number is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (formData.weight && formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity is required and must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Convert numeric fields
        const submitData = {
          ...formData,
          price: parseFloat(formData.price),
          weight: formData.weight ? parseFloat(formData.weight) : 0,
          quantity: parseInt(formData.quantity)
        };
        
        const result = await dispatch(createProduct(submitData));
        
        if (result.type === 'products/createProduct/fulfilled') {
          // Navigate back to production dashboard
          navigate('/production');
        } else {
          // Handle error
          setErrors({ submit: result.payload || 'Failed to create product' });
        }
      } catch (error) {
        setErrors({ submit: 'An error occurred while creating the product' });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/production');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Production</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create a new product for production tracking
              </p>
            </div>
            <Button
              onClick={handleCancel}
              variant="outline"
              icon={HiXMark}
              size="xs"
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Product Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <HiDocumentText className="h-5 w-5 mr-2 text-[#22c55e]" />
                Product Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Product Name *"
                  value={formData.productName}
                  onChange={(e) => handleChange('productName', e.target.value)}
                  placeholder="Enter product name"
                  error={errors.productName}
                  required
                />
                
                <Input
                  label="Batch Number *"
                  value={formData.batchNumber}
                  onChange={(e) => handleChange('batchNumber', e.target.value)}
                  placeholder="Enter batch number"
                  error={errors.batchNumber}
                  required
                />
                
                <Input
                  label="Price (₹) *"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  error={errors.price}
                  required
                  icon={HiCurrencyDollar}
                />
                
                <Input
                  label="Weight (g)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  placeholder="0.0"
                  error={errors.weight}
                  icon={HiCube}
                />
                
                <Input
                  label="Quantity *"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="0"
                  error={errors.quantity}
                  required
                  icon={HiCube}
                />
              </div>
              
              <div className="mt-6">
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter product description..."
                  type="textarea"
                  rows={3}
                />
              </div>
            </div>

            {/* Production Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <HiCog6Tooth className="h-5 w-5 mr-2 text-[#22c55e]" />
                Production Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Production Stage"
                  value={formData.productionStage}
                  onChange={(e) => handleChange('productionStage', e.target.value)}
                  options={[
                    { value: 'F1', label: 'F1 - Raw Material Preparation' },
                    { value: 'F2', label: 'F2 - Initial Processing' },
                    { value: 'F3', label: 'F3 - Formulation' },
                    { value: 'F4', label: 'F4 - Quality Control' },
                    { value: 'F5', label: 'F5 - Packaging' },
                    { value: 'F6', label: 'F6 - Final Inspection' }
                  ]}
                  placeholder="Select production stage"
                  icon={HiCog6Tooth}
                />
                
                <Select
                  label="Production Status"
                  value={formData.productionStatus}
                  onChange={(e) => handleChange('productionStatus', e.target.value)}
                  options={[
                    { value: 'not_in_production', label: 'Not In Production' },
                    { value: 'in-process', label: 'In Process' },
                    { value: 'on-hold', label: 'On Hold' },
                    { value: 'completed', label: 'Completed' }
                  ]}
                  placeholder="Select production status"
                  icon={HiCheckCircle}
                />
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                size="xs"
                className="hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={loading}
                size="xs"
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Production'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduction;


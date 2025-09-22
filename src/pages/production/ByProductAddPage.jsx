import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiTag,
  HiBuildingOffice2,
  HiCurrencyDollar,
  HiCube,
  HiArrowLeft,
  HiCheckCircle
} from 'react-icons/hi2';
import { Button, Input, Select } from '../../components/common';
import { getAllProducts } from '../../redux/actions/productActions';
import { addNotification } from '../../redux/slices/uiSlice';

const ByProductAddPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    product: '',
    byProductName: '',
    supplierName: '',
    price: '',
    quantity: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { products = [], loading = false } = useSelector((state) => state.products);

  // Load products on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllProducts({ isActive: true }));
    }
  }, [dispatch, isAuthenticated]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.byProductName.trim()) {
      newErrors.byProductName = 'By-product name is required';
    } else if (formData.byProductName.trim().length > 100) {
      newErrors.byProductName = 'By-product name cannot exceed 100 characters';
    }
    
    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    } else if (formData.supplierName.trim().length > 100) {
      newErrors.supplierName = 'Supplier name cannot exceed 100 characters';
    }
    
    if (!formData.price || formData.price === '') {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid non-negative number';
    }
    
    if (!formData.quantity || formData.quantity === '') {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a valid non-negative number';
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
      // Create the by-product object
      const newByProduct = {
        _id: Date.now().toString(), // Simple ID generation
        byProductName: formData.byProductName.trim(),
        supplierName: formData.supplierName.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        product: formData.product ? products.find(p => p._id === formData.product) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to localStorage
      const existingByProducts = JSON.parse(localStorage.getItem('byProducts') || '[]');
      const updatedByProducts = [newByProduct, ...existingByProducts];
      localStorage.setItem('byProducts', JSON.stringify(updatedByProducts));
      
      // Dispatch custom event to notify the dashboard
      window.dispatchEvent(new CustomEvent('byProductAdded', {
        detail: {
          type: 'byProductAdded',
          byProduct: newByProduct
        }
      }));
      
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'By-product created successfully!',
        duration: 3000
      }));
      
      // Navigate back to production dashboard
      navigate('/production');
    } catch (error) {
      console.error('Error creating by-product:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create by-product. Please try again.',
        duration: 5000
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/production');
  };

  const totalValue = formData.price && formData.quantity && 
    !isNaN(formData.price) && !isNaN(formData.quantity) 
    ? (parseFloat(formData.price) * parseInt(formData.quantity)).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* By-Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                By-Product Name *
              </label>
              <Input
                type="text"
                name="byProductName"
                value={formData.byProductName}
                onChange={handleInputChange}
                placeholder="Enter by-product name"
                error={errors.byProductName}
                disabled={isSubmitting}
                icon={HiTag}
                maxLength={100}
                className="w-full"
              />
              {errors.byProductName && (
                <p className="mt-2 text-sm text-red-600">{errors.byProductName}</p>
              )}
            </div>

            {/* Supplier Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Supplier Name *
              </label>
              <Input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                placeholder="Enter supplier name"
                error={errors.supplierName}
                disabled={isSubmitting}
                icon={HiBuildingOffice2}
                maxLength={100}
                className="w-full"
              />
              {errors.supplierName && (
                <p className="mt-2 text-sm text-red-600">{errors.supplierName}</p>
              )}
            </div>

            {/* Price and Quantity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price *
                </label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  error={errors.price}
                  disabled={isSubmitting}
                  icon={HiCurrencyDollar}
                  min="0"
                  step="0.01"
                  className="w-full"
                />
                {errors.price && (
                  <p className="mt-2 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantity *
                </label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  error={errors.quantity}
                  disabled={isSubmitting}
                  icon={HiCube}
                  min="0"
                  step="1"
                  className="w-full"
                />
                {errors.quantity && (
                  <p className="mt-2 text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>
            </div>

            {/* Total Value Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <HiCheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-700">Total Value</span>
                    <p className="text-sm text-gray-500">Price × Quantity</p>
                  </div>
                </div>
                <span className="text-3xl font-bold text-blue-600">
                  ₹{totalValue}
                </span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                disabled={isSubmitting}
                size="xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
                size="xs"
                icon={HiCheckCircle}
              >
                Create By-Product
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ByProductAddPage;

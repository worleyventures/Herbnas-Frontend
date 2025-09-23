import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiShoppingBag, HiXMark, HiCheck, HiArrowLeft } from 'react-icons/hi2';
import { Button, Input, Select, TextArea, InputWithDropdown } from '../common';
import { createProduct, updateProduct } from '../../redux/actions/productActions';
import { addNotification } from '../../redux/slices/uiSlice';

const ProductForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get product from location state (for editing)
  const product = location.state?.product;
  const returnTo = location.state?.returnTo || '/products';
  const isEditing = !!product;

  // Redux state
  const { loading, error } = useSelector((state) => state.products);

  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    category: '',
    description: '',
    quantity: '',
    UOM: 'kg',
    price: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Category options
  const categoryOptions = [
    { value: 'Herbal Medicine', label: 'Herbal Medicine' },
    { value: 'Ayurvedic', label: 'Ayurvedic' },
    { value: 'Supplements', label: 'Supplements' },
    { value: 'Cosmetics', label: 'Cosmetics' },
    { value: 'Health Products', label: 'Health Products' },
    { value: 'Organic', label: 'Organic' },
    { value: 'Traditional Medicine', label: 'Traditional Medicine' },
    { value: 'Wellness', label: 'Wellness' },
    { value: 'Other', label: 'Other' }
  ];

  // UOM options
  const uomOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' }
  ];

  // Initialize form data for editing
  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        productId: product.productId || '',
        productName: product.productName || '',
        category: product.category || '',
        description: product.description || '',
        quantity: product.quantity?.toString() || '',
        UOM: product.UOM || 'kg',
        price: product.price?.toString() || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    }
  }, [isEditing, product]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
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

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    } else if (formData.productName.trim().length < 2) {
      newErrors.productName = 'Product name must be at least 2 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a valid positive number';
    }

    if (!formData.UOM) {
      newErrors.UOM = 'Unit of measure is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid number greater than 0';
    }

    if (formData.productId && !/^[A-Z0-9]+$/.test(formData.productId)) {
      newErrors.productId = 'Product ID must contain only uppercase letters and numbers';
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

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        productId: formData.productId && formData.productId.trim() ? formData.productId.trim().replace(/\s+/g, '') : undefined // Remove spaces and let backend auto-generate if empty
      };

      if (isEditing) {
        await dispatch(updateProduct({ productId: product._id, productData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Product Updated',
          message: 'Product has been updated successfully',
          duration: 3000
        }));
      } else {
        await dispatch(createProduct(productData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Product Created',
          message: 'Product has been created successfully',
          duration: 3000
        }));
      }

      navigate(returnTo);

    } catch (error) {
      console.error('Product form error:', error);
      dispatch(addNotification({
        type: 'error',
        title: isEditing ? 'Update Failed' : 'Creation Failed',
        message: error.message || `Failed to ${isEditing ? 'update' : 'create'} product. Please try again.`,
        duration: 5000
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(returnTo);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <HiShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Product' : 'Create New Product'}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Update product information' : 'Add a new product to the system'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product ID <span className="text-gray-400">(Optional - Auto-generated if empty)</span>
              </label>
              <Input
                type="text"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                placeholder="e.g., PROD001"
                error={errors.productId}
                disabled={isSubmitting}
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Enter product name"
                error={errors.productName}
                disabled={isSubmitting}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={categoryOptions}
                error={errors.category}
                disabled={isSubmitting}
              />
            </div>

            {/* Quantity with UOM */}
            <div>
              <InputWithDropdown
                label="Quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                dropdownName="UOM"
                dropdownValue={formData.UOM}
                onDropdownChange={handleInputChange}
                dropdownOptions={uomOptions}
                dropdownPlaceholder="Select unit"
                placeholder="Enter quantity"
                type="number"
                error={errors.quantity || errors.UOM}
                errorMessage={errors.quantity || errors.UOM}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                error={errors.price}
                disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                name="isActive"
                value={formData.isActive}
                onChange={handleInputChange}
                options={[
                  { value: true, label: 'Active' },
                  { value: false, label: 'Inactive' }
                ]}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={4}
              error={errors.description}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            icon={HiCheck}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

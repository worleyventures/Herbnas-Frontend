import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiDocumentText, HiTag, HiCurrencyDollar, HiCube, HiExclamationTriangle, HiCog6Tooth, HiCheckCircle } from 'react-icons/hi2';
import { Button, Input, Select } from '../../components/common';
import { createProduct, updateProduct, getProductById } from '../../redux/actions/productActions';
import { clearError, clearSuccess } from '../../redux/slices/productSlice';

const ProductFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  
  // Get product data from location state or params
  const selectedProduct = location.state?.product || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const productId = params.id;
  
  // Get loading states, success states, and product data from Redux
  const { 
    createLoading, 
    updateLoading, 
    selectedProduct: reduxProduct, 
    loading: productLoading,
    createSuccess,
    updateSuccess,
    createError,
    updateError
  } = useSelector(state => state.products || {});
  
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

  // Load product data if editing and we have an ID
  useEffect(() => {
    if (mode === 'edit' && productId && !selectedProduct) {
      dispatch(getProductById(productId));
    }
  }, [dispatch, mode, productId, selectedProduct]);

  // Initialize form data
  useEffect(() => {
    const productData = selectedProduct || reduxProduct;
    if (productData) {
      setFormData({
        productName: productData.productName || '',
        batchNumber: productData.batchNumber || '',
        price: productData.price || '',
        weight: productData.weight || '',
        quantity: productData.quantity || '',
        description: productData.description || '',
        productionStage: productData.productionStage || 'F1',
        productionStatus: productData.productionStatus || 'not_in_production'
      });
    } else if (mode === 'create') {
      setFormData({
        productName: '',
        batchNumber: '',
        price: '',
        weight: '',
        quantity: '',
        description: '',
        productionStage: 'F1',
        productionStatus: 'not_in_production'
      });
    }
  }, [selectedProduct, reduxProduct, mode]);

  // Handle success states - navigate away from form
  useEffect(() => {
    if (createSuccess) {
      dispatch(clearSuccess());
      navigate('/products');
    }
  }, [createSuccess, navigate, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      dispatch(clearSuccess());
      navigate('/products');
    }
  }, [updateSuccess, navigate, dispatch]);

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
    
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Valid quantity is required';
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

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      quantity: parseInt(formData.quantity)
    };

    if (mode === 'create') {
      dispatch(createProduct(productData));
    } else {
      dispatch(updateProduct({ productId, productData }));
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-white">
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
                Back to Products
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {mode === 'create' ? 'Create Product' : 'Edit Product'}
                </h1>
                <p className="text-sm text-gray-500">
                  {mode === 'create' ? 'Add a new product to the system' : 'Update product information'}
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
                <HiDocumentText className="h-5 w-5 mr-2 text-[#22c55e]" />
                Product Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Stage
                  </label>
                  <Select
                    value={formData.productionStage}
                    onChange={(e) => handleChange('productionStage', e.target.value)}
                    options={[
                      { value: 'F1', label: 'F1' },
                      { value: 'F2', label: 'F2' },
                      { value: 'F3', label: 'F3' },
                      { value: 'F4', label: 'F4' },
                      { value: 'F5', label: 'F5' }
                    ]}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter product description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Production Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiCog6Tooth className="h-5 w-5 mr-2 text-[#22c55e]" />
                Production Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Production Status
                  </label>
                  <Select
                    value={formData.productionStatus}
                    onChange={(e) => handleChange('productionStatus', e.target.value)}
                    options={[
                      { value: 'not_in_production', label: 'Not in Production' },
                      { value: 'in_process', label: 'In Process' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'on_hold', label: 'On Hold' }
                    ]}
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
                      {createError && `Error creating product: ${createError}`}
                      {updateError && `Error updating product: ${updateError}`}
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
                {mode === 'create' ? 'Create Product' : 'Update Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;

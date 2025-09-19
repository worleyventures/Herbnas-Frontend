import React, { useState, useEffect } from 'react';
import { HiXMark, HiDocumentText, HiTag, HiCurrencyDollar, HiCube, HiExclamationTriangle, HiCog6Tooth, HiCheckCircle } from 'react-icons/hi2';
import { Modal, Button, Input, Select } from '../../common';
import { useSelector } from 'react-redux';

const ProductForm = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Product Form",
  submitText = "Submit",
  initialData = null,
  loading = false
}) => {
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



  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          productName: initialData.productName || '',
          batchNumber: initialData.batchNumber || '',
          price: initialData.price || '',
          weight: initialData.weight || '',
          quantity: initialData.quantity || '',
          description: initialData.description || '',
          productionStage: initialData.productionStage || 'F1',
          productionStatus: initialData.productionStatus || 'in-process'
        });
      } else {
        // Reset form for new product
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
      setErrors({});
    }
  }, [isOpen, initialData]);

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
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert numeric fields
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        weight: formData.weight ? parseFloat(formData.weight) : 0,
        quantity: parseInt(formData.quantity)
      };
      
      onSubmit(submitData);
    }
  };

  // Handle close
  const handleClose = () => {
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
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
              icon={HiCube}
            />
          </div>
          
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter product description..."
            type="textarea"
            rows={3}
          />
        </div>

        {/* Production Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HiCog6Tooth className="h-5 w-5 mr-2 text-[#22c55e]" />
            Production Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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


        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            size="xs"
            className="hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white hover:border-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={loading}
            size="xs"
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

export default ProductForm;

import React, { useState, useEffect } from 'react';
import { HiXMark, HiCube, HiBuildingOffice2, HiExclamationTriangle, HiInformationCircle, HiPlus } from 'react-icons/hi2';
import { Modal, Button, Input, Select } from '../../common';
import ProductSelectWithCreate from '../../common/ProductSelectWithCreate';
import { useDispatch } from 'react-redux';
import { createProduct } from '../../../redux/actions/productActions';
import { addNotification } from '../../../redux/slices/uiSlice';

const InventoryForm = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Inventory Form",
  submitText = "Submit",
  initialData = null,
  loading = false,
  products = [],
  onProductCreated
}) => {
  const dispatch = useDispatch();
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      productId: '',
      batchId: '',
      availableStock: '',
      minStockLevel: '',
      maxStockLevel: '',
      stockUpdate: '',
      stockUpdateType: 'add' // 'add', 'subtract', 'set'
    }
  ]);

  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData && Array.isArray(initialData)) {
        // Multiple items for edit
        setInventoryItems(initialData.map((item, index) => ({
          id: index + 1,
          productId: item.product?._id || item.product || '',
          batchId: item.batchId || '',
          availableStock: item.availableStock || '',
          minStockLevel: item.minStockLevel || '',
          maxStockLevel: item.maxStockLevel || '',
          stockUpdate: '',
          stockUpdateType: 'add'
        })));
      } else if (initialData) {
        // Single item for edit
        setInventoryItems([{
          id: 1,
          productId: initialData.product?._id || initialData.product || '',
          batchId: initialData.batchId || '',
          availableStock: initialData.availableStock || '',
          minStockLevel: initialData.minStockLevel || '',
          maxStockLevel: initialData.maxStockLevel || '',
          stockUpdate: '',
          stockUpdateType: 'add'
        }]);
      } else {
        // New inventory
        setInventoryItems([{
          id: 1,
          productId: '',
          batchId: '',
          availableStock: '',
          minStockLevel: '',
          maxStockLevel: '',
          stockUpdate: '',
          stockUpdateType: 'add'
        }]);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (itemId, field, value) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    );
    
    // Clear errors for this field
    if (errors[`${itemId}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${itemId}_${field}`]: ''
      }));
    }
  };

  const handleSelectChange = (itemId, field, value) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    );
    
    // Clear errors for this field
    if (errors[`${itemId}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${itemId}_${field}`]: ''
      }));
    }
  };

  const addInventoryItem = () => {
    const newId = Math.max(...inventoryItems.map(item => item.id)) + 1;
    setInventoryItems(prev => [...prev, {
      id: newId,
      productId: '',
      batchId: '',
      availableStock: '',
      minStockLevel: '',
      maxStockLevel: '',
      stockUpdate: '',
      stockUpdateType: 'add'
    }]);
  };

  const removeInventoryItem = (itemId) => {
    if (inventoryItems.length > 1) {
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    inventoryItems.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`${item.id}_productId`] = 'Product is required';
      }

      if (!item.batchId.trim()) {
        newErrors[`${item.id}_batchId`] = 'Batch ID is required';
      }

      if (item.availableStock === '' || item.availableStock < 0) {
        newErrors[`${item.id}_availableStock`] = 'Available stock must be 0 or greater';
      }

      if (item.minStockLevel === '' || item.minStockLevel < 0) {
        newErrors[`${item.id}_minStockLevel`] = 'Minimum stock level must be 0 or greater';
      }

      if (item.maxStockLevel === '' || item.maxStockLevel < 0) {
        newErrors[`${item.id}_maxStockLevel`] = 'Maximum stock level must be 0 or greater';
      }

      if (parseInt(item.minStockLevel) > parseInt(item.maxStockLevel)) {
        newErrors[`${item.id}_maxStockLevel`] = 'Maximum stock level must be greater than minimum stock level';
      }

      // Validate stock update if provided
      if (item.stockUpdate !== '' && item.stockUpdate !== null) {
        if (item.stockUpdate < 0) {
          newErrors[`${item.id}_stockUpdate`] = 'Stock update must be 0 or greater';
        }
        if (item.stockUpdateType === 'subtract' && item.stockUpdate > (item.availableStock || 0)) {
          newErrors[`${item.id}_stockUpdate`] = 'Cannot subtract more stock than available';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        inventoryItems: inventoryItems.map(item => ({
          productId: item.productId,
          batchId: item.batchId.trim(),
          availableStock: parseInt(item.availableStock) || 0,
          minStockLevel: parseInt(item.minStockLevel) || 10,
          maxStockLevel: parseInt(item.maxStockLevel) || 1000,
          stockUpdate: item.stockUpdate !== '' ? parseInt(item.stockUpdate) : null,
          stockUpdateType: item.stockUpdate !== '' ? item.stockUpdateType : null
        }))
      };
      
      onSubmit(submitData);
    }
  };

  const handleClose = () => {
    setInventoryItems([{
      id: 1,
      productId: '',
      batchId: '',
      availableStock: '',
      minStockLevel: '',
      maxStockLevel: '',
      stockUpdate: '',
      stockUpdateType: 'add'
    }]);
    setErrors({});
    onClose();
  };

  const handleAddNewProduct = async (newProductData) => {
    try {
      const result = await dispatch(createProduct(newProductData)).unwrap();
      
      // Set the newly created product as selected for the first item
      setInventoryItems(prev => 
        prev.map((item, index) => 
          index === 0 
            ? { ...item, productId: result.data.product._id }
            : item
        )
      );
      
      // Call the callback to refresh products list
      if (onProductCreated) {
        onProductCreated();
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Product Created',
        message: 'New product created successfully!',
        duration: 3000
      }));
      
      return result;
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error || 'Failed to create product',
        duration: 5000
      }));
      throw error;
    }
  };

  // Prepare options for selects
  const productOptions = products.map(product => ({
    value: product._id,
    label: product.productName
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Inventory Items */}
        {inventoryItems.map((item, index) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Product {index + 1}
              </h4>
              {inventoryItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInventoryItem(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Product Selection */}
            <div>
              <ProductSelectWithCreate
                value={item.productId}
                onChange={(value) => handleSelectChange(item.id, 'productId', value)}
                onAddNew={handleAddNewProduct}
                options={productOptions}
                placeholder="Select or add a product"
                error={!!errors[`${item.id}_productId`]}
                errorMessage={errors[`${item.id}_productId`]}
                label="Product *"
              />
            </div>

            {/* Batch ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch ID *
              </label>
              <Input
                type="text"
                value={item.batchId}
                onChange={(e) => handleInputChange(item.id, 'batchId', e.target.value)}
                placeholder="Enter batch ID (e.g., BATCH001)"
                error={!!errors[`${item.id}_batchId`]}
              />
              {errors[`${item.id}_batchId`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`${item.id}_batchId`]}</p>
              )}
            </div>

            {/* Available Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Stock *
              </label>
              <Input
                type="number"
                value={item.availableStock}
                onChange={(e) => handleInputChange(item.id, 'availableStock', e.target.value)}
                placeholder="Enter available stock"
                min="0"
                error={!!errors[`${item.id}_availableStock`]}
              />
              {errors[`${item.id}_availableStock`] && (
                <p className="mt-1 text-sm text-red-600">{errors[`${item.id}_availableStock`]}</p>
              )}
            </div>

            {/* Stock Level Thresholds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <HiExclamationTriangle className="h-4 w-4 text-red-500 mr-1" />
                    Minimum Stock Level *
                  </div>
                </label>
                <Input
                  type="number"
                  value={item.minStockLevel}
                  onChange={(e) => handleInputChange(item.id, 'minStockLevel', e.target.value)}
                  placeholder="Enter minimum stock level"
                  min="0"
                  error={!!errors[`${item.id}_minStockLevel`]}
                />
                {errors[`${item.id}_minStockLevel`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${item.id}_minStockLevel`]}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Alert when stock falls below this level
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <HiInformationCircle className="h-4 w-4 text-yellow-500 mr-1" />
                    Maximum Stock Level *
                  </div>
                </label>
                <Input
                  type="number"
                  value={item.maxStockLevel}
                  onChange={(e) => handleInputChange(item.id, 'maxStockLevel', e.target.value)}
                  placeholder="Enter maximum stock level"
                  min="0"
                  error={!!errors[`${item.id}_maxStockLevel`]}
                />
                {errors[`${item.id}_maxStockLevel`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${item.id}_maxStockLevel`]}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Alert when stock exceeds this level
                </p>
              </div>
            </div>

            {/* Stock Update Section */}
            <div className="border-t border-gray-200 pt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Stock Update (Optional)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Type
                  </label>
                  <Select
                    value={item.stockUpdateType}
                    onChange={(value) => handleSelectChange(item.id, 'stockUpdateType', value)}
                    options={[
                      { value: 'add', label: 'Add Stock' },
                      { value: 'subtract', label: 'Subtract Stock' },
                      { value: 'set', label: 'Set Stock' }
                    ]}
                    placeholder="Select update type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    value={item.stockUpdate}
                    onChange={(e) => handleInputChange(item.id, 'stockUpdate', e.target.value)}
                    placeholder="Enter quantity"
                    min="0"
                    error={!!errors[`${item.id}_stockUpdate`]}
                  />
                  {errors[`${item.id}_stockUpdate`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`${item.id}_stockUpdate`]}</p>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {item.stockUpdateType === 'add' && 'Add this quantity to current stock'}
                {item.stockUpdateType === 'subtract' && 'Subtract this quantity from current stock'}
                {item.stockUpdateType === 'set' && 'Set stock to this exact quantity'}
              </div>
            </div>
          </div>
        ))}

        {/* Add More Products Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={addInventoryItem}
            icon={HiPlus}
          >
            Add Another Product
          </Button>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            size="xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            size="xs"
          >
            {loading ? 'Processing...' : submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InventoryForm;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiCube, HiBuildingOffice2, HiExclamationTriangle, HiCheckCircle, HiPlus, HiXCircle } from 'react-icons/hi2';
import { Button, Input, Select } from '../../components/common';
import { createOrUpdateInventory } from '../../redux/actions/inventoryActions';
import { clearError, clearSuccess } from '../../redux/slices/inventorySlice';

const InventoryFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  
  // Get inventory data from location state or params
  const selectedInventory = location.state?.inventory || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const inventoryId = params.id;
  
  // Get loading states, success states, and inventory data from Redux
  const { 
    loading: inventoryLoading,
    error: inventoryError,
    inventory
  } = useSelector(state => state.inventory || {});
  
  // Find the inventory by ID if we're editing
  const reduxInventory = mode === 'edit' && inventoryId ? 
    inventory.find(item => item._id === inventoryId) : null;
  
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      productId: '',
      batchId: '',
      availableStock: '',
      minStockLevel: '',
      maxStockLevel: '',
      stockUpdate: '',
      stockUpdateType: 'add'
    }
  ]);

  const [errors, setErrors] = useState({});

  // Note: For editing, inventory data should be passed through location state

  // Initialize form data
  useEffect(() => {
    const inventoryData = selectedInventory || reduxInventory;
    if (inventoryData && Array.isArray(inventoryData)) {
      setInventoryItems(inventoryData.map((item, index) => ({
        id: index + 1,
        productId: item.product?._id || item.product || '',
        batchId: item.batchId || '',
        availableStock: item.availableStock || '',
        minStockLevel: item.minStockLevel || '',
        maxStockLevel: item.maxStockLevel || '',
        stockUpdate: '',
        stockUpdateType: 'add'
      })));
    } else if (mode === 'create') {
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
  }, [selectedInventory, reduxInventory, mode]);

  // Handle success states - navigate away from form
  // Note: Success handling will be done in the form submission

  // Handle input changes
  const handleInputChange = (itemId, field, value) => {
    setInventoryItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    );
    
    // Clear error when user starts typing
    if (errors[`${itemId}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${itemId}_${field}`];
        return newErrors;
      });
    }
  };

  // Add new inventory item
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

  // Remove inventory item
  const removeInventoryItem = (itemId) => {
    if (inventoryItems.length > 1) {
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    inventoryItems.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`${item.id}_productId`] = 'Product is required';
      }
      if (!item.batchId) {
        newErrors[`${item.id}_batchId`] = 'Batch ID is required';
      }
      if (!item.availableStock) {
        newErrors[`${item.id}_availableStock`] = 'Available stock is required';
      }
      if (item.minStockLevel && item.maxStockLevel) {
        const minStock = parseInt(item.minStockLevel);
        const maxStock = parseInt(item.maxStockLevel);
        if (minStock > maxStock) {
          newErrors[`${item.id}_maxStockLevel`] = 'Max stock must be greater than min stock';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const inventoryData = inventoryItems.map(item => ({
      product: item.productId,
      batchId: item.batchId,
      availableStock: parseInt(item.availableStock),
      minStockLevel: item.minStockLevel ? parseInt(item.minStockLevel) : 0,
      maxStockLevel: item.maxStockLevel ? parseInt(item.maxStockLevel) : 0
    }));

    try {
      await dispatch(createOrUpdateInventory(inventoryData)).unwrap();
      // Navigate back on success
      navigate('/inventory');
    } catch (error) {
      // Error will be handled by Redux state
      console.error('Error saving inventory:', error);
    }
  };

  const handleBack = () => {
    navigate('/inventory');
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
                Back to Inventory
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {mode === 'create' ? 'Create Inventory' : 'Edit Inventory'}
                </h1>
                <p className="text-sm text-gray-500">
                  {mode === 'create' ? 'Add new inventory items to the system' : 'Update inventory information'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Inventory Items */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <HiCube className="h-5 w-5 mr-2 text-[#22c55e]" />
                  Inventory Items
                </h3>
                <Button
                  type="button"
                  onClick={addInventoryItem}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <HiPlus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-6">
                {inventoryItems.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Item {index + 1}</h4>
                      {inventoryItems.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeInventoryItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <HiXCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product *
                        </label>
                        <Select
                          value={item.productId}
                          onChange={(e) => handleInputChange(item.id, 'productId', e.target.value)}
                          options={[
                            { value: '', label: 'Select Product' },
                            // Add product options here
                          ]}
                        />
                        {errors[`${item.id}_productId`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`${item.id}_productId`]}</p>
                        )}
                      </div>
                      
                      <Input
                        label="Batch ID *"
                        name="batchId"
                        value={item.batchId}
                        onChange={(e) => handleInputChange(item.id, 'batchId', e.target.value)}
                        placeholder="Enter batch ID"
                        error={errors[`${item.id}_batchId`]}
                        required
                      />
                      
                      <Input
                        label="Available Stock *"
                        name="availableStock"
                        type="number"
                        value={item.availableStock}
                        onChange={(e) => handleInputChange(item.id, 'availableStock', e.target.value)}
                        placeholder="0"
                        error={errors[`${item.id}_availableStock`]}
                        min="0"
                        required
                      />
                      
                      <Input
                        label="Min Stock Level"
                        name="minStockLevel"
                        type="number"
                        value={item.minStockLevel}
                        onChange={(e) => handleInputChange(item.id, 'minStockLevel', e.target.value)}
                        placeholder="0"
                        error={errors[`${item.id}_minStockLevel`]}
                        min="0"
                      />
                      
                      <Input
                        label="Max Stock Level"
                        name="maxStockLevel"
                        type="number"
                        value={item.maxStockLevel}
                        onChange={(e) => handleInputChange(item.id, 'maxStockLevel', e.target.value)}
                        placeholder="0"
                        error={errors[`${item.id}_maxStockLevel`]}
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Messages */}
            {inventoryError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <HiExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Error: {inventoryError}
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
                loading={inventoryLoading}
                className="flex items-center"
              >
                <HiCheckCircle className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Inventory' : 'Update Inventory'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryFormPage;
